import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

// Models
import { AuthPersona, AuthPersonaTipo, AuthRol } from 'src/app/core/models/auth-session.model';

// Services
import { UsuarioService } from 'src/app/pages/features/usuarios/services/usuarios.service';

// Interfaces
import { UsuarioDetalleData } from 'src/app/pages/features/usuarios/interfaces';

// *********************************************************
// TIPO PARA ETIQUETAS DE LA VISTA
// *********************************************************

interface UsuarioViewEtiqueta {
  icon: string;
  label: string;
  class: string;
}

@Component({
  selector: 'usuarios-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosViewComponent implements OnChanges, OnDestroy {

  // *********************************************************
  // INPUTS / OUTPUTS
  // *********************************************************

  @Input() mostrarModal = false;
  @Input() usuario_id: number | null = null;

  @Output() modalCerrado = new EventEmitter<void>();

  // *********************************************************
  // ESTADO
  // *********************************************************

  usuario: UsuarioDetalleData | null = null;

  loading = false;
  errorCarga: string | null = null;

  modalWidthClass = 'max-w-4xl';

  private cargaSubscription?: Subscription;
  private destruido = false;

  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  // *********************************************************
  // CICLO DE VIDA
  // *********************************************************

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.mostrarModal) {
      this.cancelarCarga();
      this.limpiarDatos();
      return;
    }

    // Recarga al abrir el modal, incluso con el mismo ID.
    if (changes['usuario_id'] || changes['mostrarModal']) {
      this.cargarDatosUsuario();
    }
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.cancelarCarga();
  }

  // *********************************************************
  // CARGAR INFORMACIÓN
  // *********************************************************

  cargarDatosUsuario(): void {
    if (this.destruido) {
      return;
    }

    // Cancela la petición anterior antes de cargar otro usuario.
    this.cancelarCarga();
    this.limpiarDatos();

    if (!this.mostrarModal) {
      return;
    }

    const idUsuario = this.usuario_id;

    if (
      idUsuario === null ||
      !Number.isSafeInteger(idUsuario) ||
      idUsuario <= 0
    ) {
      this.errorCarga = 'Selecciona un usuario válido.';
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.cargaSubscription = this.usuarioService
      .getUsuarioById(idUsuario)
      .pipe(
        finalize(() => {
          this.loading = false;

          if (!this.destruido) {
            this.cdr.markForCheck();
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.mostrarError(
              response.message ||
              'No se pudo obtener la información del usuario.',
            );
            return;
          }

          this.usuario = response.data;
          this.errorCarga = null;
          this.cdr.markForCheck();
        },

        error: (error: unknown) => {
          this.mostrarError(
            this.obtenerMensajeError(error),
          );
        },
      });
  }

  // *********************************************************
  // MANEJO DE ERRORES
  // *********************************************************

  private mostrarError(mensaje: string): void {
    if (this.destruido) {
      return;
    }

    this.usuario = null;
    this.errorCarga = mensaje;
    this.cdr.markForCheck();

    void Swal.fire({
      icon: 'error',
      title: 'No se pudo obtener el usuario',
      text: mensaje,
    });
  }

  private obtenerMensajeError(error: unknown): string {
    if (typeof error === 'string') {
      return error.trim() ||
        'Ocurrió un error al cargar la información del usuario.';
    }

    const detalle = error as {
      message?: unknown;
      error?: {
        message?: unknown;
      } | string;
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

    return 'Ocurrió un error al cargar la información del usuario.';
  }

  // *********************************************************
  // INFORMACIÓN DE LA PERSONA
  // *********************************************************

  getNombreCompleto(
    persona: AuthPersona | null | undefined = this.usuario?.persona,
  ): string {
    if (!persona) {
      return 'No registrado';
    }

    switch (persona.tipo) {
      case 'NATURAL':
        return [
          persona.nombres?.trim(),
          persona.apellidos?.trim(),
        ]
          .filter(Boolean)
          .join(' ') || 'No registrado';

      case 'JURIDICA':
        return persona.razon_social?.trim() || 'No registrado';

      case 'ENTIDAD_PUBLICA':
        return persona.nombre_entidad?.trim() || 'No registrado';

      default:
        return 'No registrado';
    }
  }

  getDocumento(): string {
    const persona = this.usuario?.persona;

    if (!persona) {
      return 'No registrado';
    }

    return (
      persona.tipo === 'NATURAL'
        ? persona.dni?.trim()
        : persona.ruc?.trim()
    ) || 'No registrado';
  }

  getTipoDocumento(): string {
    const persona = this.usuario?.persona;

    if (!persona) {
      return 'Documento';
    }

    return persona.tipo === 'NATURAL' ? 'DNI' : 'RUC';
  }

  getCargo(): string {
    return this.usuario?.persona.cargo?.trim() ||
      'No registrado';
  }

  getTelefono(): string {
    return this.usuario?.persona.telefono?.trim() ||
      'No registrado';
  }

  getDireccion(): string {
    return this.usuario?.persona.direccion?.trim() ||
      'No registrado';
  }

  getCorreoContacto(): string {
    return this.usuario?.persona.email?.trim() ||
      'No registrado';
  }

  getFotoPerfil(): string {
    return this.usuario?.foto_perfil?.trim() ||
      'assets/img/default-avatar.png';
  }

  // *********************************************************
  // ETIQUETAS: ROL
  // *********************************************************

  getRol(
    rol: AuthRol | null | undefined = this.usuario?.rol,
  ): UsuarioViewEtiqueta {
    const roles: Record<AuthRol, UsuarioViewEtiqueta> = {
      ADMIN: {
        icon: 'fa-user-shield',
        label: 'Administrador',
        class: 'badge-primary',
      },

      SECRETARIA: {
        icon: 'fa-user-tie',
        label: 'Secretaría',
        class: 'badge-info',
      },

      PARTICIPE: {
        icon: 'fa-user',
        label: 'Partícipe',
        class: 'badge-success',
      },

      ARBITRO: {
        icon: 'fa-scale-balanced',
        label: 'Árbitro',
        class: 'badge-warning',
      },

      ADJUDICADOR: {
        icon: 'fa-gavel',
        label: 'Adjudicador',
        class: 'badge-secondary',
      },

      STAFF_INTERNO: {
        icon: 'fa-users',
        label: 'Personal interno',
        class: 'badge-neutral',
      },
    };

    return (rol ? roles[rol] : undefined) ?? {
      icon: 'fa-user',
      label: 'No registrado',
      class: 'badge-neutral',
    };
  }

  // *********************************************************
  // ETIQUETAS: TIPO DE PERSONA
  // *********************************************************

  getTipoPersona(
    tipo: AuthPersonaTipo | null | undefined =
      this.usuario?.persona.tipo,
  ): UsuarioViewEtiqueta {
    const tipos: Record<AuthPersonaTipo, UsuarioViewEtiqueta> = {
      NATURAL: {
        icon: 'fa-user',
        label: 'Persona natural',
        class: 'badge-info',
      },

      JURIDICA: {
        icon: 'fa-building',
        label: 'Persona jurídica',
        class: 'badge-primary',
      },

      ENTIDAD_PUBLICA: {
        icon: 'fa-landmark',
        label: 'Entidad pública',
        class: 'badge-secondary',
      },
    };

    return (tipo ? tipos[tipo] : undefined) ?? {
      icon: 'fa-address-card',
      label: 'No registrado',
      class: 'badge-neutral',
    };
  }

  // *********************************************************
  // ETIQUETAS: ESTADO DE LA CUENTA
  // *********************************************************

  getEstado(
    estado: boolean | null | undefined = this.usuario?.estado,
  ): UsuarioViewEtiqueta {
    if (estado === true) {
      return {
        icon: 'fa-circle-check',
        label: 'Activo',
        class: 'badge-success',
      };
    }

    if (estado === false) {
      return {
        icon: 'fa-circle-xmark',
        label: 'Inactivo',
        class: 'badge-error',
      };
    }

    return {
      icon: 'fa-circle-question',
      label: 'No registrado',
      class: 'badge-neutral',
    };
  }

  // *********************************************************
  // ETIQUETAS: VERIFICACIÓN DEL CORREO
  // *********************************************************

  getCorreoVerificado(): UsuarioViewEtiqueta {
    if (!this.usuario) {
      return {
        icon: 'fa-envelope',
        label: 'Sin información',
        class: 'badge-neutral',
      };
    }

    return this.usuario.correo_verificado
      ? {
        icon: 'fa-circle-check',
        label: 'Verificado',
        class: 'badge-success',
      }
      : {
        icon: 'fa-clock',
        label: 'Verificación pendiente',
        class: 'badge-warning',
      };
  }

  // *********************************************************
  // ETIQUETAS: CAMBIO DE CONTRASEÑA
  // *********************************************************

  getEstadoPassword(): UsuarioViewEtiqueta {
    if (!this.usuario) {
      return {
        icon: 'fa-key',
        label: 'Sin información',
        class: 'badge-neutral',
      };
    }

    return this.usuario.password_reset_required
      ? {
        icon: 'fa-key',
        label: 'Cambio pendiente',
        class: 'badge-warning',
      }
      : {
        icon: 'fa-circle-check',
        label: 'Sin cambio pendiente',
        class: 'badge-success',
      };
  }

  // *********************************************************
  // MODAL
  // *********************************************************

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
    this.cdr.markForCheck();
  }

  cerrarModal(): void {
    this.cancelarCarga();
    this.limpiarDatos();

    // El componente padre controla mostrarModal.
    this.modalCerrado.emit();

    if (!this.destruido) {
      this.cdr.markForCheck();
    }
  }

  // *********************************************************
  // LIMPIEZA
  // *********************************************************

  private cancelarCarga(): void {
    this.cargaSubscription?.unsubscribe();
    this.cargaSubscription = undefined;
    this.loading = false;
  }

  private limpiarDatos(): void {
    this.usuario = null;
    this.errorCarga = null;
  }
}
