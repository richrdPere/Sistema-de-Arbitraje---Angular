import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Service
import { TramiteMPVService } from 'src/app/services/tramiteMPV.service';
import { TramiteMPVFormService } from 'src/app/services/tramiteMPV-form.service';

// Components
import { StepDemandanteComponent } from "./steps/step-demandante/step-demandante.component";
import { StepDemandadoComponent } from "./steps/step-demandado/step-demandado.component";
import { StepSolicitudComponent } from "./steps/step-solicitud/step-solicitud.component";
import { StepArchivosComponent } from "./steps/step-archivos/step-archivos.component";
import { StepResumenComponent } from "./steps/step-resumen/step-resumen.component";

// Interface
export interface TramiteForm {
  demandante: any;
  demandado: any;
  solicitud: any;
  archivos?: File[];
}

@Component({
  selector: 'app-mesa-partes',

  // StepArchivosComponent,
  imports: [ReactiveFormsModule, CommonModule, StepDemandanteComponent, StepDemandadoComponent, StepSolicitudComponent, StepResumenComponent],
  templateUrl: './mesa_partes.component.html',
})
export class MesaPartesComponent implements OnInit {

  fechaActual: string = '';
  numeroSolicitud: string = '';
  currentStep: number = 1;

  constructor(
    private tramiteService: TramiteMPVService,
    private tramiteFormService: TramiteMPVFormService) {
  }

  ngOnInit() {
    this.actualizarFechaHora();
    this.obtenerPreview();

    // Actualiza cada segundo
    setInterval(() => {
      this.actualizarFechaHora();
    }, 1000);
  }

  obtenerPreview() {
    this.tramiteService.previewNumeroTramite()
      .subscribe(resp => {
        this.numeroSolicitud = resp.numero;

      });
  }

  actualizarFechaHora() {
    const ahora = new Date();

    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');

    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');

    this.fechaActual = `${anio}/${mes}/${dia} - ${horas}:${minutos}`;
  }

  // STEPS
  // - Pasar al siguiente paso si es válido
  nextStep() {
    if (this.currentStep < 4) this.currentStep++;
  }

  // - Retroceder al paso anterior
  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  // - Ir a un paso específico (opcional)
  irAlPaso(paso: number) {
    this.currentStep = paso;
  }

  // - Resetear el formulario
  resetFormulario() {
    this.currentStep = 1;

    // opcional: volver a generar número preview
    this.obtenerPreview();
  }
}
