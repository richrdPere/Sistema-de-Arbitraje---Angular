import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Subject, finalize, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

// Models
import { AuthPersonaTipo } from 'src/app/core/models/auth-session.model';

// Services
import { UsuarioService } from 'src/app/pages/features/usuarios/services/usuarios.service';

// Interfaces
import { CreateUsuarioRequest, CreateUsuarioRol, UpdateUsuarioRequest, UpdateUsuarioPersonaRequest, UsuarioListadoData } from 'src/app/pages/features/usuarios/interfaces';
import { RegisterPersonaRequest } from 'src/app/pages/auth/interfaces';

// *********************************************************
// TIPOS INTERNOS
// *********************************************************

type ModoPersona = 'NUEVA' | 'EXISTENTE';

interface UsuarioFormControls {
  id_usuario: FormControl<number | null>;

  modo_persona: FormControl<ModoPersona>;
  persona_id: FormControl<number | null>;

  correo: FormControl<string>;
  rol: FormControl<CreateUsuarioRol | ''>;

  tipo: FormControl<AuthPersonaTipo>;

  nombres: FormControl<string>;
  apellidos: FormControl<string>;
  dni: FormControl<string>;

  razon_social: FormControl<string>;
  nombre_entidad: FormControl<string>;
  ruc: FormControl<string>;

  email: FormControl<string>;
  direccion: FormControl<string>;
  telefono: FormControl<string>;
  cargo: FormControl<string>;

  foto_perfil: FormControl<string>;
}

// *********************************************************
// VALIDADORES
// *********************************************************

const textoNoVacio: ValidatorFn = (control) => {
  const value: unknown = control.value;

  if (value === null || value === undefined || value === '') {
    return null;
  }

  return typeof value === 'string' && value.trim()
    ? null
    : { textoVacio: true };
};

const opcionPermitida = (
  opciones: readonly string[],
): ValidatorFn => {
  return (control) => {
    const value: unknown = control.value;

    if (value === null || value === undefined || value === '') {
      return null;
    }

    return typeof value === 'string' && opciones.includes(value)
      ? null
      : { opcionInvalida: true };
  };
};

const identificadorValido: ValidatorFn = (control) => {
  const value: unknown = control.value;

  if (value === null || value === undefined || value === '') {
    return null;
  }

  return (
    typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value > 0 &&
    value <= 2147483647
  )
    ? null
    : { identificadorInvalido: true };
};

