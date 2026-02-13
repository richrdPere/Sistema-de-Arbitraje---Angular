import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

// Services
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';

@Component({
  selector: 'ver-trazabilidad',
  imports: [DatePipe, CommonModule],
  templateUrl: './ver-trazabilidad.component.html',
  styles: ``
})
export class VerTrazabilidadComponent implements OnChanges {
  @Input() mostrarModal = false;
  @Input() expedienteId: number | null = null;

  @Output() modalCerrado = new EventEmitter<void>();


  loading = false;
  trazabilidad: any;        // resumen
  timeline: any[] = [];    // historial / eventos

  // Ancho de modal
  modalWidthClass = 'max-w-4xl'; // default

  setModalWidth(size: 'sm' | 'md' | 'lg' | 'xl' | 'full') {
    const map = {
      sm: 'max-w-md',
      md: 'max-w-xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-full w-[95vw]'
    };

    this.modalWidthClass = map[size];
  }

  constructor(
    private expedientesService: ExpedientesService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expedienteId'] && this.expedienteId) {
      console.log('Expediente ID recibido:', this.expedienteId);
      this.cargarTrazabilidad();
      this.setModalWidth('full');
    }
  }

  cargarTrazabilidad() {
    this.loading = true;

    this.expedientesService.obtenerTrazabilidad(this.expedienteId!)
      .subscribe({
        next: (resp) => {
          this.trazabilidad = resp;
          console.log('Trazabilidad cargada:', this.trazabilidad);

          this.timeline = resp.timeline || [];
          console.log('Timeline cargado:', this.timeline);

          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar trazabilidad', err);
          this.loading = false;
        }
      });
  }

  //  Cerrar el modal
  cerrarModal(): void {
    this.mostrarModal = false;
    this.modalCerrado.emit();

  }

}
