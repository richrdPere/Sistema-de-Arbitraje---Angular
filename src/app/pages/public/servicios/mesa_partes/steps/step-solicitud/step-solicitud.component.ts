import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Directives
import { UppercaseDirective } from 'src/app/shared/directives/uppercase.directive';

// Pipes
import { FileSizePipe } from 'src/app/shared/pipes/size-file.pipe';
import { TruncatePipe } from 'src/app/shared/pipes/truncate.pipe';

// Service
import { MesaPartesFormService } from 'src/app/pages/features/solicitudes/services/mesa-partes-form.service';

const textoObligatorio: ValidatorFn = (control) =>
  typeof control.value === 'string' &&
    control.value.trim().length > 0
    ? null
    : { required: true };

@Component({
  selector: 'step-solicitud',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UppercaseDirective,
    FileSizePipe,
    TruncatePipe,
  ],
  templateUrl: './step-solicitud.component.html',
  styles: ``,
})
export class StepSolicitudComponent implements OnInit, OnDestroy {

  private readonly destroyRef = inject(DestroyRef);

  @Output() nextStep = new EventEmitter<void>();
  @Output() prevStep = new EventEmitter<void>();

  form!: FormGroup;
  archivos: File[] = [];

  descripcionTipoArbitraje: string | null = null;
  colorAlerta = '#3b82f6';

  private readonly urlsArchivos = new Set<string>();

  readonly tipoSolicitud = [
    {
      id: 'ARBITRAJE_DE_EMERGENCIA',
      nombre: 'ARBITRAJE DE EMERGENCIA',
    },
    {
      id: 'ARBITRAJE_AD_HOC',
      nombre: 'ARBITRAJE AD HOC',
    },
    {
      id: 'ARBITRAJE_INSTITUCIONAL',
      nombre: 'ARBITRAJE INSTITUCIONAL',
    },
  ];

  readonly tipoSolicitudToCodigo: Record<string, string> = {
    ARBITRAJE_DE_EMERGENCIA: 'AE-FIRMA-LEGAL',
    ARBITRAJE_AD_HOC: 'AD HOC-FIRMA-LEGAL',
    ARBITRAJE_INSTITUCIONAL: 'CA-FIRMA-LEGAL',
  };

  readonly descripciones: Record<string, string> = {
    ARBITRAJE_DE_EMERGENCIA:
      'Procedimiento excepcional y rápido destinado a atender ' +
      'solicitudes urgentes antes de la constitución del tribunal arbitral.',

    ARBITRAJE_AD_HOC:
      'Arbitraje organizado directamente por las partes, ' +
      'conforme a las reglas y el procedimiento aplicables.',

    ARBITRAJE_INSTITUCIONAL:
      'Arbitraje administrado por una institución arbitral, ' +
      'conforme a su reglamento.',
  };

  constructor(
    private readonly fb: FormBuilder,
    private readonly mesaPartesFormService: MesaPartesFormService,
  ) { }

  ngOnInit(): void {
    this.initFormSolicitud();
    this.loadData();
    this.listenTipoSolicitud();
  }

  // *********************************************************
  // FORMULARIO
  // *********************************************************
  initFormSolicitud(): void {
    this.form = this.fb.group({
      tipo_solicitud: [
        null,
        [
          Validators.required,
          Validators.pattern(
            /^(ARBITRAJE_DE_EMERGENCIA|ARBITRAJE_AD_HOC|ARBITRAJE_INSTITUCIONAL)$/,
          ),
        ],
      ],

      codigo: [
        {
          value: '',
          disabled: true,
        },
      ],

      descripcion: [
        '',
        [
          Validators.required,
          textoObligatorio,
        ],
      ],
    });
  }

