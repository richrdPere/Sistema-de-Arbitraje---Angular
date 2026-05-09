import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DesignacionFormService } from 'src/app/services/designacion-participes.service';

@Component({
  selector: 'step-demandados',
  imports: [CommonModule, FormsModule],
  templateUrl: './step-demandados.component.html',
  styles: ``
})
export class StepDemandadosComponent {
  persona_id!: number;

  nombres = '';

  apellidos = '';

  constructor(
    public designacionFormService:
      DesignacionFormService
  ) { }

  agregar() {

    if (!this.persona_id) return;

    this.designacionFormService.addDemandante({
      persona_id: this.persona_id,
      nombres: this.nombres,
      apellidos: this.apellidos,
      rol: 'DEMANDADO'
    });

    this.persona_id = 0;
    this.nombres = '';
    this.apellidos = '';
  }
}
