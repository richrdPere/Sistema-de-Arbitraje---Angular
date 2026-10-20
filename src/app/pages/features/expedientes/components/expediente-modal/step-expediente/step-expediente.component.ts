import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject, distinctUntilChanged, map, takeUntil } from 'rxjs';

// Directives
import { UppercaseDirective } from 'src/app/shared/directives/uppercase.directive';

// Services
import { ExpedienteData, ExpedienteFormService } from 'src/app/pages/features/expedientes/services/expedientes-form.service';

// Interfaces
import { ExpedienteTipo } from 'src/app/pages/features/expedientes/interfaces';

// ==========================================================
// VALIDADORES
// ==========================================================

function textoMinimo(longitud: number): ValidatorFn {
  return (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const valor = String(control.value ?? '').trim();

    if (!valor) {
      return { required: true };
    }

    return valor.length >= longitud
      ? null
      : {
        minlength: {
          requiredLength: longitud,
          actualLength: valor.length,
        },
      };
  };
}

@Component({
  selector: 'step-expediente',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    UppercaseDirective,
  ],
  templateUrl: './step-expediente.component.html',
  styles: ``,
})
export class StepExpedienteComponent implements OnInit, OnDestroy {

  // ==========================================================
  // OUTPUTS
  // ==========================================================

  @Output() nextStep = new EventEmitter<void>();
  @Output() prevStep = new EventEmitter<void>();

  // ==========================================================
  // FORMULARIO Y ESTADO
  // ==========================================================

  form!: FormGroup;

  modoEdicion = false;
  errorFormulario = '';

  readonly tipoArbitraje: {
    value: ExpedienteTipo;
    label: string;
  }[] = [
      {
        value: 'ARBITRAJE_INSTITUCIONAL',
        label: 'Arbitraje Institucional',
      },
      {
        value: 'ARBITRAJE_DE_EMERGENCIA',
        label: 'Arbitraje de Emergencia',
      },
      {
        value: 'ARBITRAJE_AD_HOC',
        label: 'Arbitraje Ad Hoc',
      },
    ];

  readonly tipoSolicitudToCodigo: Record<
    ExpedienteTipo,
    string
  > = {
      ARBITRAJE_DE_EMERGENCIA: 'AE-FIRMA-LEGAL',
      ARBITRAJE_AD_HOC: 'AD HOC-FIRMA-LEGAL',
      ARBITRAJE_INSTITUCIONAL: 'CA-FIRMA-LEGAL',
    };

  private readonly destroy$ = new Subject<void>();

  // ==========================================================
  // CONSTRUCTOR
  // ==========================================================

  constructor(
    private readonly fb: FormBuilder,
    private readonly expedienteFormService: ExpedienteFormService,
  ) { }

  // ==========================================================
  // CICLO DE VIDA
  // ==========================================================

  ngOnInit(): void {
    this.initFormExpediente();

    this.listenModoEdicion();
    this.listenDatosExpediente();
    this.listenTipo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================================
  // FORMULARIO
  // ==========================================================

  initFormExpediente(): void {
    this.form = this.fb.group({
      titulo: [
        '',
        [
          Validators.required,
          textoMinimo(3),
        ],
      ],

      // Campo opcional según el contrato de la API.
      descripcion: [''],

      tipo: [
        null,
        [
          Validators.required,
          this.validarTipo(),
        ],
      ],

      // Se envía mediante getRawValue().
      codigo: [
        {
          value: '',
          disabled: true,
        },
      ],

      // Fecha sugerida para creación, pero no obligatoria.
      fecha_inicio: [this.getFechaHoy()],

      fecha_laudo: [null],
      fecha_resolucion: [null],
    });
  }

  // ==========================================================
  // ESTADO COMPARTIDO
  // ==========================================================

  private listenModoEdicion(): void {
    this.expedienteFormService.modoEdicion$
      .pipe(takeUntil(this.destroy$))
      .subscribe((modoEdicion) => {
        this.modoEdicion = modoEdicion;
      });
  }

  private listenDatosExpediente(): void {
    this.expedienteFormService.formData$
      .pipe(
        map((data) => data.expediente),

        // Cambiar únicamente persona no recarga este formulario.
        distinctUntilChanged(),

        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.loadDataExpediente();
      });
  }

  // ==========================================================
  // CARGAR DATOS
  // ==========================================================

