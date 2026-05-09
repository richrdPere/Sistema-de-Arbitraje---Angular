import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DesignacionFormService } from 'src/app/services/designacion-participes.service';

@Component({
  selector: 'step-arbitros',
  imports: [CommonModule, FormsModule],
  templateUrl: './step-arbitros.component.html',
  styles: ``
})
export class StepArbitrosComponent {
  arbitro_id!: number;

  nombres = '';

  apellidos = '';

  constructor(
    public designacionFormService:
      DesignacionFormService
  ) { }

  agregar() {

    this.designacionFormService.addArbitro({
      arbitro_id: this.arbitro_id,
      nombres: this.nombres,
      apellidos: this.apellidos,
      designado_por: 'INSTITUCION',
      rol: 'ARBITRO_UNICO'
    });

    this.arbitro_id = 0;
    this.nombres = '';
    this.apellidos = '';
  }
}
