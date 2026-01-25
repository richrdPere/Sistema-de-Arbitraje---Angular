import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'solicitud-aprobado',
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitud-aprobado.component.html',
  styles: ``
})
export class SolicitudAprobadoComponent {

  @Input() visible = false;
  @Input() tramite: any;

  @Output() cerrar = new EventEmitter<void>();
  @Output() aprobar = new EventEmitter<void>();
  @Output() rechazar = new EventEmitter<string>();

  nuevoEstado: '' | 'rechazada' = '';
  razonRechazo = '';

  cerrarModal() {
    this.nuevoEstado = '';
    this.razonRechazo = '';
    this.cerrar.emit();
  }

  confirmarAprobacion() {
    this.aprobar.emit();
  }

  confirmarRechazo() {
    this.rechazar.emit(this.razonRechazo);
    this.nuevoEstado = '';
    this.razonRechazo = '';
  }
}
