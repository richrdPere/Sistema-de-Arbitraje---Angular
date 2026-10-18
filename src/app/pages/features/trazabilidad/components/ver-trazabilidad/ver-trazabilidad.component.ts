import { CommonModule } from '@angular/common';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';

import { finalize, Subscription } from 'rxjs';

// Services
import {
  ExpedientesService,
} from 'src/app/pages/features/expedientes/services/expedientes.service';

// Interfaces
import {
  ExpedienteEstado,
  ExpedienteTipo,
  ExpedienteTrazabilidadData,
  ExpedienteTrazabilidadMovimiento,
} from 'src/app/pages/features/expedientes/interfaces';

// *********************************************************
// MOVIMIENTO PARA PRESENTACIÓN
// *********************************************************

interface MovimientoTrazabilidadVista
  extends ExpedienteTrazabilidadMovimiento {
  detalleFormateado: string;
}

@Component({
  selector: 'ver-trazabilidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ver-trazabilidad.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerTrazabilidadComponent
  implements OnChanges, OnDestroy {

  // *********************************************************
  // INPUTS / OUTPUTS
  // *********************************************************

  @Input() mostrarModal = false;
  @Input() expedienteId: number | null = null;

  @Output() modalCerrado = new EventEmitter<void>();

  // *********************************************************
  // ESTADO
  // *********************************************************

  trazabilidad: ExpedienteTrazabilidadData | null = null;
  timeline: MovimientoTrazabilidadVista[] = [];

  loading = false;
  errorCarga: string | null = null;

  modalWidthClass = 'max-w-6xl';

  private cargaSubscription?: Subscription;
  private destruido = false;

  constructor(
    private readonly expedientesService: ExpedientesService,
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

    // Recarga también cuando se reabre con el mismo ID.
    if (
      changes['expedienteId'] ||
      changes['mostrarModal']
    ) {
      this.cargarTrazabilidad();
    }
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.cancelarCarga();
  }

  // *********************************************************
  // CARGAR TRAZABILIDAD
  // *********************************************************

  cargarTrazabilidad(): void {
    if (this.destruido) {
      return;
    }

    this.cancelarCarga();
    this.limpiarDatos();

    if (!this.mostrarModal) {
      return;
    }

    const id = this.expedienteId;

    if (
      id === null ||
      !Number.isSafeInteger(id) ||
      id <= 0
    ) {
      this.errorCarga = 'Selecciona un expediente válido.';
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.cargaSubscription = this.expedientesService
      .getExpedienteTrazabilidad(id)
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
              'No se pudo obtener la trazabilidad del expediente.',
            );
            return;
          }

          this.trazabilidad = response.data;

          this.timeline = response.data.movimientos_recientes.map(
            (movimiento) => ({
              ...movimiento,

              detalleFormateado: this.formatearDetalle(
                movimiento.detalle,
              ),
            }),
          );

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
  // ETIQUETAS DEL EXPEDIENTE
  // *********************************************************

  getTipoLabel(tipo: ExpedienteTipo): string {
    const etiquetas: Record<ExpedienteTipo, string> = {
      ARBITRAJE_DE_EMERGENCIA: 'Arbitraje de emergencia',
      ARBITRAJE_AD_HOC: 'Arbitraje ad hoc',
      ARBITRAJE_INSTITUCIONAL: 'Arbitraje institucional',
    };

    return etiquetas[tipo] ?? tipo;
  }

  getEstadoLabel(estado: ExpedienteEstado): string {
    const etiquetas: Record<ExpedienteEstado, string> = {
      EN_ESPERA: 'En espera',
      EN_TRAMITE: 'En trámite',
      SUSPENDIDO: 'Suspendido',
      CONCLUIDO: 'Concluido',
      ARCHIVADO: 'Archivado',
      ANULADO: 'Anulado',
    };

    return etiquetas[estado] ?? estado;
  }

  getEstadoClass(estado: ExpedienteEstado): string {
    const clases: Record<ExpedienteEstado, string> = {
      EN_ESPERA: 'badge-warning',
      EN_TRAMITE: 'badge-info',
      SUSPENDIDO: 'badge-accent',
      CONCLUIDO: 'badge-success',
      ARCHIVADO: 'badge-neutral',
      ANULADO: 'badge-error',
    };

    return clases[estado] ?? 'badge-neutral';
  }

  // *********************************************************
  // ETIQUETAS DE MOVIMIENTOS
  // *********************************************************

  getActor(
    movimiento: ExpedienteTrazabilidadMovimiento,
  ): string {
    return movimiento.usuario_responsable?.trim() ||
      (
        movimiento.usuario_id !== null
          ? `Usuario #${movimiento.usuario_id}`
          : 'Actor no registrado'
      );
  }

  getEventoLabel(tipo: string): string {
    return tipo.replace(/_/g, ' ');
  }

  getEventoClass(tipo: string): string {
    switch (tipo) {
      case 'CREACION':
      case 'REGISTRO_MPV':
        return 'badge-primary';

      case 'CIERRE':
      case 'TRAMITE_MPV_APROBADO':
        return 'badge-success';

      case 'ANULACION':
      case 'TRAMITE_MPV_RECHAZADO':
        return 'badge-error';

      case 'CAMBIO_ESTADO':
      case 'REAPERTURA':
        return 'badge-warning';

      default:
        return 'badge-info';
    }
  }

  // *********************************************************
  // DETALLE: TEXTO O JSON SERIALIZADO
  // *********************************************************

  private formatearDetalle(detalle: string | null): string {
    if (!detalle?.trim()) {
      return '';
    }

    let datos: unknown;

    try {
      datos = JSON.parse(detalle);
    } catch {
      return detalle;
    }

    if (!this.esObjeto(datos)) {
      return detalle;
    }

    if (this.esObjeto(datos['cambios'])) {
      return Object.entries(datos['cambios'])
        .map(([campo, cambio]) => {
          if (!this.esObjeto(cambio)) {
            return (
              `${this.etiquetaCampo(campo)}: ` +
              this.valorTexto(cambio)
            );
          }

          return (
            `${this.etiquetaCampo(campo)}: ` +
            `${this.valorTexto(cambio['anterior'])} → ` +
            `${this.valorTexto(cambio['nuevo'])}`
          );
        })
        .join('\n');
    }

    return Object.entries(datos)
      .map(([campo, valor]) =>
        `${this.etiquetaCampo(campo)}: ${this.valorTexto(valor)}`,
      )
      .join('\n');
  }

  private etiquetaCampo(campo: string): string {
    const etiquetas: Record<string, string> = {
      titulo: 'Título',
      descripcion: 'Descripción',
      codigo: 'Código',
      tipo: 'Tipo',
      motivo: 'Motivo',

      fecha_inicio: 'Fecha de inicio',
      fecha_laudo: 'Fecha de laudo',
      fecha_resolucion: 'Fecha de resolución',

      usuario_responsable_anterior_id:
        'Responsable anterior (ID)',

      usuario_responsable_nuevo_id:
        'Nuevo responsable (ID)',
    };

    return etiquetas[campo] ?? campo.replace(/_/g, ' ');
  }

  private valorTexto(valor: unknown): string {
    if (
      valor === null ||
      valor === undefined ||
      valor === ''
    ) {
      return 'Sin valor';
    }

    return typeof valor === 'object'
      ? JSON.stringify(valor)
      : String(valor);
  }

  private esObjeto(
    value: unknown,
  ): value is Record<string, unknown> {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    );
  }

  // *********************************************************
  // ERRORES
  // *********************************************************

  private mostrarError(mensaje: string): void {
    this.trazabilidad = null;
    this.timeline = [];
    this.errorCarga = mensaje;

    this.cdr.markForCheck();
  }

  private obtenerMensajeError(error: unknown): string {
    if (typeof error === 'string') {
      return error.trim() ||
        'No se pudo cargar la trazabilidad.';
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

    return 'No se pudo cargar la trazabilidad del expediente.';
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

    // El padre controla mostrarModal.
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
    this.trazabilidad = null;
    this.timeline = [];
    this.errorCarga = null;
  }
}

// import { CommonModule, DatePipe } from '@angular/common';
// import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

// // Services
// import { ExpedientesService } from 'src/app/pages/features/expedientes/services/expedientes.service';

// @Component({
//   selector: 'ver-trazabilidad',
//   imports: [DatePipe, CommonModule],
//   templateUrl: './ver-trazabilidad.component.html',
//   styles: ``
// })
// export class VerTrazabilidadComponent implements OnChanges {
//   @Input() mostrarModal = false;
//   @Input() expedienteId: number | null = null;

//   @Output() modalCerrado = new EventEmitter<void>();


//   loading = false;
//   trazabilidad: any;        // resumen
//   timeline: any[] = [];    // historial / eventos

//   // Ancho de modal
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
//     private expedientesService: ExpedientesService,
//   ) { }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['expedienteId'] && this.expedienteId) {
//       this.cargarTrazabilidad();
//       this.setModalWidth('full');
//     }
//   }

//   cargarTrazabilidad() {
//     this.loading = true;

//     this.expedientesService.obtenerTrazabilidad(this.expedienteId!)
//       .subscribe({
//         next: (resp) => {
//           this.trazabilidad = resp;
//           this.timeline = resp.timeline || [];
//           this.loading = false;
//         },
//         error: (err) => {

//           this.loading = false;
//         }
//       });
//   }

//   //  Cerrar el modal
//   cerrarModal(): void {
//     this.mostrarModal = false;
//     this.modalCerrado.emit();

//   }

// }