  loadDataExpediente(): void {
    const data =
      this.expedienteFormService.getExpediente();

    const tieneDatos = Object.keys(data).length > 0;

    const tipo = data.tipo ?? null;

    // Mantiene el código guardado.
    // Solo genera uno si el campo no fue proporcionado.
    const codigo =
      data.codigo ??
      this.obtenerCodigoPorTipo(tipo);

    this.form.reset(
      {
        titulo: data.titulo ?? '',
        descripcion: data.descripcion ?? '',
        tipo,
        codigo,

        // Conserva null cuando el usuario deja la fecha vacía.
        // Sugiere hoy únicamente para un formulario nuevo.
        fecha_inicio:
          data.fecha_inicio !== undefined
            ? data.fecha_inicio
            : tieneDatos
              ? null
              : this.modoEdicion
                ? null
                : this.getFechaHoy(),

        fecha_laudo: data.fecha_laudo ?? null,
        fecha_resolucion: data.fecha_resolucion ?? null,
      },
      { emitEvent: false },
    );

    this.errorFormulario = '';
  }

  // ==========================================================
  // AUTOCÓDIGO
  // ==========================================================

  listenTipo(): void {
    this.form.get('tipo')?.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe((tipo: unknown) => {
        this.form.get('codigo')?.setValue(
          this.obtenerCodigoPorTipo(tipo),
          { emitEvent: false },
        );

        this.errorFormulario = '';
      });
  }

  private obtenerCodigoPorTipo(tipo: unknown): string {
    return this.esTipoExpediente(tipo)
      ? this.tipoSolicitudToCodigo[tipo]
      : '';
  }

  private esTipoExpediente(
    tipo: unknown,
  ): tipo is ExpedienteTipo {
    return (
      tipo === 'ARBITRAJE_INSTITUCIONAL' ||
      tipo === 'ARBITRAJE_DE_EMERGENCIA' ||
      tipo === 'ARBITRAJE_AD_HOC'
    );
  }

  private validarTipo(): ValidatorFn {
    return (
      control: AbstractControl,
    ): ValidationErrors | null => {
      const valor: unknown = control.value;

      // El validador required controla el campo vacío.
      if (valor === null || valor === undefined || valor === '') {
        return null;
      }

      return this.esTipoExpediente(valor)
        ? null
        : { tipoInvalido: true };
    };
  }

  // ==========================================================
  // PREPARAR DATOS PARA EL SERVICE DEL FORMULARIO
  // ==========================================================

  private obtenerDatosFormulario(): ExpedienteData {
    const valores = this.form.getRawValue();

    return {
      titulo: String(valores.titulo ?? '').trim(),
      descripcion: String(valores.descripcion ?? '').trim(),
      tipo: String(valores.tipo ?? ''),
      codigo: String(valores.codigo ?? '').trim(),

      fecha_inicio: this.normalizarFecha(
        valores.fecha_inicio,
      ),

      fecha_laudo: this.normalizarFecha(
        valores.fecha_laudo,
      ),

      fecha_resolucion: this.normalizarFecha(
        valores.fecha_resolucion,
      ),
    };
  }

  private normalizarFecha(valor: unknown): string | null {
    if (typeof valor !== 'string') {
      return null;
    }

    const fecha = valor.trim();

    return fecha || null;
  }

  // ==========================================================
  // HELPERS
  // ==========================================================