@Component({
  selector: 'usuarios-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './usuarios-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosFormComponent
  implements OnChanges, OnDestroy {

  // *********************************************************
  // INPUTS / OUTPUTS
  // *********************************************************

  @Input() mostrarModal = false;
  @Input() modoEdicion = false;
  @Input() usuarioSeleccionado: UsuarioListadoData | null = null;

  // Se emite después de crear o actualizar correctamente.
  @Output() usuarioCreado = new EventEmitter<void>();
  @Output() modalCerrado = new EventEmitter<void>();

  // *********************************************************
  // FORMULARIO Y ESTADO
  // *********************************************************

  readonly formUsuario: FormGroup<UsuarioFormControls>;

  isLoading = false;
  modalWidthClass = 'max-w-4xl';

  private readonly destruir$ = new Subject<void>();
  private destruido = false;

  // *********************************************************
  // SELECTORES
  // *********************************************************

  readonly modosPersona: {
    value: ModoPersona;
    label: string;
  }[] = [
      { value: 'NUEVA', label: 'Registrar una persona nueva' },
      { value: 'EXISTENTE', label: 'Usar una persona existente' },
    ];

  readonly tiposPersona: {
    value: AuthPersonaTipo;
    label: string;
  }[] = [
      { value: 'NATURAL', label: 'Persona natural' },
      { value: 'JURIDICA', label: 'Persona jurídica' },
      { value: 'ENTIDAD_PUBLICA', label: 'Entidad pública' },
    ];

  readonly rolesDisponibles: {
    id_rol: CreateUsuarioRol;
    nombre: string;
  }[] = [
      { id_rol: 'ADMIN', nombre: 'Administrador' },
      { id_rol: 'PARTICIPE', nombre: 'Partícipe' },
      { id_rol: 'STAFF_INTERNO', nombre: 'Personal interno' },
    ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly usuarioService: UsuarioService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.formUsuario = this.initFormulario();

    this.formUsuario.controls.modo_persona.valueChanges
      .pipe(takeUntil(this.destruir$))
      .subscribe(() => {
        this.configurarCamposPorModo();
        this.cdr.markForCheck();
      });

    this.formUsuario.controls.tipo.valueChanges
      .pipe(takeUntil(this.destruir$))
      .subscribe(() => {
        this.configurarCamposPorModo();
        this.cdr.markForCheck();
      });

    this.configurarCamposPorModo();
  }

  // *********************************************************
  // CICLO DE VIDA
  // *********************************************************

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.mostrarModal) {
      if (changes['mostrarModal'] && !this.isLoading) {
        this.resetearFormulario();
      }

      return;
    }

    const sincronizar =
      !!changes['mostrarModal'] ||
      !!changes['modoEdicion'] ||
      !!changes['usuarioSeleccionado'];

    if (!sincronizar || this.isLoading) {
      return;
    }

    this.setModalWidth('lg');

    if (this.modoEdicion && this.usuarioSeleccionado) {
      this.cargarUsuario(this.usuarioSeleccionado);
    } else {
      this.resetearFormulario();
    }
  }

  ngOnDestroy(): void {
    this.destruido = true;

    this.destruir$.next();
    this.destruir$.complete();
  }

  // *********************************************************
  // INICIALIZAR FORMULARIO
  // *********************************************************

  private initFormulario(): FormGroup<UsuarioFormControls> {
    return this.fb.group({
      id_usuario: this.fb.control<number | null>(null),

      modo_persona: this.fb.nonNullable.control<ModoPersona>(
        'NUEVA',
        [
          Validators.required,
          opcionPermitida(['NUEVA', 'EXISTENTE']),
        ],
      ),

      persona_id: this.fb.control<number | null>(
        null,
        [identificadorValido],
      ),

      correo: this.fb.nonNullable.control(
        '',
        [
          Validators.required,
          textoNoVacio,
          Validators.email,
        ],
      ),

      rol: this.fb.nonNullable.control<CreateUsuarioRol | ''>(
        'PARTICIPE',
        [
          Validators.required,
          opcionPermitida(
            this.rolesDisponibles.map((rol) => rol.id_rol),
          ),
        ],
      ),

      tipo: this.fb.nonNullable.control<AuthPersonaTipo>(
        'NATURAL',
        [
          Validators.required,
          opcionPermitida(
            this.tiposPersona.map((tipo) => tipo.value),
          ),
        ],
      ),

      nombres: this.fb.nonNullable.control(''),
      apellidos: this.fb.nonNullable.control(''),
      dni: this.fb.nonNullable.control(''),

      razon_social: this.fb.nonNullable.control(''),
      nombre_entidad: this.fb.nonNullable.control(''),
      ruc: this.fb.nonNullable.control(''),

      email: this.fb.nonNullable.control(
        '',
        [Validators.email],
      ),

      direccion: this.fb.nonNullable.control(''),
      telefono: this.fb.nonNullable.control(''),
      cargo: this.fb.nonNullable.control(''),

      foto_perfil: this.fb.nonNullable.control(''),
    });
  }

  // *********************************************************
  // RESETEAR Y CARGAR USUARIO
  // *********************************************************

  private resetearFormulario(): void {
    this.formUsuario.reset(
      {
        id_usuario: null,

        modo_persona: 'NUEVA',
        persona_id: null,

        correo: '',
        rol: 'PARTICIPE',

        tipo: 'NATURAL',

        nombres: '',
        apellidos: '',
        dni: '',

        razon_social: '',
        nombre_entidad: '',
        ruc: '',

        email: '',
        direccion: '',
        telefono: '',
        cargo: '',

        foto_perfil: '',
      },
      { emitEvent: false },
    );

    this.configurarCamposPorModo();
  }

  private cargarUsuario(usuario: UsuarioListadoData): void {
    const persona = usuario.persona;

    // En edición el rol es informativo.
    // Los roles profesionales no pertenecen al selector de alta.
    const rolCreacion = this.rolesDisponibles.find(
      (opcion) => opcion.id_rol === usuario.rol,
    )?.id_rol ?? '';

    this.formUsuario.reset(
      {
        id_usuario: usuario.id_usuario,

        modo_persona: 'NUEVA',
        persona_id: usuario.persona_id,

        correo: usuario.correo,
        rol: rolCreacion,

        tipo: persona.tipo,

        nombres: persona.nombres ?? '',
        apellidos: persona.apellidos ?? '',
        dni: persona.dni ?? '',

        razon_social: persona.razon_social ?? '',
        nombre_entidad: persona.nombre_entidad ?? '',
        ruc: persona.ruc ?? '',

        email: persona.email ?? '',
        direccion: persona.direccion ?? '',
        telefono: persona.telefono ?? '',
        cargo: persona.cargo ?? '',

        foto_perfil: usuario.foto_perfil ?? '',
      },
      { emitEvent: false },
    );

    this.configurarCamposPorModo();
  }

  // *********************************************************
  // CONFIGURAR CAMPOS
  // *********************************************************

  private configurarCamposPorModo(): void {
    const controles = this.formUsuario.controls;

    const personaExistente =
      !this.modoEdicion &&
      controles.modo_persona.value === 'EXISTENTE';

    this.habilitarCampo('correo', !this.modoEdicion);
    this.habilitarCampo('rol', !this.modoEdicion);
    this.habilitarCampo('modo_persona', !this.modoEdicion);

    this.habilitarCampo('persona_id', personaExistente);
    this.habilitarCampo('foto_perfil', this.modoEdicion);

    controles.persona_id.setValidators(
      personaExistente
        ? [Validators.required, identificadorValido]
        : [identificadorValido],
    );

    // Se conserva el tipo de la persona al editar.
    this.habilitarCampo(
      'tipo',
      !this.modoEdicion && !personaExistente,
    );

    const tipo = controles.tipo.value;

    const esNatural = !personaExistente && tipo === 'NATURAL';
    const esJuridica = !personaExistente && tipo === 'JURIDICA';
    const esEntidad =
      !personaExistente && tipo === 'ENTIDAD_PUBLICA';

    this.configurarCampoPersona(
      'nombres',
      esNatural,
      [Validators.required, textoNoVacio],
    );

    this.configurarCampoPersona(
      'apellidos',
      esNatural,
      [Validators.required, textoNoVacio],
    );

    this.configurarCampoPersona(
      'dni',
      esNatural,
      [Validators.pattern(/^\d{8}$/)],
    );

    this.configurarCampoPersona(
      'razon_social',
      esJuridica,
      [Validators.required, textoNoVacio],
    );

    this.configurarCampoPersona(
      'nombre_entidad',
      esEntidad,
      [Validators.required, textoNoVacio],
    );

    this.configurarCampoPersona(
      'ruc',
      esJuridica || esEntidad,
      [Validators.pattern(/^\d{11}$/)],
    );

    for (const campo of [
      'email',
      'direccion',
      'telefono',
      'cargo',
    ] as const) {
      this.habilitarCampo(campo, !personaExistente);
    }

    controles.persona_id.updateValueAndValidity({
      emitEvent: false,
    });
  }

  private habilitarCampo(
    campo: keyof UsuarioFormControls,
    habilitar: boolean,
  ): void {
    const control = this.formUsuario.controls[campo];

    if (habilitar) {
      control.enable({ emitEvent: false });
    } else {
      control.disable({ emitEvent: false });
    }
  }

  private configurarCampoPersona(
    campo:
      | 'nombres'
      | 'apellidos'
      | 'dni'
      | 'razon_social'
      | 'nombre_entidad'
      | 'ruc',
    habilitar: boolean,
    validadores: ValidatorFn[],
  ): void {
    const control = this.formUsuario.controls[campo];

    control.setValidators(validadores);

    this.habilitarCampo(campo, habilitar);

    control.updateValueAndValidity({
      emitEvent: false,
    });
  }

  // *********************************************************
  // CREAR O EDITAR
  // *********************************************************

  crearOEditarUsuario(): void {
    if (this.isLoading) {
      return;
    }

    this.normalizarCamposTexto();

    if (this.formUsuario.invalid) {
      this.formUsuario.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    if (this.modoEdicion) {
      this.actualizarUsuario();
    } else {
      this.crearUsuario();
    }
  }

  private crearUsuario(): void {
    const form = this.formUsuario.getRawValue();

    const rol = this.rolesDisponibles.find(
      (opcion) => opcion.id_rol === form.rol,
    )?.id_rol;

    if (!rol) {
      this.mostrarError(
        'Selecciona un rol válido para crear la cuenta.',
      );
      return;
    }

    let request: CreateUsuarioRequest;

    if (form.modo_persona === 'EXISTENTE') {
      const personaId = form.persona_id;

      if (
        personaId === null ||
        !Number.isSafeInteger(personaId) ||
        personaId <= 0 ||
        personaId > 2147483647
      ) {
        this.mostrarError(
          'Selecciona una persona existente válida.',
        );
        return;
      }

      request = {
        correo: form.correo,
        rol,
        persona_id: personaId,
      };
    } else {
      request = {
        correo: form.correo,
        rol,
        persona: this.construirPersonaNueva(),
      };
    }

    this.isLoading = true;

    this.usuarioService
      .createUsuario(request)
      .pipe(
        takeUntil(this.destruir$),
        finalize(() => this.finalizarSolicitud()),
      )
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.mostrarError(
              response.message ||
              'No se pudo crear el usuario.',
            );
            return;
          }

          this.completarGuardado(
            response.message,
            'Usuario registrado',
          );
        },

        error: (error: unknown) => {
          this.mostrarError(
            this.obtenerMensajeError(error),
          );
        },
      });
  }

  private actualizarUsuario(): void {
    const form = this.formUsuario.getRawValue();
    const idUsuario = form.id_usuario;

    if (
      idUsuario === null ||
      !Number.isSafeInteger(idUsuario) ||
      idUsuario <= 0
    ) {
      this.mostrarError(
        'No se pudo identificar al usuario que deseas editar.',
      );
      return;
    }

    const request: UpdateUsuarioRequest = {
      persona: this.construirPersonaActualizacion(),
    };

    const foto = this.textoONull(form.foto_perfil);
    const fotoAnterior =
      this.usuarioSeleccionado?.foto_perfil ?? null;

    if (foto !== fotoAnterior) {
      request.foto_perfil = foto;
    }

    this.isLoading = true;

    this.usuarioService
      .updateUsuario(idUsuario, request)
      .pipe(
        takeUntil(this.destruir$),
        finalize(() => this.finalizarSolicitud()),
      )
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.mostrarError(
              response.message ||
              'No se pudo actualizar el usuario.',
            );
            return;
          }

          this.completarGuardado(
            response.message,
            'Usuario actualizado',
          );
        },

        error: (error: unknown) => {
          this.mostrarError(
            this.obtenerMensajeError(error),
          );
        },
      });
  }

  // *********************************************************
  // CONSTRUIR PERSONA NUEVA
  // Solo envía los campos del tipo seleccionado.
  // *********************************************************

  private construirPersonaNueva(): RegisterPersonaRequest {
    const form = this.formUsuario.getRawValue();

    const contacto = {
      email: this.textoONull(form.email),
      direccion: this.textoONull(form.direccion),
      telefono: this.textoONull(form.telefono),
      cargo: this.textoONull(form.cargo),
    };

    switch (form.tipo) {
      case 'NATURAL':
        return {
          ...contacto,
          tipo: 'NATURAL',
          nombres: form.nombres,
          apellidos: form.apellidos,
          dni: this.textoONull(form.dni),
        };

      case 'JURIDICA':
        return {
          ...contacto,
          tipo: 'JURIDICA',
          razon_social: form.razon_social,
          ruc: this.textoONull(form.ruc),
        };

      case 'ENTIDAD_PUBLICA':
        return {
          ...contacto,
          tipo: 'ENTIDAD_PUBLICA',
          nombre_entidad: form.nombre_entidad,
          ruc: this.textoONull(form.ruc),
        };
    }
  }

  // *********************************************************
  // CONSTRUIR ACTUALIZACIÓN DE PERSONA
  // No modifica el tipo ni la relación persona_id.
  // *********************************************************

  private construirPersonaActualizacion():
    UpdateUsuarioPersonaRequest {
    const form = this.formUsuario.getRawValue();

    const contacto = {
      email: this.textoONull(form.email),
      direccion: this.textoONull(form.direccion),
      telefono: this.textoONull(form.telefono),
      cargo: this.textoONull(form.cargo),
    };

    switch (form.tipo) {
      case 'NATURAL':
        return {
          ...contacto,
          nombres: form.nombres,
          apellidos: form.apellidos,
          dni: this.textoONull(form.dni),
        };

      case 'JURIDICA':
        return {
          ...contacto,
          razon_social: form.razon_social,
          ruc: this.textoONull(form.ruc),
        };

      case 'ENTIDAD_PUBLICA':
        return {
          ...contacto,
          nombre_entidad: form.nombre_entidad,
          ruc: this.textoONull(form.ruc),
        };
    }
  }

  // *********************************************************
  // NORMALIZACIÓN
  // *********************************************************

  private normalizarCamposTexto(): void {
    for (const campo of [
      'nombres',
      'apellidos',
      'razon_social',
      'nombre_entidad',
      'direccion',
      'cargo',
    ] as const) {
      this.normalizarCampo(campo);
    }

    const controles = this.formUsuario.controls;

    for (const campo of [
      'correo',
      'email',
      'dni',
      'ruc',
      'telefono',
      'foto_perfil',
    ] as const) {
      const control = controles[campo];

      if (control.enabled) {
        control.setValue(
          control.value.trim(),
          { emitEvent: false },
        );
      }
    }
  }

  normalizarCampo(
    campo: keyof UsuarioFormControls,
    convertirMayusculas = false,
  ): void {
    const control = this.formUsuario.controls[campo];

    if (
      control.disabled ||
      typeof control.value !== 'string'
    ) {
      return;
    }

    const texto = control.value.trim().replace(/\s+/g, ' ');

    // Estos controles se invocan desde campos de texto.
    this.formUsuario.patchValue(
      {
        [campo]: convertirMayusculas
          ? texto.toUpperCase()
          : texto,
      },
      { emitEvent: false },
    );
  }

  private textoONull(value: string): string | null {
    return value.trim() || null;
  }

  // *********************************************************
  // VALIDACIONES PARA EL HTML
  // *********************************************************

  campoInvalido(
    campo: keyof UsuarioFormControls,
  ): boolean {
    const control = this.formUsuario.controls[campo];

    return (
      control.enabled &&
      control.invalid &&
      (control.touched || control.dirty)
    );
  }

  campoCompleto(
    campo: keyof UsuarioFormControls,
  ): boolean {
    const control = this.formUsuario.controls[campo];

    if (control.disabled || !control.valid) {
      return false;
    }

    const value = control.value;

    return typeof value === 'string'
      ? value.trim().length > 0
      : value !== null && value !== undefined;
  }

  esRequerido(
    campo: keyof UsuarioFormControls,
  ): boolean {
    const control = this.formUsuario.controls[campo];

    return (
      control.enabled &&
      control.hasValidator(Validators.required)
    );
  }

  obtenerError(
    campo: keyof UsuarioFormControls,
  ): string {
    const control = this.formUsuario.controls[campo];

    if (!this.campoInvalido(campo)) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }

    if (control.hasError('textoVacio')) {
      return 'Ingresa un valor válido.';
    }

    if (control.hasError('email')) {
      return 'Ingresa un correo electrónico válido.';
    }

    if (control.hasError('opcionInvalida')) {
      return 'Selecciona una opción válida.';
    }

    if (control.hasError('identificadorInvalido')) {
      return 'Ingresa un identificador entero positivo válido.';
    }

    if (control.hasError('pattern')) {
      if (campo === 'dni') {
        return 'El DNI debe contener 8 dígitos.';
      }

      if (campo === 'ruc') {
        return 'El RUC debe contener 11 dígitos.';
      }
    }

    return 'Revisa el valor ingresado.';
  }

  // *********************************************************
  // RESULTADO Y ERRORES
  // *********************************************************

  private completarGuardado(
    mensaje: string,
    titulo: string,
  ): void {
    this.isLoading = false;

    // Se emite primero para que el padre pueda reconocer
    // si se trataba de una creación o una edición.
    this.usuarioCreado.emit();
    this.modalCerrado.emit();

    void Swal.fire({
      icon: 'success',
      title: titulo,
      text: mensaje,
      confirmButtonText: 'Aceptar',
    });
  }

  private finalizarSolicitud(): void {
    this.isLoading = false;

    if (!this.destruido) {
      this.cdr.markForCheck();
    }
  }

  private mostrarError(mensaje: string): void {
    void Swal.fire({
      icon: 'error',
      title: this.modoEdicion
        ? 'No se pudo actualizar el usuario'
        : 'No se pudo registrar el usuario',
      text: mensaje,
    });
  }

  private obtenerMensajeError(error: unknown): string {
    if (typeof error === 'string') {
      return error.trim() ||
        'No se pudo guardar el usuario.';
    }

    const err = error as {
      error?: { message?: unknown } | string;
      message?: unknown;
    } | null;

    const mensajeBackend =
      typeof err?.error === 'string'
        ? err.error
        : err?.error?.message;

    if (
      typeof mensajeBackend === 'string' &&
      mensajeBackend.trim()
    ) {
      return mensajeBackend;
    }

    if (
      typeof err?.message === 'string' &&
      err.message.trim()
    ) {
      return err.message;
    }

    return 'No se pudo guardar el usuario. Intenta nuevamente.';
  }

  // *********************************************************
  // HELPERS DEL MODAL
  // *********************************************************

  get esPersonaExistente(): boolean {
    return (
      !this.modoEdicion &&
      this.formUsuario.controls.modo_persona.value === 'EXISTENTE'
    );
  }

  get tipoPersonaSeleccionado(): AuthPersonaTipo {
    return this.formUsuario.controls.tipo.value;
  }

  get tituloModal(): string {
    return this.modoEdicion
      ? 'Editar usuario'
      : 'Registrar usuario';
  }

  get textoBotonGuardar(): string {
    if (this.isLoading) {
      return 'Guardando...';
    }

    return this.modoEdicion
      ? 'Actualizar usuario'
      : 'Registrar usuario';
  }

  setModalWidth(
    size: 'sm' | 'md' | 'lg' | 'xl' | 'full',
  ): void {
    const clases = {
      sm: 'max-w-md',
      md: 'max-w-xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-full w-[95vw]',
    };

    this.modalWidthClass = clases[size];
  }

  cerrarModal(): void {
    if (this.isLoading) {
      return;
    }

    this.resetearFormulario();
    this.modalCerrado.emit();
  }
}

