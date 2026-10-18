import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Subject, finalize, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

// Models
import { AuthRol } from 'src/app/core/models/auth-session.model';

// Services
import { UsuarioService } from 'src/app/pages/features/usuarios/services/usuarios.service';

// Interfaces
import { ChangeRolUsuarioRequest, UsuarioListadoData } from 'src/app/pages/features/usuarios/interfaces';

// *********************************************************
// TIPOS INTERNOS
// *********************************************************
interface UsuarioRolOpcion {
  value: AuthRol;
  label: string;
}

// *********************************************************
// VALIDADOR
// *********************************************************

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

@Component({
  selector: 'usuarios-change-rol',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './usuarios-change-rol.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosChangeRolComponent implements OnChanges, OnDestroy {

  // *********************************************************
  // INPUTS / OUTPUTS
  // *********************************************************
  @Input() mostrarModal = false;
  @Input() usuarioSeleccionado: UsuarioListadoData | null = null;

  @Output() rolActualizado = new EventEmitter<void>();
  @Output() modalCerrado = new EventEmitter<void>();

  // *********************************************************
  // SELECTOR
  // *********************************************************

  readonly rolesDisponibles: UsuarioRolOpcion[] = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'SECRETARIA', label: 'Secretaría' },
    { value: 'PARTICIPE', label: 'Partícipe' },
    { value: 'ARBITRO', label: 'Árbitro' },
    { value: 'ADJUDICADOR', label: 'Adjudicador' },
    { value: 'STAFF_INTERNO', label: 'Personal interno' },
  ];

  // *********************************************************
  // FORMULARIO Y ESTADO
  // *********************************************************

  readonly formRol: FormGroup<{
    rol: FormControl<AuthRol | ''>;
  }>;

  isLoading = false;
  errorMessage = '';
  modalWidthClass = 'max-w-xl';

  private readonly destruir$ = new Subject<void>();
  private destruido = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly usuarioService: UsuarioService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.formRol = this.fb.group({
      rol: this.fb.nonNullable.control<AuthRol | ''>(
        '',
        [
          Validators.required,
          opcionPermitida(
            this.rolesDisponibles.map((opcion) => opcion.value),
          ),
        ],
      ),
    });

    this.formRol.controls.rol.valueChanges
      .pipe(takeUntil(this.destruir$))
      .subscribe(() => {
        this.errorMessage = '';
      });
  }

  // *********************************************************
  // CICLO DE VIDA
  // *********************************************************

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isLoading) {
      return;
    }

    if (
      changes['mostrarModal'] ||
      changes['usuarioSeleccionado']
    ) {
      this.resetearFormulario();
    }
  }

  ngOnDestroy(): void {
    this.destruido = true;

    this.destruir$.next();
    this.destruir$.complete();
  }

  // *********************************************************
  // CAMBIAR ROL
  // *********************************************************

  cambiarRol(): void {
    if (this.isLoading || !this.mostrarModal) {
      return;
    }

    this.errorMessage = '';

    if (this.formRol.invalid) {
      this.formRol.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    const usuario = this.usuarioSeleccionado;

    if (
      !usuario ||
      !Number.isSafeInteger(usuario.id_usuario) ||
      usuario.id_usuario <= 0
    ) {
      this.errorMessage =
        'No se pudo identificar al usuario. Selecciónalo nuevamente.';

      this.cdr.markForCheck();
      return;
    }

    const rol = this.formRol.controls.rol.value;

    if (!rol) {
      return;
    }

    if (rol === usuario.rol) {
      this.formRol.controls.rol.setErrors({
        rolSinCambios: true,
      });

      this.formRol.controls.rol.markAsTouched();
      this.cdr.markForCheck();
      return;
    }

    const request: ChangeRolUsuarioRequest = {
      rol,
    };

    this.isLoading = true;

    this.usuarioService
      .changeRolUsuario(
        usuario.id_usuario,
        request,
      )
      .pipe(
        takeUntil(this.destruir$),

        finalize(() => {
          this.isLoading = false;

          if (!this.destruido) {
            this.cdr.markForCheck();
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.errorMessage =
              response.message ||
              'No se pudo cambiar el rol del usuario.';

            this.cdr.markForCheck();
            return;
          }

          this.isLoading = false;
          this.resetearFormulario();

          // El padre recarga el listado y controla el modal.
          this.rolActualizado.emit();
          this.modalCerrado.emit();

          void Swal.fire({
            icon: 'success',
            title: 'Rol actualizado',
            text: response.message,
            confirmButtonText: 'Aceptar',
          });
        },

        error: (error: unknown) => {
          this.errorMessage = this.obtenerMensajeError(error);
          this.cdr.markForCheck();
        },
      });
  }

  // *********************************************************
  // FORMULARIO
  // *********************************************************

  private resetearFormulario(): void {
    this.formRol.reset(
      { rol: '' },
      { emitEvent: false },
    );

    this.errorMessage = '';
  }

  campoInvalido(): boolean {
    const control = this.formRol.controls.rol;

    return (
      control.invalid &&
      (control.touched || control.dirty)
    );
  }

  campoCompleto(): boolean {
    const control = this.formRol.controls.rol;

    return control.valid && control.value !== '';
  }

  obtenerError(): string {
    const control = this.formRol.controls.rol;

    if (!this.campoInvalido()) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Selecciona el nuevo rol.';
    }

    if (control.hasError('opcionInvalida')) {
      return 'Selecciona un rol válido.';
    }

    if (control.hasError('rolSinCambios')) {
      return 'El nuevo rol debe ser diferente al actual.';
    }

    return 'Revisa el rol seleccionado.';
  }

  // *********************************************************
  // PRESENTACIÓN
  // *********************************************************

  get nombreUsuario(): string {
    const persona = this.usuarioSeleccionado?.persona;

    if (!persona) {
      return 'Usuario no seleccionado';
    }

    switch (persona.tipo) {
      case 'NATURAL':
        return [
          persona.nombres?.trim(),
          persona.apellidos?.trim(),
        ]
          .filter(Boolean)
          .join(' ') || 'Sin nombre registrado';

      case 'JURIDICA':
        return persona.razon_social?.trim() ||
          'Sin razón social registrada';

      case 'ENTIDAD_PUBLICA':
        return persona.nombre_entidad?.trim() ||
          'Sin nombre de entidad registrado';

      default:
        return 'Usuario';
    }
  }

  get rolActualLabel(): string {
    return this.obtenerNombreRol(
      this.usuarioSeleccionado?.rol,
    );
  }

  obtenerNombreRol(
    rol: AuthRol | null | undefined,
  ): string {
    return this.rolesDisponibles.find(
      (opcion) => opcion.value === rol,
    )?.label ?? 'No registrado';
  }

  // *********************************************************
  // ERRORES
  // *********************************************************

  private obtenerMensajeError(error: unknown): string {
    if (typeof error === 'string') {
      return error.trim() ||
        'No se pudo cambiar el rol del usuario.';
    }

    const detalle = error as {
      error?: { message?: unknown } | string;
      message?: unknown;
    } | null;

    const mensajeBackend =
      typeof detalle?.error === 'string'
        ? detalle.error
        : detalle?.error?.message;

    if (
      typeof mensajeBackend === 'string' &&
      mensajeBackend.trim()
    ) {
      return mensajeBackend;
    }

    if (
      typeof detalle?.message === 'string' &&
      detalle.message.trim()
    ) {
      return detalle.message;
    }

    return 'No se pudo cambiar el rol del usuario. Intenta nuevamente.';
  }

  // *********************************************************
  // MODAL
  // *********************************************************

  cerrarModal(): void {
    if (this.isLoading) {
      return;
    }

    this.resetearFormulario();
    this.modalCerrado.emit();
  }
}
