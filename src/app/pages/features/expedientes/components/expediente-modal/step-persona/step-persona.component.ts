import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EMPTY, Subject, catchError, distinctUntilChanged, finalize, map, switchMap, takeUntil, timer } from 'rxjs';

// Directives
import { UppercaseDirective } from 'src/app/shared/directives/uppercase.directive';

// Services
import { ExpedienteFormService, PersonaData } from 'src/app/pages/features/expedientes/services/expedientes-form.service';
import { PersonaService } from 'src/app/pages/features/personas/services/persona.service';

// ==========================================================
// TIPOS LOCALES
// ==========================================================

type TipoPersona =
  | 'NATURAL'
  | 'JURIDICA'
  | 'ENTIDAD_PUBLICA';

interface CriterioBusquedaPersona {
  tipo: string;
  documento: string;
}

@Component({
  selector: 'step-persona',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    UppercaseDirective,
  ],
  templateUrl: './step-persona.component.html',
  styles: ``,
})
export class StepPersonaComponent implements OnInit, OnDestroy {
  // ==========================================================
  // OUTPUT
  // ==========================================================

  @Output() nextStep = new EventEmitter<void>();

  // ==========================================================
  // FORMULARIO Y ESTADO
  // ==========================================================

  form!: FormGroup;

  tipoUsuarioSeleccionado: string | null = null;

  modoEdicion = false;
  buscandoPersona = false;
  personaEncontrada = false;
  mensajeBusqueda = '';

  readonly tipoUsuarios: {
    id: TipoPersona;
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

  private readonly destroy$ = new Subject<void>();

  // ==========================================================
  // CONSTRUCTOR
  // ==========================================================

  constructor(
    private readonly fb: FormBuilder,
    private readonly expedienteFormService: ExpedienteFormService,
    private readonly personaService: PersonaService,
  ) { }

  // ==========================================================
  // CICLO DE VIDA
  // ==========================================================

  ngOnInit(): void {
    this.initFormPersona();

    this.listenTipoPersona();
    this.listenModoEdicion();
    this.listenDatosPersona();
    this.listenBusquedaPersona();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================================
  // FORMULARIO
  // ==========================================================

  initFormPersona(): void {
    this.form = this.fb.group({
      tipo: [null, Validators.required],

      nombres: [''],
      apellidos: [''],
      dni: [''],

      ruc: [''],
      razon_social: [''],
      nombre_entidad: [''],

      // En CreateExpedientePersonaRequest es opcional.
      email: ['', Validators.email],

      telefono: [''],
      direccion: [''],
      cargo: [''],
    });

    this.onTipoUsuarioChange(false);
  }

  loadDataPersona(): void {
    const data = this.expedienteFormService.getPersona();

    console.log("PERSONA DATA: ", data);

    // Restablece también los campos que no vengan en data,
    // evitando conservar datos de otro expediente.
    this.form.reset(
      {
        tipo: data.tipo ?? null,
        nombres: data.nombres ?? '',
        apellidos: data.apellidos ?? '',
        dni: data.dni ?? '',
        ruc: data.ruc ?? '',
        razon_social: data.razon_social ?? '',
        nombre_entidad: data.nombre_entidad ?? '',
        email: data.email ?? '',
        telefono: data.telefono ?? '',
        direccion: data.direccion ?? '',
        cargo: data.cargo ?? '',
      },
      { emitEvent: false },
    );

    this.onTipoUsuarioChange(false);

    this.personaEncontrada = false;
    this.mensajeBusqueda = '';
  }

  private listenDatosPersona(): void {
    this.expedienteFormService.formData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadDataPersona();
      });
  }

  private listenModoEdicion(): void {
    this.expedienteFormService.modoEdicion$
      .pipe(takeUntil(this.destroy$))
      .subscribe((modoEdicion) => {
        this.modoEdicion = modoEdicion;

        if (modoEdicion) {
          // La edición general del expediente
          // no actualiza los datos de persona.
          this.form.disable({ emitEvent: false });
        } else {
          this.form.enable({ emitEvent: false });
        }

        this.personaEncontrada = false;
        this.mensajeBusqueda = '';
      });
  }

  // ==========================================================
  // CAMBIO DE TIPO
  // ==========================================================