// import { CommonModule } from '@angular/common';
// import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import Swal from 'sweetalert2';

// // Directives
// import { UppercaseDirective } from 'src/app/shared/directives/uppercase.directive';

// // Service
// import { UsuarioService } from 'src/app/pages/features/usuarios/services/usuarios.service';
// import { AuthService } from 'src/app/services/auth.service';


// @Component({
//   selector: 'usuarios-form',
//   imports: [ReactiveFormsModule, CommonModule, UppercaseDirective],
//   templateUrl: './usuarios-form.component.html',
//   styles: ``
// })
// export class UsuariosFormComponent implements OnInit, OnChanges {


//   @Input() mostrarModal = false;
//   @Input() modoEdicion = false;
//   @Input() usuarioSeleccionado: any = null;

//   @Output() modalCerrado = new EventEmitter<void>();
//   @Output() usuarioCreado = new EventEmitter<void>();


//   formUsuario!: FormGroup;
//   loading = false;
//   mensajeError = '';
//   mensajeExito = '';

//   backendErrors: any = {};

//   modalWidthClass = 'max-w-4xl'; // default

//   setModalWidth(size: 'sm' | 'md' | 'lg' | 'xl' | 'full') {
//     const map = {
//       sm: 'max-w-md',
//       md: 'max-w-xl',
//       lg: 'max-w-4xl',
//       xl: 'max-w-6xl',
//       full: 'max-w-full w-[95vw]'
//     };

