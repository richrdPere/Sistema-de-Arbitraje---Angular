import { CommonModule, DatePipe, } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges, } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

// Service
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';


@Component({
  selector: 'ver-expediente',
  imports: [ReactiveFormsModule, CommonModule, DatePipe],
  templateUrl: './ver-expediente.component.html',
  styles: ``
})
export class VerExpedienteComponent {

  @Input() mostrarModal = false;
  @Input() expedienteId: number | null = null;

  @Output() modalCerrado = new EventEmitter<void>();

  expediente!: any;
  loading = false;


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

  constructor(private expedienteService: ExpedientesService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expedienteId'] && this.expedienteId) {
      this.cargarDatosExpediente();
      this.setModalWidth('lg');
    }
  }

  cargarDatosExpediente() {
    this.loading = true;

    this.expedienteService.getExpedienteById(this.expedienteId!).subscribe({
      next: (data) => {

        console.log("GET EXPEDIENTE ID: ", data);
        this.expediente = data;
        this.loading = false;

      },
      error: (err) => {

        this.loading = false;
      },
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.modalCerrado.emit();
  }

  getBadgeClass(rol: string): string {
    switch (rol) {
      case 'DEMANDANTE':
        return 'badge-primary';
      case 'DEMANDADO':
        return 'badge-secondary';
      case 'ÁRBITRO':
        return 'badge-accent';
      default:
        return 'badge-ghost';
    }
  }

  getFileBadgeClass(tipo: string): string {
    switch (tipo?.toLowerCase()) {
      case 'pdf':
        return 'badge-error'; // rojo
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
}