  listenTipoPersona(): void {
    this.form.get('tipo')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.onTipoUsuarioChange(true);
      });
  }

  onTipoUsuarioChange(resetValues: boolean = true): void {
    const tipo = this.form.get('tipo')?.value;

    this.tipoUsuarioSeleccionado = tipo ?? null;

    if (resetValues) {
      // Evita arrastrar datos de la persona anterior.
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
        { emitEvent: false },
      );

      this.personaEncontrada = false;
      this.mensajeBusqueda = '';
    }

    this.clearValidators([
      'dni',
      'nombres',
      'apellidos',
      'ruc',
      'razon_social',
      'nombre_entidad',
    ]);

    switch (tipo) {
      case 'NATURAL':
        this.form.get('dni')?.setValidators([
          Validators.required,
          Validators.pattern(/^\d{8}$/),
        ]);

        this.form.get('nombres')?.setValidators([
          Validators.required,
          Validators.pattern(/\S/),
        ]);

        this.form.get('apellidos')?.setValidators([
          Validators.required,
          Validators.pattern(/\S/),
        ]);
        break;

      case 'JURIDICA':
        this.form.get('ruc')?.setValidators([
          Validators.required,
          Validators.pattern(/^\d{11}$/),
        ]);

        this.form.get('razon_social')?.setValidators([
          Validators.required,
          Validators.pattern(/\S/),
        ]);
        break;

      case 'ENTIDAD_PUBLICA':
        this.form.get('ruc')?.setValidators([
          Validators.required,
          Validators.pattern(/^\d{11}$/),
        ]);

        this.form.get('nombre_entidad')?.setValidators([
          Validators.required,
          Validators.pattern(/\S/),
        ]);
        break;
    }

    // Cada control debe recalcularse después de cambiar
    // sus validadores.
    [
      'dni',
      'nombres',
      'apellidos',
      'ruc',
      'razon_social',
      'nombre_entidad',
    ].forEach((campo) => {
      this.form.get(campo)?.updateValueAndValidity({
        emitEvent: false,
        onlySelf: true,
      });
    });

    this.form.updateValueAndValidity({
      emitEvent: false,
    });
  }

  clearValidators(fields: string[]): void {
    fields.forEach((field) => {
      this.form.get(field)?.clearValidators();
    });
  }

  // ==========================================================
  // BÚSQUEDA POR DNI O RUC
  // ==========================================================

  listenBusquedaPersona(): void {
    this.form.valueChanges
      .pipe(
        map((): CriterioBusquedaPersona => {
          const valores = this.form.getRawValue();

          const tipo = String(valores.tipo ?? '');

          const documento = String(
            tipo === 'NATURAL'
              ? valores.dni ?? ''
              : valores.ruc ?? '',
          ).trim();

          return { tipo, documento };
        }),

        // Cambiar nombres, dirección u otros campos
        // no repite la consulta.
        distinctUntilChanged(
          (anterior, actual) =>
            anterior.tipo === actual.tipo &&
            anterior.documento === actual.documento,
        ),

        // Cancela la espera o consulta anterior inmediatamente
        // cuando cambia el documento o el tipo.
        switchMap(({ tipo, documento }) => {
          this.personaEncontrada = false;
          this.mensajeBusqueda = '';

          if (
            this.modoEdicion ||
            !this.documentoValido(tipo, documento)
          ) {
            return EMPTY;
          }

          return timer(500).pipe(
            switchMap(() => {
              this.buscandoPersona = true;

              const filters =
                tipo === 'NATURAL'
                  ? { dni: documento }
                  : { ruc: documento };

              return this.personaService.findPersona(filters).pipe(
                map((response) => {
                  const persona = this.extraerPersona(response);

                  return {
                    persona,
                    tipoConsultado: tipo,
                  };
                }),

                catchError((error: unknown) => {
                  this.mensajeBusqueda =
                    this.obtenerMensajeError(error);

                  return EMPTY;
                }),

                finalize(() => {
                  this.buscandoPersona = false;
                }),
              );
            }),
          );
        }),

        takeUntil(this.destroy$),
      )
      .subscribe(({ persona, tipoConsultado }) => {
        if (!persona) {
          this.mensajeBusqueda =
            'No se encontró una persona. Puedes ingresar sus datos manualmente.';
          return;
        }

        // No cambia silenciosamente el tipo seleccionado.
        if (persona.tipo !== tipoConsultado) {
          this.mensajeBusqueda =
            'La persona encontrada pertenece a otro tipo de persona. Revisa el tipo seleccionado.';
          return;
        }

        this.aplicarPersonaEncontrada(persona);
      });
  }

  private documentoValido(
    tipo: string,
    documento: string,
  ): boolean {
    if (tipo === 'NATURAL') {
      return /^\d{8}$/.test(documento);
    }

    if (
      tipo === 'JURIDICA' ||
      tipo === 'ENTIDAD_PUBLICA'
    ) {
      return /^\d{11}$/.test(documento);
    }

    return false;
  }

  private aplicarPersonaEncontrada(
    persona: Partial<PersonaData>,
  ): void {
    this.form.patchValue(
      {
        nombres: persona.nombres ?? '',
        apellidos: persona.apellidos ?? '',
        razon_social: persona.razon_social ?? '',
        nombre_entidad: persona.nombre_entidad ?? '',
        email: persona.email ?? '',
        telefono: persona.telefono ?? '',
        direccion: persona.direccion ?? '',
        cargo: persona.cargo ?? '',
      },
      { emitEvent: false },
    );

    // Conserva el DNI/RUC que originó la búsqueda.
    this.personaEncontrada = true;
    this.mensajeBusqueda = 'Datos de la persona cargados.';
  }

  // ==========================================================
  // ADAPTADOR DE RESPUESTA
  // ==========================================================

  private extraerPersona(
    response: unknown,
  ): Partial<PersonaData> | null {
    if (!this.esObjeto(response)) {
      return null;
    }

    if (response['success'] === false) {
      return null;
    }

    const data = response['data'];

    if (!this.esObjeto(data)) {
      return null;
    }

    // Admite:
    // { data: { persona: {...} } }
    // { data: {...persona} }
    const valor = 'persona' in data
      ? data['persona']
      : data;

    if (!this.esObjeto(valor)) {
      return null;
    }

    const tipo = valor['tipo'];

    if (
      tipo !== 'NATURAL' &&
      tipo !== 'JURIDICA' &&
      tipo !== 'ENTIDAD_PUBLICA'
    ) {
      return null;
    }

    return {
      tipo,
      nombres: this.texto(valor['nombres']),
      apellidos: this.texto(valor['apellidos']),
      dni: this.texto(valor['dni']),
      ruc: this.texto(valor['ruc']),
      razon_social: this.texto(valor['razon_social']),
      nombre_entidad: this.texto(valor['nombre_entidad']),
      email: this.texto(valor['email']),
      telefono: this.texto(valor['telefono']),
      direccion: this.texto(valor['direccion']),
      cargo: this.texto(valor['cargo']),
    };
  }

  private esObjeto(
    valor: unknown,
  ): valor is Record<string, unknown> {
    return (
      typeof valor === 'object' &&
      valor !== null &&
      !Array.isArray(valor)
    );
  }

  private texto(valor: unknown): string {
    return typeof valor === 'string' ? valor : '';
  }

  private obtenerMensajeError(error: unknown): string {
    if (this.esObjeto(error)) {
      if (error['status'] === 404) {
        return 'No se encontró una persona. Puedes ingresar sus datos manualmente.';
      }

      if (
        typeof error['message'] === 'string' &&
        error['message'].trim()
      ) {
        return error['message'];
      }
    }

    return 'No se pudo buscar la persona. Puedes completar sus datos manualmente.';
  }

  // ==========================================================
  // HELPERS PARA EL HTML
  // ==========================================================

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
    return (
      this.form.get(campo)?.hasValidator(
        Validators.required,
      ) ?? false
    );
  }

  soloNumeros(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (
      event.key.length === 1 &&
      !/^\d$/.test(event.key)
    ) {
      event.preventDefault();
    }
  }

  // ==========================================================
  // SIGUIENTE STEP
  // ==========================================================

  continuar(): void {
    if (this.modoEdicion) {
      if (!this.expedienteFormService.getExpedienteId()) {
        return;
      }

      // Persona es de consulta en la edición general.
      this.nextStep.emit();
      return;
    }

    // if (this.buscandoPersona) {
    //   return;
    // }
    // if (this.buscandoPersona) {
    //   this.mensajeBusqueda =
    //     'Espera a que termine la búsqueda de la persona.';

    //   return;
    // }

    // if (!this.form.valid) {
    //   this.form.markAllAsTouched();

    //   const camposInvalidos = Object.entries(this.form.controls)
    //     .filter(([, control]) => control.enabled && control.invalid)
    //     .map(([nombre]) => nombre);

    //   this.mensajeBusqueda = camposInvalidos.length
    //     ? `Revisa estos campos: ${camposInvalidos.join(', ')}.`
    //     : 'La validación del formulario todavía no ha terminado.';

    //   return;
    // }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();

    const persona: PersonaData = {
      tipo: String(valores.tipo ?? ''),
      nombres: String(valores.nombres ?? '').trim(),
      apellidos: String(valores.apellidos ?? '').trim(),
      dni: String(valores.dni ?? '').trim(),
      ruc: String(valores.ruc ?? '').trim(),
      razon_social: String(valores.razon_social ?? '').trim(),
      nombre_entidad: String(valores.nombre_entidad ?? '').trim(),
      email: String(valores.email ?? '').trim(),
      telefono: String(valores.telefono ?? '').trim(),
      direccion: String(valores.direccion ?? '').trim(),
      cargo: String(valores.cargo ?? '').trim(),
    };

    this.expedienteFormService.setPersona(persona);

    this.nextStep.emit();
  }

  // ==========================================================
  // HABILITAR SIGUIENTE STEP
  // ==========================================================

  get puedeContinuar(): boolean {
    if (!this.form || this.buscandoPersona) {
      return false;
    }

    if (this.modoEdicion) {
      return !!this.expedienteFormService.getExpedienteId();
    }

    return this.form.valid;
  }

  get camposInvalidos(): string[] {
    if (!this.form) return [];

    return Object.entries(this.form.controls)
      .filter(([, control]) => control.enabled && control.invalid)
      .map(([nombre]) => nombre);
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
// import { PersonaService } from 'src/app/pages/features/personas/services/persona.service';

// @Component({
//   selector: 'step-persona',
//   imports: [ReactiveFormsModule, CommonModule, UppercaseDirective],
//   templateUrl: './step-persona.component.html',
//   styles: ``
// })
// export class StepPersonaComponent implements OnInit {

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
//     private expedienteFormService: ExpedienteFormService,
//     private personaService: PersonaService
//   ) { }

//   ngOnInit(): void {
//     this.initFormPersona();
//     this.loadDataPersona();
//     this.listenTipoPersona();
//     this.listenBusquedaPersona();
//   }

//   // =========================
//   // FORMULARIO
//   // =========================
//   initFormPersona() {
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

//   loadDataPersona() {
//     const data = this.expedienteFormService.getPersona();

//     if (data && Object.keys(data).length > 0) {

//       this.form.patchValue(data);

//       // Restaurar tipo
//       this.tipoUsuarioSeleccionado = data.tipo || null;

//       // Reaplicar validaciones sin resetear
//       this.onTipoUsuarioChange(false);
//     }
//   }

//   listenTipoPersona() {
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


//         // this.personaService.findPersona({ dni })
//         //   .subscribe(resp => {

//         //     if (!resp) return;

//         //     this.form.patchValue({
//         //       nombres: resp.nombres,
//         //       apellidos: resp.apellidos,
//         //       email: resp.email,
//         //       telefono: resp.telefono,
//         //       direccion: resp.direccion,
//         //       cargo: resp.cargo
//         //     });

//         //   });

//       });

//     // RUC (jurídica / entidad)
//     this.form.get('ruc')?.valueChanges
//       .pipe(
//         debounceTime(500),
//         distinctUntilChanged()
//       )
//       .subscribe(ruc => {

//         if (!ruc || ruc.length !== 11) return;

//         // this.personaService.findPersona({ ruc })
//         //   .subscribe(resp => {

//         //     if (!resp) return;

//         //     // Forzar al tipo correcto
//         //     this.form.patchValue({
//         //       tipo: resp.tipo
//         //     });

//         //     this.tipoUsuarioSeleccionado = resp.tipo;

//         //     this.onTipoUsuarioChange(false); // reaplica validaciones sin resetear

//         //     this.form.patchValue({
//         //       razon_social: resp.razon_social,
//         //       nombre_entidad: resp.nombre_entidad,
//         //       email: resp.email,
//         //       telefono: resp.telefono,
//         //       direccion: resp.direccion,
//         //       ruc: resp.ruc
//         //     });

//         //   });

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

//     this.expedienteFormService.setPersona(this.form.value);

//     this.nextStep.emit();
//   }
// }



