import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { catchError, distinctUntilChanged, finalize, map, of, switchMap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Directives
import { UppercaseDirective } from 'src/app/shared/directives/uppercase.directive';

// Services
import { MesaPartesFormService } from 'src/app/pages/features/solicitudes/services/mesa-partes-form.service';
import { PersonaService } from 'src/app/pages/features/personas/services/persona.service';

// Interfaces
import { FindPersonaFilters, PersonaData, PersonaTipo } from 'src/app/pages/features/personas/interfaces';

// *********************************************************
// TEXTO OBLIGATORIO
// *********************************************************
const textoObligatorio: ValidatorFn = (control) =>
  typeof control.value === 'string' &&
    control.value.trim().length > 0
    ? null
    : { required: true };

@Component({
  selector: 'step-demandante',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UppercaseDirective,
  ],
  templateUrl: './step-demandante.component.html',
  styles: ``,
})
export class StepDemandanteComponent implements OnInit {

  private readonly destroyRef = inject(DestroyRef);

  @Output() nextStep = new EventEmitter<void>();

  form!: FormGroup;

  tipoUsuarioSeleccionado: PersonaTipo | null = null;

  buscandoPersona = false;
  mensajeBusqueda = '';

  private datosAutocompletados = false;

  readonly tipoUsuarios: {
    id: PersonaTipo;
    nombre: string;
  }[] = [
      { id: 'NATURAL', nombre: 'PERSONA NATURAL' },
      { id: 'JURIDICA', nombre: 'PERSONA JURÍDICA' },
      { id: 'ENTIDAD_PUBLICA', nombre: 'ENTIDAD PÚBLICA' },
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
    this.initFormDemandante();
    this.loadDataDemandante();
    this.listenTipoDemantante();
    this.listenBusquedaPersona();
  }