  getFechaHoy(): string {
    // Usa la fecha local, evitando el cambio de día
    // que puede producir toISOString() al convertir a UTC.
    const hoy = new Date();

    const anio = hoy.getFullYear();
    const mes = String(
      hoy.getMonth() + 1,
    ).padStart(2, '0');
    const dia = String(
      hoy.getDate(),
    ).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  esRequerido(campo: string): boolean {
    return (
      this.form.get(campo)?.hasValidator(
        Validators.required,
      ) ?? false
    );
  }

  // ==========================================================
  // NAVEGACIÓN
  // ==========================================================

  continuar(): void {
    this.errorFormulario = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = this.obtenerDatosFormulario();

    // Los controles disabled no participan en la validación
    // de FormGroup; por eso verificamos el código aquí.
    if (!data.codigo) {
      this.errorFormulario =
        'No se pudo determinar el código del expediente. Revisa el tipo de arbitraje.';
      return;
    }

    this.expedienteFormService.setExpediente(data);

    this.nextStep.emit();
  }

  volver(): void {
    // Conserva el borrador aunque todavía esté incompleto.
    this.expedienteFormService.setExpediente(
      this.obtenerDatosFormulario(),
    );

    this.prevStep.emit();
  }
}

// import { CommonModule } from '@angular/common';
// import { Component, OnInit, Output, EventEmitter } from '@angular/core';
// import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// // Directives
// import { UppercaseDirective } from 'src/app/shared/directives/uppercase.directive';

// // Service
// import { ExpedienteFormService } from 'src/app/pages/features/expedientes/services/expedientes-form.service';


// @Component({
//   selector: 'step-expediente',
//   imports: [ReactiveFormsModule, CommonModule, UppercaseDirective],
//   templateUrl: './step-expediente.component.html',
//   styles: ``
// })
// export class StepExpedienteComponent implements OnInit {

//   @Output() nextStep = new EventEmitter<void>();
//   @Output() prevStep = new EventEmitter<void>();

//   form!: FormGroup;
//   // tipoExpedienteSeleccionado: string | null = null;

//   // Selector
//   tipoArbitraje = [
//     { value: 'Arbitraje Institucional', label: 'Arbitraje Institucional' },
//     { value: 'Arbitraje de Emergencia', label: 'Arbitraje de Emergencia' },
//     { value: 'Arbitraje Ad Hoc', label: 'Arbitraje Ad Hoc' }
//   ];

//   // MAPEO A CÓDIGO
//   tipoSolicitudToCodigo: any = {
//     'Arbitraje de Emergencia': 'AE-FIRMA-LEGAL',
//     'Arbitraje Ad Hoc': 'AD HOC-FIRMA-LEGAL',
//     'Arbitraje Institucional': 'CA-FIRMA-LEGAL',
//   };

//   constructor(
//     private fb: FormBuilder,
//     private expedienteFormService: ExpedienteFormService,
//   ) { }

//   ngOnInit(): void {
//     this.initFormExpediente();
//     this.loadDataExpediente();
//     this.listenTipo();
//   }

//   // =========================
//   // FORMULARIO
//   // =========================
//   initFormExpediente() {
//     this.form = this.fb.group({
//       titulo: ['', [Validators.required, Validators.minLength(3)]],
//       descripcion: ['', [Validators.required, Validators.minLength(5)]],
//       tipo: [null, Validators.required],
//       codigo: [{ value: '', disabled: true }, Validators.required],
//       fecha_inicio: [this.getFechaHoy(), Validators.required],
//       fecha_laudo: [null],
//       fecha_resolucion: [null],
//     });
//   }

//   // - CARGAR DATOS (EDICIÓN)
//   loadDataExpediente() {
//     const data = this.expedienteFormService.getExpediente();

//     if (data && Object.keys(data).length > 0) {
//       this.form.patchValue(data);

//       // Si ya hay tipo, recalcular código
//       if (data.tipo) {
//         const codigo = this.tipoSolicitudToCodigo[data.tipo] || '';
//         this.form.get('codigo')?.setValue(codigo);
//       }
//     }
//   }

//   // - AUTOCÓDIGO
//   listenTipo() {
//     this.form.get('tipo')?.valueChanges.subscribe(tipo => {
//       const codigo = this.tipoSolicitudToCodigo[tipo] || '';
//       this.form.get('codigo')?.setValue(codigo);
//     });
//   }

//   // =========================
//   // HELPERS
//   // =========================

//   // - Fecha hoy
//   getFechaHoy(): string {
//     const hoy = new Date();
//     return hoy.toISOString().split('T')[0];
//   }


//   // - Es requerido
//   esRequerido(campo: string): boolean {
//     const control = this.form.get(campo);
//     return control?.hasValidator(Validators.required) ?? false;
//   }

//   // =========================
//   // NAVEGACIÓN
//   // =========================
//   continuar() {
//     if (this.form.invalid) {
//       this.form.markAllAsTouched();
//       return;
//     }

//     // IMPORTANTE: incluir campos disabled
//     const data = this.form.getRawValue();
//     this.expedienteFormService.setExpediente(data);
//     this.nextStep.emit();
//   }

//   volver() {
//     this.prevStep.emit();
//   }
// }