//     this.modalWidthClass = map[size];
//   }

//   constructor(
//     private fb: FormBuilder,
//     private usuarioService: UsuarioService,

//   ) { }


//   ngOnInit(): void {
//     this.initFormUsuarios();
//     this.setModalWidth('lg');
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     //  Si el formulario aún no está creado, salir
//     if (!this.formUsuario) return;

//     // EDITAR
//     if (changes['usuarioSeleccionado'] && this.usuarioSeleccionado) {
//       this.modoEdicion = true;
//       const rol = this.usuarioSeleccionado.rol?.toUpperCase();

//       const persona = this.usuarioSeleccionado.persona;

//       // Campos comunes
//       let formData: any = {
//         id: this.usuarioSeleccionado.id,
//         nombre: persona?.nombres || '',
//         apellidos: persona?.apellidos || '',
//         correo: this.usuarioSeleccionado.correo,
//         rol: this.usuarioSeleccionado.rol,
//         telefono: persona?.telefono || '',
//         documento_identidad: persona?.dni || persona?.ruc || '',
//         estado: this.usuarioSeleccionado.estado,
//       };

//       //  ARBITRO o ADJUDICADOR
//       if (rol === 'ARBITRO') {
//         formData = {
//           ...formData,
//           cargo: this.usuarioSeleccionado.persona?.arbitro?.cargo || '',
//           numero_colegiatura: this.usuarioSeleccionado.persona?.arbitro?.numero_colegiatura || '',
//           certificado_pdf: this.usuarioSeleccionado.persona?.arbitro?.certificado_pdf || '',
//           especialidad: this.usuarioSeleccionado.persona?.arbitro?.especialidad || '',
//           experiencia: this.usuarioSeleccionado.persona?.arbitro?.experiencia || '',
//           disponible: this.usuarioSeleccionado.persona?.arbitro?.disponible ?? true
//         };
//       }

