import { CommonModule } from '@angular/common';

import {
  Component,
  DestroyRef,
  EventEmitter,
  OnInit,
  Output,
  inject,
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import {
  catchError,
  distinctUntilChanged,
  finalize,
  map,
  of,
  switchMap,
  timer,
} from 'rxjs';

import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';

// Directives
import {
  UppercaseDirective,
} from 'src/app/shared/directives/uppercase.directive';

// Services
import {
  MesaPartesFormService,
} from 'src/app/pages/features/solicitudes/services/mesa-partes-form.service';

import {
  PersonaService,
} from 'src/app/pages/features/personas/services/persona.service';

// Interfaces
import {
  FindPersonaFilters,
  PersonaData,
  PersonaTipo,
} from 'src/app/pages/features/personas/interfaces';

// *********************************************************
// VALIDADOR DE TEXTO OBLIGATORIO
// Conserva la clave "required" para el HTML.
// *********************************************************
const textoObligatorio: ValidatorFn = (control) => {
  return (
    typeof control.value === 'string' &&
    control.value.trim().length > 0
  )
    ? null
    : { required: true };
};

@Component({
  selector: 'step-demandado',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UppercaseDirective,
  ],
  templateUrl: './step-demandado.component.html',
  styles: ``,
})
export class StepDemandadoComponent implements OnInit {

  private readonly destroyRef = inject(DestroyRef);

  // *********************************************************
  // OUTPUTS
  // *********************************************************
  @Output() nextStep = new EventEmitter<void>();
  @Output() prevStep = new EventEmitter<void>();

  // *********************************************************
  // FORMULARIO Y ESTADO
  // *********************************************************
  form!: FormGroup;

  tipoUsuarioDemandado: PersonaTipo | null = null;

  buscandoPersona = false;
  mensajeBusqueda = '';

  private datosAutocompletados = false;

  readonly tipoUsuarios: {
    id: PersonaTipo;
    nombre: string;
  }[] = [
      {
        id: 'NATURAL',
        nombre: 'PERSONA NATURAL',
      },
      {
        id: 'JURIDICA',
        nombre: 'PERSONA JURÍDICA',
      },
      {
        id: 'ENTIDAD_PUBLICA',
        nombre: 'ENTIDAD PÚBLICA',
      },
    ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly mesaPartesFormService: MesaPartesFormService,
    private readonly personaService: PersonaService,
  ) { }

  // *********************************************************
  // INICIALIZACIÓN
  // *********************************************************
  ngOnInit(): void {
    this.initFormDemandado();
    this.loadDataDemandado();

    this.listenTipoDemandado();
    this.listenBusquedaPersona();
    this.listenDuplicidad();

    this.validarDuplicidadConDemandante();
  }

  // *********************************************************
  // FORMULARIO
  // *********************************************************
  initFormDemandado(): void {
    this.form = this.fb.group({
      tipo: [
        null,
        [
          Validators.required,
          Validators.pattern(
            /^(NATURAL|JURIDICA|ENTIDAD_PUBLICA)$/,
          ),
        ],
      ],

      nombres: ['', Validators.maxLength(255)],
      apellidos: ['', Validators.maxLength(255)],
      dni: [''],

      ruc: [''],
      razon_social: ['', Validators.maxLength(255)],
      nombre_entidad: ['', Validators.maxLength(255)],

      email: [
        '',
        [
          Validators.required,
          textoObligatorio,
          Validators.email,
          Validators.maxLength(254),
        ],
      ],

      telefono: ['', Validators.maxLength(20)],
      direccion: ['', Validators.maxLength(255)],
      cargo: ['', Validators.maxLength(255)],
    });
  }

  // *********************************************************
  // RESTAURAR DATOS DEL PASO
  // *********************************************************
  loadDataDemandado(): void {
    const demandado =
      this.mesaPartesFormService.getFormData()?.demandado;

    if (
      !demandado ||
      Object.keys(demandado).length === 0
    ) {
      return;
    }

    this.form.patchValue(demandado, {
      emitEvent: false,
    });

    this.onTipoUsuarioDemandadoChange(false);
  }

