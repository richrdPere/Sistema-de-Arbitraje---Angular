import { CommonModule, DatePipe } from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';

import { Subscription, finalize } from 'rxjs';

// Service
import { ExpedientesService } from
  'src/app/pages/features/expedientes/services/expedientes.service';

// Interfaces
import { ExpedienteDetalleData } from
  'src/app/pages/features/expedientes/interfaces';

@Component({
  selector: 'ver-expediente',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './ver-expediente.component.html',
  styles: ``,
})
export class VerExpedienteComponent
  implements OnChanges, OnDestroy {

  // ==========================================================
  // INPUTS
  // ==========================================================

  @Input() mostrarModal = false;
  @Input() expedienteId: number | null = null;

  // ==========================================================
  // OUTPUTS
  // ==========================================================

  @Output() modalCerrado = new EventEmitter<void>();

  // ==========================================================
  // ESTADO
  // ==========================================================

  expediente: ExpedienteDetalleData | null = null;

  loading = false;
  errorMensaje = '';

  modalWidthClass = 'max-w-4xl';

  private consultaSubscription?: Subscription;

  // ==========================================================
  // CONSTRUCTOR
  // ==========================================================

  constructor(
    private readonly expedienteService: ExpedientesService,
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
      changes['expedienteId']
    ) {
      this.setModalWidth('lg');
      this.cargarDatosExpediente();
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
  // CARGAR EXPEDIENTE
  // ==========================================================

  cargarDatosExpediente(): void {
    // Cancela la consulta anterior antes de iniciar otra.
    this.consultaSubscription?.unsubscribe();

    this.expediente = null;
    this.errorMensaje = '';

    const id = this.expedienteId;

    if (
      id === null ||
      !Number.isInteger(id) ||
      id <= 0
    ) {
      this.loading = false;
      this.errorMensaje =
        'No se ha seleccionado un expediente válido.';
      return;
    }

    this.loading = true;

    this.consultaSubscription = this.expedienteService
      .getExpedienteById(id)
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
              'No se pudo obtener el expediente.';
            return;
          }

          // ApiResponse contiene el expediente en data.
          this.expediente = response.data;
        },

        error: (error: unknown) => {
          this.errorMensaje =
            this.obtenerMensajeError(error);
        },
      });
  }

  // ==========================================================
  // CERRAR MODAL
  // ==========================================================

  cerrarModal(): void {
    this.limpiarEstado();

    // El componente padre actualiza mostrarModal.
    this.modalCerrado.emit();
  }

  private limpiarEstado(): void {
    this.consultaSubscription?.unsubscribe();
    this.consultaSubscription = undefined;

    this.expediente = null;
    this.loading = false;
    this.errorMensaje = '';
  }

  // ==========================================================
  // HELPERS DE PRESENTACIÓN
  // ==========================================================

  getBadgeClass(rol: string): string {
    switch (rol) {
      case 'DEMANDANTE':
        return 'badge-primary';

      case 'DEMANDADO':
        return 'badge-secondary';

      case 'TERCERO':
        return 'badge-accent';

      default:
        return 'badge-ghost';
    }
  }

  getTipoLabel(tipo: string): string {
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

  getFileBadgeClass(
    tipo: string | null | undefined,
  ): string {
    switch (tipo?.toLowerCase()) {
      case 'pdf':
        return 'badge-error';

      case 'doc':
      case 'docx':
        return 'badge-primary';

      case 'xls':
      case 'xlsx':
        return 'badge-success';

      case 'png':
      case 'jpg':
      case 'jpeg':
        return 'badge-accent';

      default:
        return 'badge-ghost';
    }
  }

  imprimir(): void {
    if (this.loading || !this.expediente) {
      return;
    }

    window.print();
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

    return 'No se pudo obtener el expediente.';
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

// import { CommonModule, DatePipe, } from '@angular/common';
// import { Component, EventEmitter, Input, Output, SimpleChanges, } from '@angular/core';
// import { ReactiveFormsModule } from '@angular/forms';

// // Service
// import { ExpedientesService } from 'src/app/pages/features/expedientes/services/expedientes.service';


// @Component({
//   selector: 'ver-expediente',
//   imports: [ReactiveFormsModule, CommonModule, DatePipe],
//   templateUrl: './ver-expediente.component.html',
//   styles: ``
// })
// export class VerExpedienteComponent {

//   @Input() mostrarModal = false;
//   @Input() expedienteId: number | null = null;

//   @Output() modalCerrado = new EventEmitter<void>();

//   expediente!: any;
//   loading = false;


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

//   constructor(private expedienteService: ExpedientesService) { }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['expedienteId'] && this.expedienteId) {
//       this.cargarDatosExpediente();
//       this.setModalWidth('lg');
//     }
//   }

//   cargarDatosExpediente() {
//     this.loading = true;

//     this.expedienteService.getExpedienteById(this.expedienteId!).subscribe({
//       next: (data) => {

//         console.log("GET EXPEDIENTE ID: ", data);
//         this.expediente = data;
//         this.loading = false;

//       },
//       error: (err) => {

//         this.loading = false;
//       },
//     });
//   }

//   cerrarModal(): void {
//     this.mostrarModal = false;
//     this.modalCerrado.emit();
//   }

//   getBadgeClass(rol: string): string {
//     switch (rol) {
//       case 'DEMANDANTE':
//         return 'badge-primary';
//       case 'DEMANDADO':
//         return 'badge-secondary';
//       case 'ÁRBITRO':
//         return 'badge-accent';
//       default:
//         return 'badge-ghost';
//     }
//   }

//   getFileBadgeClass(tipo: string): string {
//     switch (tipo?.toLowerCase()) {
//       case 'pdf':
//         return 'badge-error'; // rojo
//       case 'doc':
//       case 'docx':
//         return 'badge-primary';
//       case 'xls':
//       case 'xlsx':
//         return 'badge-success';
//       case 'png':
//       case 'jpg':
//       case 'jpeg':
//         return 'badge-accent';
//       default:
//         return 'badge-ghost';
//     }
//   }
// }