//       // ADJUDICADOR
//       if (rol === 'ADJUDICADOR') {
//         formData = {
//           ...formData,
//           cargo: this.usuarioSeleccionado.adjudicador?.cargo || '',
//           numero_colegiatura: this.usuarioSeleccionado.adjudicador.numero_colegiatura || '',
//           certificado_pdf: this.usuarioSeleccionado.adjudicador.certificado_pdf || '',
//           especialidad: this.usuarioSeleccionado.adjudicador.especialidad || '',
//           experiencia: this.usuarioSeleccionado.adjudicador.experiencia || '',
//         };
//       }

//       //  SECRETARIA
//       if (rol === 'SECRETARIA') {
//         formData = {
//           ...formData,
//           cargo: this.usuarioSeleccionado.secretaria?.cargo || '',
//         };
//       }

//       // Aplicar al formulario
//       this.formUsuario.patchValue(formData);

//     }

//     // CREAR / CERRAR MODAL
//     if (changes['mostrarModal'] && !this.mostrarModal) {
//       this.formUsuario.reset();
//       this.modoEdicion = false;
//     }
//   };

//   private mapToRequestPayload(formValue: any) {

//     const payload: any = {
//       nombres: formValue.nombres,
//       apellidos: formValue.apellidos,
//       correo: formValue.correo,
//       rol: formValue.rol?.toLowerCase(),
//       telefono: formValue.telefono,
//       documento_identidad: formValue.documento_identidad,
//       tipo: 'NATURAL',

