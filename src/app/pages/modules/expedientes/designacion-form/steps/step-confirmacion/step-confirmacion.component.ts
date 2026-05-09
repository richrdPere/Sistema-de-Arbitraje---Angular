import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DesignacionFormService } from 'src/app/services/designacion-participes.service';

@Component({
  selector: 'step-confirmacion',
  imports: [CommonModule, FormsModule],
  templateUrl: './step-confirmacion.component.html',
  styles: ``
})
export class StepConfirmacionComponent {
  constructor(
    public designacionState:
      DesignacionFormService
  ) { }
}
