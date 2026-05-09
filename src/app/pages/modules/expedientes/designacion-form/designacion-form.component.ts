import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { DesignacionFormService } from 'src/app/services/designacion-participes.service';
import { DesignacionService } from '../../../../services/designacion.service';

import { StepDemandantesComponent } from "./steps/step-demandantes/step-demandantes.component";
import { StepDemandadosComponent } from "./steps/step-demandados/step-demandados.component";
import { StepArbitrosComponent } from "./steps/step-arbitros/step-arbitros.component";
import { StepConfirmacionComponent } from "./steps/step-confirmacion/step-confirmacion.component";

// Service
@Component({
  selector: 'designacion-form',
  imports: [CommonModule, StepDemandantesComponent, StepDemandadosComponent, StepArbitrosComponent, StepConfirmacionComponent],
  templateUrl: './designacion-form.component.html',
  styles: ``
})
export class DesignacionFormComponent implements OnInit {

  @Input() mostrarModal = false;
  @Input() expedienteId!: number;

  @Output() modalCerrado = new EventEmitter<void>();
  @Output() designacionCreado = new EventEmitter<void>();

  state: any;

  // Step
  currentStep: number = 1;
  totalSteps = 4;

  constructor(
    public designacionFormService: DesignacionFormService,
    private designacionService: DesignacionService
  ) { }

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

  ngOnInit(): void {
    this.setModalWidth('xl');
    this.designacionFormService.init(
      this.expedienteId,
      'AD_HOC'
    );

    this.designacionFormService
      .getState()
      .subscribe(state => {
        this.state = state;
      });
  }

  // ==========================
  // NEXT
  // ==========================
  // nextStep() {

  //   try {
  //     this.designacionFormService.nextStep();
  //   } catch (error: any) {

  //     Swal.fire({
  //       icon: 'warning',
  //       title: 'Validación',
  //       text: error.message
  //     });
  //   }
  // }

  // ==========================
  // PREV
  // ==========================
  // prevStep() {
  //   this.designacionFormService.prevStep();
  // }


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

    // if (!this.puedeIrAlPaso(step)) {
    //   return; // BLOQUEA
    // }


    this.currentStep = step;
  }

  // ==========================
  // FINALIZAR
  // ==========================
  guardarDesignacion() {

    const payload =
      this.designacionFormService.buildPayload();

    console.log(payload);

    Swal.fire({
      title: 'Creando designación...',
      allowOutsideClick: false,

      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.designacionService
      .newDesignacion(payload)
      .subscribe({

        next: () => {

          Swal.fire({
            icon: 'success',
            title: 'Designación creada'
          });

          this.designacionFormService.reset();
        },

        error: (err) => {

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              err?.error?.message ||
              'Error al crear designación'
          });
        }
      });
  }

  // - Validador
  puedeIrAlPaso(step: number): boolean {

    // // MODO EDICIÓN: TODO LIBRE
    // if (this.modoEdicion) return true;

    // const persona = this.expedienteFormService.getPersona();
    // const expediente = this.expedienteFormService.getExpediente();

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


  // - Cerrar el modal
  cerrarModal(): void {
    this.mostrarModal = false;
    this.modalCerrado.emit();
    this.designacionFormService.reset();

    // this.designacionCreado = null; //  MUY IMPORTANTE
  }
}