//       // Campos opcionales
//       cargo: formValue.cargo,
//       especialidad: formValue.especialidad,
//       experiencia: formValue.experiencia,
//       numero_colegiatura: formValue.numero_colegiatura,

//       // Solo enviar password si existe
//       password: formValue.password
//     };

//     // Eliminar campos vacíos
//     Object.keys(payload).forEach(key => {
//       if (
//         payload[key] === null ||
//         payload[key] === undefined ||
//         payload[key] === ''
//       ) {
//         delete payload[key];
//       }
//     });

//     return payload;
//   }

//   initFormUsuarios() {
//     this.formUsuario = this.fb.group({
//       id: [null],
//       nombres: ['', Validators.required],
//       apellidos: ['', Validators.required],
//       correo: ['', [Validators.required, Validators.email]],
//       password: [''],
//       rol: ['', Validators.required],
//       telefono: [
//         '',
//         [
//           Validators.required,
//           Validators.pattern('^[0-9]+$'),
//           Validators.minLength(9),
//           Validators.maxLength(9),
//         ],
//       ],
//       documento_identidad: [
//         '',
//         [
//           Validators.required,
//           Validators.pattern('^[0-9]+$'),
//           Validators.minLength(8),
//           Validators.maxLength(8),
//         ],
//       ],

