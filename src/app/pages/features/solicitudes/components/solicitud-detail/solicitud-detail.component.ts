import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Subscription, finalize } from 'rxjs';

// Service
import { MesaPartesService } from '../../services/mesa-partes.service';

// Interfaces
import { GetTramiteByIdData, MesaPartesPersonaIdentidad } from '../../interfaces';

@Component({
  selector: 'solicitud-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitud-detail.component.html',
  styles: ``,
})
export class SolicitudDetailComponent
  implements OnChanges, OnDestroy {

  // ==========================================================
  // INPUTS
  // ==========================================================

  @Input() mostrarModal = false;

  // Acepta el objeto del listado: únicamente necesita su ID
  // para consultar el detalle completo.
  @Input() tramite: Pick<
    GetTramiteByIdData,
    'id_tramite'
  > | null = null;

  // ==========================================================
  // OUTPUT
  // ==========================================================

  @Output() cerrar = new EventEmitter<void>();

  // ==========================================================
  // ESTADO
  // ==========================================================

  detalle: GetTramiteByIdData | null = null;

  loading = false;
  errorMensaje = '';

  modalWidthClass = 'max-w-4xl';

  private consultaSubscription?: Subscription;

  // ==========================================================
  // CONSTRUCTOR
  // ==========================================================

  constructor(
    private readonly mesaPartesService: MesaPartesService,
  ) { }

  // ==========================================================
  // CICLO DE VIDA
  // ==========================================================

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.mostrarModal) {
      this.limpiarEstado();
      return;
    }

    if (
      changes['mostrarModal'] ||
      changes['tramite']
    ) {
      this.setModalWidth('xl');
      this.cargarDetalle();
    }
  }

  ngOnDestroy(): void {
    this.consultaSubscription?.unsubscribe();
  }

  // ==========================================================
  // ANCHO DEL MODAL
  // ==========================================================

  setModalWidth(
    size: 'sm' | 'md' | 'lg' | 'xl' | 'full',
  ): void {
    const map = {
      sm: 'max-w-md',
      md: 'max-w-xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-full w-[95vw]',
    };

    this.modalWidthClass = map[size];
  }

  // ==========================================================
  // CARGAR DETALLE
  // ==========================================================

  cargarDetalle(): void {
    this.consultaSubscription?.unsubscribe();

    this.detalle = null;
    this.errorMensaje = '';

    const id = this.tramite?.id_tramite;

    if (
      typeof id !== 'number' ||
      !Number.isInteger(id) ||
      id <= 0
    ) {
      this.loading = false;
      this.errorMensaje =
        'No se ha seleccionado un trámite válido.';
      return;
    }

    this.loading = true;

    this.consultaSubscription = this.mesaPartesService
      .getTramiteById(id)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.errorMensaje =
              response.message ||
              'No se pudo obtener el detalle del trámite.';
            return;
          }

          this.detalle = response.data;
        },

        error: (error: unknown) => {
          this.errorMensaje =
            this.obtenerMensajeError(error);
        },
      });
  }

  // ==========================================================
  // CERRAR
  // ==========================================================

  cerrarModal(): void {
    this.limpiarEstado();

    // El padre actualiza mostrarModal.
    this.cerrar.emit();
  }

  private limpiarEstado(): void {
    this.consultaSubscription?.unsubscribe();
    this.consultaSubscription = undefined;

    this.detalle = null;
    this.loading = false;
    this.errorMensaje = '';
  }

  // ==========================================================
  // HELPERS PARA LA VISTA
  // ==========================================================

  get badgeEstadoClass(): string {
    switch (this.detalle?.estado) {
      case 'APROBADA':
        return 'badge-success';

      case 'PENDIENTE':
        return 'badge-warning';

      case 'RECHAZADA':
        return 'badge-error';

      default:
        return 'badge-info';
    }
  }

  getTipoSolicitudLabel(tipo: string): string {
    switch (tipo) {
      case 'ARBITRAJE_INSTITUCIONAL':
        return 'Arbitraje Institucional';

      case 'ARBITRAJE_DE_EMERGENCIA':
        return 'Arbitraje de Emergencia';

      case 'ARBITRAJE_AD_HOC':
        return 'Arbitraje Ad Hoc';

      default:
        return tipo;
    }
  }

  getNombrePersona(
    persona: MesaPartesPersonaIdentidad | null,
  ): string {
    if (!persona) {
      return 'No registrado';
    }

    switch (persona.tipo) {
      case 'NATURAL':
        return [
          persona.nombres,
          persona.apellidos,
        ]
          .filter(Boolean)
          .join(' ')
          .trim() || 'Sin nombre registrado';

      case 'JURIDICA':
        return persona.razon_social ||
          'Sin razón social';

      case 'ENTIDAD_PUBLICA':
        return persona.nombre_entidad ||
          'Sin nombre de entidad';

      default:
        return 'No registrado';
    }
  }

  // ==========================================================
  // ERRORES
  // ==========================================================

  private obtenerMensajeError(error: unknown): string {
    if (typeof error === 'string' && error.trim()) {
      return error;
    }

    if (this.esObjeto(error)) {
      const detalle = error['error'];

      if (
        this.esObjeto(detalle) &&
        typeof detalle['message'] === 'string' &&
        detalle['message'].trim()
      ) {
        return detalle['message'];
      }

      if (
        typeof error['message'] === 'string' &&
        error['message'].trim()
      ) {
        return error['message'];
      }
    }

    return 'No se pudo obtener el detalle del trámite.';
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
}