  // *********************************************************
  // FORMULARIO
  // *********************************************************
  initFormDemandante(): void {
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
  // RESTAURAR BORRADOR
  // *********************************************************
  loadDataDemandante(): void {
    const demandante = this.mesaPartesFormService.getFormData()?.demandante;

    if (demandante) {
      this.form.patchValue(demandante, {
        emitEvent: false,
      });
    }

    this.onTipoUsuarioChange(false);
  }

  // Se conserva el nombre del método original.
  listenTipoDemantante(): void {
    this.form.get('tipo')?.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.onTipoUsuarioChange(true);
      });
  }

  // *********************************************************
  // AUTOCOMPLETAR POR DNI O RUC
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

          // La espera está dentro de switchMap:
          // un documento nuevo cancela la consulta anterior.
          return timer(500).pipe(
            switchMap(() => {
              this.buscandoPersona = true;

              return this.personaService.findPersona(filtros)
                .pipe(
                  catchError(() => {
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

  private cargarPersonaEncontrada(
    persona: PersonaData,
  ): void {
    const tipoActual = this.form.get('tipo')?.value;

    const compatible = tipoActual === 'NATURAL'
      ? persona.tipo === 'NATURAL'
      : (
        persona.tipo === 'JURIDICA' ||
        persona.tipo === 'ENTIDAD_PUBLICA'
      );

    if (!compatible) {
      this.mensajeBusqueda =
        'La persona encontrada no corresponde al tipo de documento.';

      return;
    }

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

    this.onTipoUsuarioChange(false);

    this.datosAutocompletados = true;
    this.mensajeBusqueda =
      'Datos encontrados. Revisa la información antes de continuar.';
  }

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
  // VALIDACIONES POR TIPO
  // *********************************************************
  onTipoUsuarioChange(
    resetValues: boolean = true,
  ): void {
    const tipo = this.form.get('tipo')?.value;

    this.tipoUsuarioSeleccionado =
      this.tipoUsuarios.find((item) => item.id === tipo)?.id ?? null;

    if (resetValues) {
      this.datosAutocompletados = false;
      this.mensajeBusqueda = '';

      this.limpiarDatosPersonales();

      this.form.patchValue(
        {
          dni: '',
          ruc: '',
        },
        {
          emitEvent: false,
        },
      );
    }

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

    if (tipo === 'JURIDICA' || tipo === 'ENTIDAD_PUBLICA') {
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
  }

  clearValidators(fields: string[]): void {
    for (const field of fields) {
      const control = this.form.get(field);

      control?.clearValidators();
      control?.updateValueAndValidity({
        emitEvent: false,
      });
    }
  }

  // *********************************************************
  // HELPERS PARA HTML
  // *********************************************************
  esNatural(): boolean {
    return this.tipoUsuarioSeleccionado === 'NATURAL';
  }

  esJuridica(): boolean {
    return this.tipoUsuarioSeleccionado === 'JURIDICA';
  }

  esEntidad(): boolean {
    return this.tipoUsuarioSeleccionado === 'ENTIDAD_PUBLICA';
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
  // SIGUIENTE PASO
  // *********************************************************
  continuar(): void {
    if (this.buscandoPersona) {
      return;
    }

    for (const control of Object.values(this.form.controls)) {
      if (typeof control.value === 'string') {
        control.setValue(control.value.trim(), {
          emitEvent: false,
        });
      }
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.mesaPartesFormService.setDemandante(
      this.form.getRawValue(),
    );

    this.nextStep.emit();
  }
}

// import { CommonModule } from '@angular/common';
// import { Component, OnInit, Output, EventEmitter } from '@angular/core';
// import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// // Directives
// import { UppercaseDirective } from 'src/app/shared/directives/uppercase.directive';

// // Services
// import { TramiteMPVFormService } from 'src/app/pages/features/solicitudes/services/mesa-partes-form.service';
// import { PersonaService } from 'src/app/pages/features/personas/services/persona.service';

// @Component({
//   selector: 'step-demandante',
//   imports: [ReactiveFormsModule, CommonModule, UppercaseDirective],
//   templateUrl: './step-demandante.component.html',
//   styles: ``
// })
// export class StepDemandanteComponent implements OnInit {

//   @Output() nextStep = new EventEmitter<void>();

//   form!: FormGroup;
//   tipoUsuarioSeleccionado: string | null = null;

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
//     this.initFormDemandante();
//     this.loadDataDemandante();
//     this.listenTipoDemantante();
//     this.listenBusquedaPersona();
//   }

//   // =========================
//   // FORMULARIO
//   // =========================
//   initFormDemandante() {
//     this.form = this.fb.group({
//       tipo: [null, Validators.required],

//       nombres: ['', Validators.required],
//       apellidos: ['', Validators.required],
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

//   loadDataDemandante() {
//     const data = this.tramiteService.getFormData();

//     if (data?.demandante && Object.keys(data.demandante).length > 0) {

//       this.form.patchValue(data.demandante);

//       // IMPORTANTE: restaurar tipo seleccionado
//       this.tipoUsuarioSeleccionado = data.demandante.tipo;

//       // Volver a aplicar validaciones dinámicas
//       this.onTipoUsuarioChange(false);
//     }
//   }

//   listenTipoDemantante() {
//     this.form.get('tipo')?.valueChanges.subscribe(() => {
//       this.onTipoUsuarioChange(true);
//     });
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

//             // Forzar al tipo correcto
//             this.form.patchValue({
//               tipo: resp.tipo
//             });

//             this.tipoUsuarioSeleccionado = resp.tipo;

//             this.onTipoUsuarioChange(false); // reaplica validaciones sin resetear

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


//   // - CAMBIO DE TIPO
//   onTipoUsuarioChange(resetValues: boolean = true) {

//     const tipo = this.form.get('tipo')?.value;
//     this.tipoUsuarioSeleccionado = tipo;

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

//     // Validaciones dinámicas
//     if (tipo === 'NATURAL') {
//       this.form.get('dni')?.setValidators([Validators.required, Validators.pattern(/^\d{8}$/)]);
//       this.form.get('nombres')?.setValidators([Validators.required]);
//       this.form.get('apellidos')?.setValidators([Validators.required]);

//       this.clearValidators(['ruc', 'razon_social', 'nombre_entidad']);
//     }

//     if (tipo === 'JURIDICA') {
//       this.form.get('ruc')?.setValidators([Validators.required, Validators.pattern(/^\d{11}$/)]);
//       this.form.get('razon_social')?.setValidators([Validators.required]);

//       this.clearValidators(['dni', 'nombres', 'apellidos', 'nombre_entidad']);
//     }

//     if (tipo === 'ENTIDAD_PUBLICA') {
//       this.form.get('ruc')?.setValidators([Validators.required]);
//       this.form.get('nombre_entidad')?.setValidators([Validators.required]);

//       this.clearValidators(['dni', 'nombres', 'apellidos', 'razon_social']);
//     }

//     this.form.updateValueAndValidity();
//   }

//   // - Limpiar validaciones
//   clearValidators(fields: string[]) {
//     fields.forEach(field => {
//       this.form.get(field)?.clearValidators();
//       this.form.get(field)?.updateValueAndValidity();
//     });
//   }

//   // - Es natural
//   esNatural() {
//     return this.tipoUsuarioSeleccionado === 'NATURAL';
//   }

//   // - Es natural
//   esJuridica() {
//     return this.tipoUsuarioSeleccionado === 'JURIDICA';
//   }

//   // - Es juridica
//   esEntidad() {
//     return this.tipoUsuarioSeleccionado === 'ENTIDAD_PUBLICA';
//   }

//   // - Es requerido
//   esRequerido(campo: string): boolean {
//     const control = this.form.get(campo);
//     return control?.hasValidator(Validators.required) ?? false;
//   }

//   // - Solo numeros
//   soloNumeros(event: KeyboardEvent) {
//     const charCode = event.which ? event.which : event.keyCode;
//     if (charCode < 48 || charCode > 57) {
//       event.preventDefault();
//     }
//   }

//   // =========================
//   // SIGUIENTE STEP
//   // =========================
//   continuar() {
//     if (this.form.invalid) {
//       this.form.markAllAsTouched();
//       return;
//     }

//     this.tramiteService.setDemandante(this.form.value);
//     this.nextStep.emit();
//   }
// }