//       // Campos opcionales (dependen del rol)
//       cargo: [''],
//       especialidad: [''],
//       experiencia: [''],

//       // Para arbitro y adjudicador
//       numero_colegiatura: [''],
//       // certificado_pdf: [''],
//       // disponible: [true],
//       // estado: ['Activo'],
//     });
//   }

//   cerrarModal() {
//     this.formUsuario.reset();
//     this.modoEdicion = false;
//     this.usuarioSeleccionado = null;
//     this.modalCerrado.emit();

//   }

//   // Crear o Editar usuario
//   crearOEditarUsuario() {

//     this.backendErrors = {};

//     if (this.formUsuario.invalid) {

//       this.formUsuario.markAllAsTouched();

//       Swal.fire({
//         icon: 'warning',
//         title: 'Formulario incompleto',
//         text: 'Por favor completa todos los campos requeridos.',
//       });

//       return;
//     }

//     const formData = { ...this.formUsuario.value };

//     const payload = this.mapToRequestPayload(formData);

//     // ==========================================
//     // EDITAR
//     // ==========================================
//     if (this.modoEdicion && formData.id) {

//       Swal.fire({
//         title: 'Actualizando usuario...',
//         text: 'Por favor espera',
//         allowOutsideClick: false,
//         didOpen: () => Swal.showLoading()
//       });