  // *********************************************************
  // ESCUCHAR CAMBIO MANUAL DE TIPO
  // *********************************************************
  listenTipoDemandado(): void {
    this.form.get('tipo')?.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.onTipoUsuarioDemandadoChange(true);
      });
  }

  // *********************************************************
  // BÚSQUEDA POR DOCUMENTO
  // switchMap cancela la búsqueda anterior inmediatamente
  // cuando cambia el tipo o documento.
  // *********************************************************
  listenBusquedaPersona(): void {
    this.form.valueChanges
      .pipe(
        map(() => {
          const tipo = this.form.get('tipo')?.value;

          const documento = tipo === 'NATURAL'
            ? this.form.get('dni')?.value
            : this.form.get('ruc')?.value;

          return {
            tipo,
            documento: String(documento ?? '').trim(),
          };
        }),

        distinctUntilChanged(
          (anterior, actual) =>
            anterior.tipo === actual.tipo &&
            anterior.documento === actual.documento,
        ),

        switchMap(({ tipo, documento }) => {
          this.buscandoPersona = false;
          this.mensajeBusqueda = '';

          // Evita conservar datos de una búsqueda anterior
          // al ingresar un documento distinto.
          if (this.datosAutocompletados) {
            this.limpiarDatosPersonales();
            this.datosAutocompletados = false;
          }

          let filtros: FindPersonaFilters;

          if (
            tipo === 'NATURAL' &&
            /^\d{8}$/.test(documento)
          ) {
            filtros = { dni: documento };
          } else if (
            (
              tipo === 'JURIDICA' ||
              tipo === 'ENTIDAD_PUBLICA'
            ) &&
            /^\d{11}$/.test(documento)
          ) {
            filtros = { ruc: documento };
          } else {
            return of(null);
          }

          return timer(500).pipe(
            switchMap(() => {
              this.buscandoPersona = true;

              return this.personaService.findPersona(filtros)
                .pipe(
                  catchError(() => {
                    // La búsqueda no impide registrar
                    // los datos manualmente.
                    this.mensajeBusqueda =
                      'No se pudieron autocompletar los datos. ' +
                      'Puedes ingresarlos manualmente.';

                    return of(null);
                  }),

                  finalize(() => {
                    this.buscandoPersona = false;
                  }),
                );
            }),
          );
        }),

        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        if (!response) {
          return;
        }

        if (!response.success || !response.data?.persona) {
          this.mensajeBusqueda =
            'No se encontraron datos para autocompletar.';

          return;
        }

        this.cargarPersonaEncontrada(
          response.data.persona,
        );
      });
  }

  // *********************************************************
  // CARGAR PERSONA ENCONTRADA
  // *********************************************************
  private cargarPersonaEncontrada(
    persona: PersonaData,
  ): void {
    const tipoActual = this.form.get('tipo')?.value;

    const documentoCompatible = tipoActual === 'NATURAL'
      ? persona.tipo === 'NATURAL'
      : (
        persona.tipo === 'JURIDICA' ||
        persona.tipo === 'ENTIDAD_PUBLICA'
      );

    if (!documentoCompatible) {
      this.mensajeBusqueda =
        'La persona encontrada no corresponde al tipo de documento.';

      return;
    }

    // emitEvent:false evita reiniciar la búsqueda
    // y evita tratar el tipo recibido como cambio manual.
    this.form.patchValue(
      {
        tipo: persona.tipo,

        nombres: persona.nombres ?? '',
        apellidos: persona.apellidos ?? '',
        dni: persona.dni ?? '',

        ruc: persona.ruc ?? '',
        razon_social: persona.razon_social ?? '',
        nombre_entidad: persona.nombre_entidad ?? '',

        email: persona.email ?? '',
        telefono: persona.telefono ?? '',
        direccion: persona.direccion ?? '',
        cargo: persona.cargo ?? '',
      },
      {
        emitEvent: false,
      },
    );

    this.onTipoUsuarioDemandadoChange(false);

    this.datosAutocompletados = true;
    this.mensajeBusqueda =
      'Datos encontrados. Revisa la información antes de continuar.';

    this.validarDuplicidadConDemandante();
  }

  // *********************************************************
  // LIMPIAR DATOS AUTOCOMPLETADOS
  // Conserva el tipo y el documento que se está buscando.
  // *********************************************************
  private limpiarDatosPersonales(): void {
    this.form.patchValue(
      {
        nombres: '',
        apellidos: '',
        razon_social: '',
        nombre_entidad: '',
        email: '',
        telefono: '',
        direccion: '',
        cargo: '',
      },
      {
        emitEvent: false,
      },
    );
  }

  // *********************************************************
  // VALIDACIONES DINÁMICAS POR TIPO
  // *********************************************************
  onTipoUsuarioDemandadoChange(
    resetValues: boolean = true,
  ): void {
    const tipo = this.form.get('tipo')?.value;

    this.tipoUsuarioDemandado =
      this.tipoUsuarios.find((item) => item.id === tipo)?.id ?? null;

    if (resetValues) {
      this.datosAutocompletados = false;
      this.mensajeBusqueda = '';

      this.form.patchValue(
        {
          nombres: '',
          apellidos: '',
          dni: '',
          ruc: '',
          razon_social: '',
          nombre_entidad: '',
          email: '',
          telefono: '',
          direccion: '',
          cargo: '',
        },
        {
          emitEvent: false,
        },
      );
    }

    // Restablecer validaciones base.
    this.form.get('dni')?.clearValidators();
    this.form.get('ruc')?.clearValidators();

    for (const campo of [
      'nombres',
      'apellidos',
      'razon_social',
      'nombre_entidad',
    ]) {
      this.form.get(campo)?.setValidators([
        Validators.maxLength(255),
      ]);
    }

    if (tipo === 'NATURAL') {
      this.form.get('dni')?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{8}$/),
      ]);

      for (const campo of ['nombres', 'apellidos']) {
        this.form.get(campo)?.setValidators([
          Validators.required,
          textoObligatorio,
          Validators.maxLength(255),
        ]);
      }
    }

    if (
      tipo === 'JURIDICA' ||
      tipo === 'ENTIDAD_PUBLICA'
    ) {
      this.form.get('ruc')?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{11}$/),
      ]);

      const campoNombre = tipo === 'JURIDICA'
        ? 'razon_social'
        : 'nombre_entidad';

      this.form.get(campoNombre)?.setValidators([
        Validators.required,
        textoObligatorio,
        Validators.maxLength(255),
      ]);
    }

    for (const campo of [
      'dni',
      'ruc',
      'nombres',
      'apellidos',
      'razon_social',
      'nombre_entidad',
    ]) {
      this.form.get(campo)?.updateValueAndValidity({
        emitEvent: false,
      });
    }

    this.form.updateValueAndValidity({
      emitEvent: false,
    });

    this.validarDuplicidadConDemandante();
  }

  // *********************************************************
  // DUPLICIDAD CON DEMANDANTE
  // *********************************************************
  listenDuplicidad(): void {
    this.form.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.validarDuplicidadConDemandante();
      });
  }

  validarDuplicidadConDemandante(): void {
    const demandante =
      this.mesaPartesFormService.getFormData()?.demandante;

    const dniControl = this.form.get('dni');
    const rucControl = this.form.get('ruc');

    this.limpiarErrorMismo(dniControl);
    this.limpiarErrorMismo(rucControl);

    if (!demandante) {
      return;
    }

    const dniDemandante = String(
      demandante.dni ?? '',
    ).trim();

    const rucDemandante = String(
      demandante.ruc ?? '',
    ).trim();

    const dniDemandado = String(
      dniControl?.value ?? '',
    ).trim();

    const rucDemandado = String(
      rucControl?.value ?? '',
    ).trim();

    if (
      this.esNatural() &&
      dniDemandante &&
      dniDemandante === dniDemandado
    ) {
      dniControl?.setErrors(
        {
          ...dniControl.errors,
          mismo: true,
        },
        {
          emitEvent: false,
        },
      );
    }

    if (
      !this.esNatural() &&
      rucDemandante &&
      rucDemandante === rucDemandado
    ) {
      rucControl?.setErrors(
        {
          ...rucControl.errors,
          mismo: true,
        },
        {
          emitEvent: false,
        },
      );
    }
  }

  private limpiarErrorMismo(
    control: AbstractControl | null,
  ): void {
    if (!control?.hasError('mismo')) {
      return;
    }

    const errores = {
      ...control.errors,
    };

    delete errores['mismo'];

    control.setErrors(
      Object.keys(errores).length > 0
        ? errores
        : null,
      {
        emitEvent: false,
      },
    );
  }

  // *********************************************************
  // HELPERS PARA EL HTML
  // *********************************************************
  esNatural(): boolean {
    return this.tipoUsuarioDemandado === 'NATURAL';
  }

  esJuridica(): boolean {
    return this.tipoUsuarioDemandado === 'JURIDICA';
  }

  esEntidad(): boolean {
    return this.tipoUsuarioDemandado === 'ENTIDAD_PUBLICA';
  }

  esRequerido(campo: string): boolean {
    return this.form.get(campo)
      ?.hasValidator(Validators.required) ?? false;
  }

  soloNumeros(event: KeyboardEvent): void {
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.key.length !== 1
    ) {
      return;
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  // *********************************************************
  // NAVEGACIÓN
  // *********************************************************
  continuar(): void {
    if (this.buscandoPersona) {
      return;
    }

    // Normalizar antes de la validación final.
    for (const control of Object.values(this.form.controls)) {
      if (typeof control.value === 'string') {
        control.setValue(
          control.value.trim(),
          {
            emitEvent: false,
          },
        );
      }
    }

    this.validarDuplicidadConDemandante();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.mesaPartesFormService.setDemandado(
      this.form.getRawValue(),
    );

    this.nextStep.emit();
  }

  volver(): void {
    // Conserva el borrador incluso si está incompleto.
    this.mesaPartesFormService.setDemandado(
      this.form.getRawValue(),
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
// import { TramiteMPVFormService } from 'src/app/pages/features/solicitudes/services/mesa-partes-form.service';
// import { PersonaService } from 'src/app/pages/features/personas/services/persona.service';

// @Component({
//   selector: 'step-demandado',
//   imports: [ReactiveFormsModule, CommonModule, UppercaseDirective],
//   templateUrl: './step-demandado.component.html',
//   styles: ``
// })
// export class StepDemandadoComponent implements OnInit {

//   @Output() nextStep = new EventEmitter<void>();
//   @Output() prevStep = new EventEmitter<void>();

//   form!: FormGroup;
//   tipoUsuarioDemandado: string | null = null;

//   // Selector
//   tipoUsuarios = [
//     { id: 'NATURAL', nombre: 'PERSONA NATURAL' },
//     { id: 'JURIDICA', nombre: 'JURIDICA' },
//     { id: 'ENTIDAD_PUBLICA', nombre: 'ENTIDAD PÚBLICA' }
//   ];

//   constructor(
//     private fb: FormBuilder,
//     private tramiteService: TramiteMPVFormService,
//     private personaService: PersonaService
//   ) { }

//   ngOnInit(): void {
//     this.initFormDemandado();
//     this.loadDataDemandado();
//     this.listenTipoDemandado();
//     this.listenBusquedaPersona();
//     this.listenDuplicidad();
//   }



//   // =========================
//   // FORMULARIO
//   // =========================
//   initFormDemandado() {
//     this.form = this.fb.group({
//       tipo: [null, Validators.required],

//       nombres: [''],
//       apellidos: [''],
//       dni: [''],

//       ruc: [''],
//       razon_social: [''],
//       nombre_entidad: [''],

//       email: ['', [Validators.required, Validators.email]],
//       telefono: [''],
//       direccion: [''],
//       cargo: ['']
//     });
//   }

//   loadDataDemandado() {
//     const data = this.tramiteService.getFormData();

//     if (data?.demandado && Object.keys(data.demandado).length > 0) {

//       this.form.patchValue(data.demandado);

//       // IMPORTANTE: restaurar tipo seleccionado
//       this.tipoUsuarioDemandado = data.demandado.tipo;

//       // Volver a aplicar validaciones dinámicas
//       this.onTipoUsuarioDemandadoChange(false);
//     }
//   }

//   listenTipoDemandado() {
//     this.form.get('tipo')?.valueChanges.subscribe(() => {
//       this.onTipoUsuarioDemandadoChange(true);
//     });
//   }

//   listenDuplicidad() {
//     this.form.get('dni')?.valueChanges
//       .pipe(debounceTime(300), distinctUntilChanged())
//       .subscribe(() => this.validarDuplicidadConDemandante());

//     this.form.get('ruc')?.valueChanges
//       .pipe(debounceTime(300), distinctUntilChanged())
//       .subscribe(() => this.validarDuplicidadConDemandante());
//   }

//   listenBusquedaPersona() {
//     // DNI (persona natural)
//     this.form.get('dni')?.valueChanges
//       .pipe(
//         debounceTime(500),
//         distinctUntilChanged()
//       )
//       .subscribe(dni => {

//         if (!dni || dni.length !== 8) return;


//         this.personaService.searchPersona({ dni })
//           .subscribe(resp => {

//             if (!resp) return;

//             this.form.patchValue({
//               nombres: resp.nombres,
//               apellidos: resp.apellidos,
//               email: resp.email,
//               telefono: resp.telefono,
//               direccion: resp.direccion,
//               cargo: resp.cargo
//             });

//           });

//       });

//     // RUC (jurídica / entidad)
//     this.form.get('ruc')?.valueChanges
//       .pipe(
//         debounceTime(500),
//         distinctUntilChanged()
//       )
//       .subscribe(ruc => {

//         if (!ruc || ruc.length !== 11) return;

//         this.personaService.searchPersona({ ruc })
//           .subscribe(resp => {

//             if (!resp) return;

//             // Forzar tipo correcto
//             this.form.patchValue({ tipo: resp.tipo });
//             this.tipoUsuarioDemandado = resp.tipo;

//             this.onTipoUsuarioDemandadoChange(false);

//             this.form.patchValue({
//               razon_social: resp.razon_social,
//               nombre_entidad: resp.nombre_entidad,
//               email: resp.email,
//               telefono: resp.telefono,
//               direccion: resp.direccion,
//               ruc: resp.ruc
//             });
//           });
//       });
//   }


//   // =========================
//   // CAMBIO DE TIPO
//   // =========================
//   onTipoUsuarioDemandadoChange(resetValues: boolean = true) {
//     const tipo = this.form.get('tipo')?.value;
//     this.tipoUsuarioDemandado = tipo;

//     // SOLO resetear si es cambio manual
//     if (resetValues) {
//       this.form.patchValue({
//         nombres: '',
//         apellidos: '',
//         dni: '',
//         ruc: '',
//         razon_social: '',
//         nombre_entidad: ''
//       });
//     }

//     // LIMPIAR VALIDADORES
//     this.clearValidators([
//       'dni',
//       'nombres',
//       'apellidos',
//       'ruc',
//       'razon_social',
//       'nombre_entidad'
//     ]);

//     // =========================
//     // REGLAS
//     // =========================
//     if (tipo === 'NATURAL') {
//       this.form.get('dni')?.setValidators([
//         Validators.required,
//         Validators.pattern(/^\d{8}$/)
//       ]);

//       this.form.get('nombres')?.setValidators([Validators.required]);
//       this.form.get('apellidos')?.setValidators([Validators.required]);
//     }

//     if (tipo === 'JURIDICA') {
//       this.form.get('ruc')?.setValidators([
//         Validators.required,
//         Validators.pattern(/^\d{11}$/)
//       ]);

//       this.form.get('razon_social')?.setValidators([Validators.required]);
//     }

//     if (tipo === 'ENTIDAD_PUBLICA') {
//       this.form.get('ruc')?.setValidators([
//         Validators.required,
//         Validators.pattern(/^\d{11}$/)
//       ]);

//       this.form.get('nombre_entidad')?.setValidators([Validators.required]);
//     }

//     this.form.updateValueAndValidity();
//   }

//   clearValidators(fields: string[]) {
//     fields.forEach(field => {
//       this.form.get(field)?.clearValidators();
//       this.form.get(field)?.updateValueAndValidity();
//     });
//   }

//   setValidators(fields: string[], validators: any[]) {
//     fields.forEach(field => {
//       this.form.get(field)?.setValidators(validators);
//     });
//   }

//   // =========================
//   // HELPERS
//   // =========================
//   esNatural() {
//     return this.tipoUsuarioDemandado === 'NATURAL';
//   }

//   esJuridica() {
//     return this.tipoUsuarioDemandado === 'JURIDICA';
//   }

//   esEntidad() {
//     return this.tipoUsuarioDemandado === 'ENTIDAD_PUBLICA';
//   }

//   esRequerido(campo: string): boolean {
//     const control = this.form.get(campo);
//     return control?.hasValidator(Validators.required) ?? false;
//   }

//   soloNumeros(event: KeyboardEvent) {
//     const charCode = event.which ? event.which : event.keyCode;
//     if (charCode < 48 || charCode > 57) {
//       event.preventDefault();
//     }
//   }

//   validarDuplicidadConDemandante() {
//     const demandante = this.tramiteService.getFormData()?.demandante;

//     if (!demandante) return;

//     const dniControl = this.form.get('dni');
//     const rucControl = this.form.get('ruc');

//     const dniDemandado = dniControl?.value;
//     const rucDemandado = rucControl?.value;

//     // LIMPIAR SOLO ERROR "mismo"
//     const limpiarError = (control: any) => {
//       if (!control?.errors) return;

//       const errors = { ...control.errors };
//       delete errors['mismo'];

//       control.setErrors(Object.keys(errors).length ? errors : null);
//     };

//     limpiarError(dniControl);
//     limpiarError(rucControl);

//     // VALIDAR DNI
//     if (
//       demandante.dni &&
//       dniDemandado &&
//       demandante.dni === dniDemandado
//     ) {
//       dniControl?.setErrors({ ...(dniControl.errors || {}), mismo: true });
//     }

//     // VALIDAR RUC
//     if (
//       demandante.ruc &&
//       rucDemandado &&
//       demandante.ruc === rucDemandado
//     ) {
//       rucControl?.setErrors({ ...(rucControl.errors || {}), mismo: true });
//     }
//   }

//   // =========================
//   // NAVEGACIÓN
//   // =========================
//   continuar() {
//     // Ejecutar validación final
//     this.validarDuplicidadConDemandante();

//     if (this.form.invalid) {
//       this.form.markAllAsTouched();
//       return;
//     }

//     this.tramiteService.setDemandado(this.form.value);
//     this.nextStep.emit();
//   }

//   volver() {
//     this.prevStep.emit();
//   }

// }


