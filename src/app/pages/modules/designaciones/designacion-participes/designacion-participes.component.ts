import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'designacion-participes',
  imports: [CommonModule, DatePipe],
  templateUrl: './designacion-participes.component.html',
  styles: ``
})
export class DesignacionParticipesComponent {
  @Input() mostrarParticipe = false;
  @Input() participantes: any[] = [];
  @Output() cerrar = new EventEmitter<void>();

  //  Cerrar el modal
  cerrarModal(): void {
    this.mostrarParticipe = false;
    this.cerrar.emit();

  }
}
