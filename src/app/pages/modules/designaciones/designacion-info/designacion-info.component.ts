import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'designacion-info',
  imports: [CommonModule, DatePipe],
  templateUrl: './designacion-info.component.html',
  styles: ``
})
export class DesignacionInfoComponent {

  @Input() mostrarDetalle = false;
  @Input() designacion: any;

  @Output() cerrar = new EventEmitter<void>();


  //  Cerrar el modal
  cerrarModal(): void {
    this.mostrarDetalle = false;
    this.cerrar.emit();
    // this.formExpediente.reset();
  }

}