  // *********************************************************
  // CAMBIO DE TIPO
  // *********************************************************
  listenTipoSolicitud(): void {
    this.form.get('tipo_solicitud')?.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.actualizarTipoSolicitud();
      });
  }

  private actualizarTipoSolicitud(): void {
    const tipo = this.form.get('tipo_solicitud')?.value;

    this.form.get('codigo')?.setValue(
      this.tipoSolicitudToCodigo[tipo] || '',
      {
        emitEvent: false,
      },
    );

    this.descripcionTipoArbitraje =
      this.descripciones[tipo] || null;
  }

  // *********************************************************
  // RESTAURAR DATOS
  // *********************************************************
  loadData(): void {
    const data = this.mesaPartesFormService.getFormData();

    this.form.patchValue(
      data.solicitud || {},
      {
        emitEvent: false,
      },
    );

    this.archivos = [...(data.archivos || [])];

    this.actualizarTipoSolicitud();
  }

  // *********************************************************
  // ARCHIVOS
  // *********************************************************
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files) {
      return;
    }

    for (const archivo of Array.from(input.files)) {
      const existe = this.archivos.some(
        (actual) =>
          actual.name === archivo.name &&
          actual.size === archivo.size &&
          actual.lastModified === archivo.lastModified,
      );

      if (!existe) {
        this.archivos.push(archivo);
      }
    }

    this.mesaPartesFormService.setArchivos([
      ...this.archivos,
    ]);

    input.value = '';
  }

  eliminarArchivo(index: number): void {
    if (index < 0 || index >= this.archivos.length) {
      return;
    }

    this.archivos.splice(index, 1);

    this.mesaPartesFormService.setArchivos([
      ...this.archivos,
    ]);
  }

  verArchivo(file: File): void {
    const url = URL.createObjectURL(file);

    this.urlsArchivos.add(url);

    window.open(
      url,
      '_blank',
      'noopener,noreferrer',
    );
  }

  // *********************************************************
  // GUARDAR BORRADOR
  // *********************************************************
  private guardarDatos(): void {
    const valores = this.form.getRawValue();

    this.mesaPartesFormService.setSolicitud({
      tipo_solicitud: valores.tipo_solicitud,
      descripcion: String(valores.descripcion ?? '').trim(),
      codigo: valores.codigo,
    });

    this.mesaPartesFormService.setArchivos([
      ...this.archivos,
    ]);
  }

  // *********************************************************
  // NAVEGACIÓN
  // *********************************************************
  continuar(): void {
    const descripcion = this.form.get('descripcion');

    descripcion?.setValue(
      String(descripcion.value ?? '').trim(),
      {
        emitEvent: false,
      },
    );

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.log("enviando: ", this.form.getRawValue());

    this.guardarDatos();
    this.nextStep.emit();
  }

  volver(): void {
    this.guardarDatos();
    this.prevStep.emit();
  }

  ngOnDestroy(): void {
    for (const url of this.urlsArchivos) {
      URL.revokeObjectURL(url);
    }

    this.urlsArchivos.clear();
  }
}

// import { CommonModule } from '@angular/common';
// import { Component, OnInit, Output, EventEmitter } from '@angular/core';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// // Directives
// import { UppercaseDirective } from 'src/app/shared/directives/uppercase.directive';

// // Pipes
// import { FileSizePipe } from 'src/app/shared/pipes/size-file.pipe';
// import { TruncatePipe } from 'src/app/shared/pipes/truncate.pipe';

// // Service
// import { TramiteMPVFormService } from 'src/app/pages/features/solicitudes/services/mesa-partes-form.service';

// @Component({
//   selector: 'step-solicitud',
//   imports: [ReactiveFormsModule, CommonModule, UppercaseDirective, FileSizePipe, TruncatePipe],
//   templateUrl: './step-solicitud.component.html',
//   styles: ``
// })
// export class StepSolicitudComponent implements OnInit {

//   @Output() nextStep = new EventEmitter<void>();
//   @Output() prevStep = new EventEmitter<void>();

//   form!: FormGroup;
//   archivos: File[] = [];

//   descripcionTipoArbitraje: string | null = null;

