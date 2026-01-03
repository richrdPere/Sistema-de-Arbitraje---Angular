import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'solicitud-detail',
    standalone: true,
  imports: [CommonModule, TitleCasePipe, DatePipe, ],
  templateUrl: './solicitud-detail.component.html',
  styles: ``
})
export class SolicitudDetailComponent implements OnInit{

  @Input() mostrarModal = false;
  @Input() tramite: any = null;

  @Output() cerrar = new EventEmitter<void>();

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

  cerrarModal() {
    this.cerrar.emit();
  }


  ngOnInit() {
    console.log("TRAMITE DETALLE: ", this.tramite);
    this.setModalWidth('lg');

  }

  get badgeEstadoClass(): string {
    switch (this.tramite?.estado) {
      case 'aprobada':
        return 'badge-success';
      case 'pendiente':
        return 'badge-warning';
      case 'rechazada':
        return 'badge-error';
      default:
        return 'badge-info';
    }
  }

}
