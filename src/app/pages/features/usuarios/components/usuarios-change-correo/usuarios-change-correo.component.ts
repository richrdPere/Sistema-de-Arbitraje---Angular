import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Subject, finalize, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

// Services
import { UsuarioService } from 'src/app/pages/features/usuarios/services/usuarios.service';

// Interfaces
import { ChangeCorreoUsuarioRequest, UsuarioListadoData } from 'src/app/pages/features/usuarios/interfaces';

// *********************************************************
// VALIDADOR
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

@Component({
  selector: 'usuarios-change-correo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './usuarios-change-correo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosChangeCorreoComponent implements OnChanges, OnDestroy {

  // *********************************************************
  // INPUTS / OUTPUTS
  // *********************************************************

  @Input() mostrarModal = false;
  @Input() usuarioSeleccionado: UsuarioListadoData | null = null;

  @Output() correoActualizado = new EventEmitter<void>();
  @Output() modalCerrado = new EventEmitter<void>();

  // *********************************************************
  // FORMULARIO
  // *********************************************************

  readonly formCorreo: FormGroup<{
    correo: FormControl<string>;
  }>;

  // *********************************************************
  // ESTADO
  // *********************************************************

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
    this.formCorreo = this.fb.group({
      correo: this.fb.nonNullable.control(
        '',
        [
          Validators.required,
          textoNoVacio,
          Validators.email,
        ],
      ),
    });

    this.formCorreo.controls.correo.valueChanges
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
  // CAMBIAR CORREO
  // *********************************************************

  cambiarCorreo(): void {
    if (this.isLoading || !this.mostrarModal) {
      return;
    }

    this.normalizarCorreo();
    this.errorMessage = '';

    if (this.formCorreo.invalid) {
      this.formCorreo.markAllAsTouched();
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

    const correo = this.formCorreo.controls.correo.value;

    if (
      correo.toLowerCase() ===
      usuario.correo.trim().toLowerCase()
    ) {
      this.formCorreo.controls.correo.setErrors({
        correoSinCambios: true,
      });

      this.formCorreo.controls.correo.markAsTouched();
      this.cdr.markForCheck();
      return;
    }

    const request: ChangeCorreoUsuarioRequest = {
      correo,
    };

    this.isLoading = true;

    this.usuarioService
      .changeCorreoUsuario(
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
              'No se pudo actualizar el correo de acceso.';

            this.cdr.markForCheck();
            return;
          }

          this.isLoading = false;
          this.resetearFormulario();

          // El padre recarga el listado y controla el modal.
          this.correoActualizado.emit();
          this.modalCerrado.emit();

          void Swal.fire({
            icon: 'success',
            title: 'Correo actualizado',
            text: response.message,
            confirmButtonText: 'Aceptar',
          });
        },

        error: (error: unknown) => {
          this.errorMessage =
            this.obtenerMensajeError(error);

          this.cdr.markForCheck();
        },
      });
  }

  // *********************************************************
  // FORMULARIO
  // *********************************************************

  private resetearFormulario(): void {
    this.formCorreo.reset(
      { correo: '' },
      { emitEvent: false },
    );

    this.errorMessage = '';
  }

  normalizarCorreo(): void {
    const control = this.formCorreo.controls.correo;
    const correo = control.value.trim();

    if (correo !== control.value) {
      control.setValue(correo);
    }
  }

  campoInvalido(): boolean {
    const control = this.formCorreo.controls.correo;

    return (
      control.invalid &&
      (control.touched || control.dirty)
    );
  }

  campoCompleto(): boolean {
    const control = this.formCorreo.controls.correo;

    return (
      control.valid &&
      control.value.trim().length > 0
    );
  }

  obtenerError(): string {
    const control = this.formCorreo.controls.correo;

    if (!this.campoInvalido()) {
      return '';
    }

    if (control.hasError('required')) {
      return 'El nuevo correo es obligatorio.';
    }

    if (control.hasError('textoVacio')) {
      return 'Ingresa un correo válido.';
    }

    if (control.hasError('email')) {
      return 'Ingresa un correo electrónico válido.';
    }

    if (control.hasError('correoSinCambios')) {
      return 'El nuevo correo debe ser diferente al actual.';
    }

    return 'Revisa el correo ingresado.';
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

  get correoActual(): string {
    return this.usuarioSeleccionado?.correo ||
      'No registrado';
  }

  // *********************************************************
  // ERRORES
  // *********************************************************

  private obtenerMensajeError(error: unknown): string {
    if (typeof error === 'string') {
      return error.trim() ||
        'No se pudo cambiar el correo de acceso.';
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

    return 'No se pudo cambiar el correo de acceso. Intenta nuevamente.';
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
