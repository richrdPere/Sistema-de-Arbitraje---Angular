import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

// Service
import { DesignacionParticipesService } from 'src/app/services/designacion-participes.service';

@Component({
  selector: 'designacion-form',
  imports: [CommonModule],
  templateUrl: './designacion-form.component.html',
  styles: ``
})
export class DesignacionFormComponent {

  @Input() mostrarModal = false;
  @Input() modoEdicion = false;
  @Input() designacionSeleccionada: any = null;

  @Output() modalCerrado = new EventEmitter<void>();
  @Output() designacionCreada = new EventEmitter<void>();

  // Step
  currentStep: number = 1;
  totalSteps = 4;


  constructor(
    public designacionParticipeService: DesignacionParticipesService
  ) { }



  // ============================
  // STEP'S
  // ============================

  // - Validador
  puedeIrAlPaso(step: number): boolean {

    // // MODO EDICIÓN: TODO LIBRE
    // if (this.modoEdicion) return true;

    // const persona = this.designacionParticipeService.get();
    // const expediente = this.designacionParticipeService.getExpediente();

    // // STEP 1 → siempre permitido
    // if (step === 1) return true;

    // // STEP 2 → validar persona
    // if (step === 2) {
    //   return !!(persona?.tipo && persona?.email);
    // }

    // // STEP 3 → validar expediente
    // if (step === 3) {
    //   return !!(
    //     persona?.tipo &&
    //     expediente?.titulo &&
    //     expediente?.codigo &&
    //     expediente?.tipo
    //   );
    // }

    return false;
  }

  // - Retrocede
  nextStep() {
    if (this.currentStep < 3) this.currentStep++;

  }

  // - Avanza
  prevStep() {

    if (this.currentStep > 1) this.currentStep--;
  }

  // - Ir al step
  irAlPaso(step: number) {

    if (!this.puedeIrAlPaso(step)) {
      return; // BLOQUEA
    }


    this.currentStep = step;
  }



  // - Cerrar el modal
  cerrarModal(): void {
    this.mostrarModal = false;
    this.modalCerrado.emit();
    this.designacionParticipeService.reset();

    this.designacionSeleccionada = null; //  MUY IMPORTANTE
  }
}