//       this.usuarioService.updateUsuario(formData.id, payload)
//         .subscribe({

//           next: () => {

//             Swal.fire({
//               icon: 'success',
//               title: 'Usuario actualizado correctamente'
//             });

//             this.usuarioCreado.emit();
//             this.cerrarModal();
//           },

//           error: (err) => {

//             this.backendErrors = err?.error?.errores || {};

//             Swal.fire({
//               icon: 'error',
//               title: 'Error al actualizar usuario',
//               text: err?.error?.message || 'Error desconocido.'
//             });
//           }
//         });

//       return;
//     }

//     // ==========================================
//     // CREAR
//     // ==========================================
//     Swal.fire({
//       title: 'Creando usuario...',
//       text: 'Enviando información, por favor espera',
//       allowOutsideClick: false,
//       allowEscapeKey: false,
//       didOpen: () => Swal.showLoading()
//     });

//     this.usuarioService.newUsuario(payload)
//       .subscribe({

//         next: () => {

//           Swal.fire({
//             icon: 'success',
//             title: 'Usuario creado correctamente',
//             text: 'Se envió un correo con las credenciales.'
//           });

//           this.usuarioCreado.emit();
//           this.cerrarModal();
//         },

//         error: (err) => {

//           this.backendErrors = err?.error?.errores || {};

//           Swal.fire({
//             icon: 'error',
//             title: 'Error al crear usuario',
//             text: err?.error?.message || 'Error desconocido'
//           });
//         }
//       });
//   }

//   soloNumeros(event: KeyboardEvent) {
//     const charCode = event.which ? event.which : event.keyCode;
//     if (charCode < 48 || charCode > 57) {
//       event.preventDefault();
//     }
//   }

//   get f() {
//     return this.formUsuario.controls;
//   }

//   hasError(field: string, error: string): boolean {
//     return !!this.formUsuario.get(field)?.hasError(error)
//       && !!this.formUsuario.get(field)?.touched;
//   }

//   isInvalid(field: string): boolean {
//     return !!this.formUsuario.get(field)?.invalid
//       && !!this.formUsuario.get(field)?.touched;
//   }
// }