//   // SELECTOR
//   tipoSolicitud = [
//     { id: 'Arbitraje de Emergencia', nombre: 'ARBITRAJE DE EMERGENCIA' },
//     { id: 'Arbitraje Ad Hoc', nombre: 'ARBITRAJE AD HOC' },
//     { id: 'Arbitraje Institucional', nombre: 'ARBITRAJE INSTITUCIONAL' }
//   ];

//   // MAPEOS
//   tipoSolicitudToCodigo: Record<string, string> = {
//     'Arbitraje de Emergencia': 'AE-FIRMA-LEGAL',
//     'Arbitraje Ad Hoc': 'AD HOC-FIRMA-LEGAL',
//     'Arbitraje Institucional': 'CA-FIRMA-LEGAL'
//   };

//   descripciones: Record<string, string> = {
//     'Arbitraje de Emergencia':
//       'Procedimiento excepcional y rápido destinado a resolver situaciones urgentes que requieren una medida inmediata antes de la constitución del tribunal arbitral.',

//     'Arbitraje Ad Hoc':
//       'Arbitraje organizado directamente por las partes, sin intervención de una institución arbitral. Las reglas y el procedimiento son definidos por los propios interesados.',

//     'Arbitraje Institucional':
//       'Arbitraje administrado por una institución arbitral, que brinda reglas, soporte administrativo y supervisión del procedimiento.'
//   };

//   // Colores opcionales para alerta
//   colorAlerta = '#3b82f6';

//   constructor(
//     private fb: FormBuilder,
//     private tramiteService: TramiteMPVFormService
//   ) { }

//   ngOnInit(): void {
//     this.initFormSolicitud();
//     this.listenTipoSolicitud();
//     this.loadData();
//   }

//   // =========================
//   // FORMULARIO
//   // =========================
//   initFormSolicitud() {
//     this.form = this.fb.group({
//       tipo_solicitud: [null, Validators.required],
//       codigo: [{ value: '', disabled: true }],
//       descripcion: ['', Validators.required]
//     });
//   }

//   // =========================
//   // ESCUCHAR CAMBIOS
//   // =========================
//   listenTipoSolicitud() {
//     this.form.get('tipo_solicitud')?.valueChanges.subscribe(tipo => {
//       if (!tipo) return;

//       const codigo = this.tipoSolicitudToCodigo[tipo] || '';

//       // Se guarda internamente (no visible)
//       this.form.get('codigo')?.setValue(codigo);

//       // Se muestra al usuario
//       this.descripcionTipoArbitraje = this.descripciones[tipo] || null;
//     });
//   }

//   // =========================
//   // CARGAR DATOS
//   // =========================
//   loadData() {
//     const data = this.tramiteService.getFormData();

//     if (data?.solicitud) {
//       this.form.patchValue(data.solicitud);
//       this.archivos = data.archivos || [];

//       if (data.solicitud.tipo_solicitud) {
//         this.descripcionTipoArbitraje =
//           this.descripciones[data.solicitud.tipo_solicitud];
//       }
//     }
//   }

//   // =========================
//   // ARCHIVOS
//   // =========================
//   onFileSelect(event: Event) {
//     const input = event.target as HTMLInputElement;
//     if (!input.files) return;

//     Array.from(input.files).forEach(file => {
//       this.archivos.push(file);
//     });

//     input.value = '';
//   }

//   eliminarArchivo(index: number) {
//     this.archivos.splice(index, 1);
//   }

//   verArchivo(file: File) {
//     const url = URL.createObjectURL(file);
//     window.open(url, '_blank');

//     setTimeout(() => URL.revokeObjectURL(url), 1000);
//   }

//   // =========================
//   // NAVEGACIÓN
//   // =========================
//   continuar() {
//     if (this.form.invalid) {
//       this.form.markAllAsTouched();
//       return;
//     }

//     console.log("enviando: ", this.form.getRawValue());
//     this.tramiteService.setSolicitud(this.form.getRawValue());
//     this.tramiteService.setArchivos(this.archivos);

//     this.nextStep.emit();
//   }

//   volver() {
//     this.prevStep.emit();
//   }
// }
