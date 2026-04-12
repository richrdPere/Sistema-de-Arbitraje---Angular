import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

// Services
import { TramiteMPVFormService } from 'src/app/services/tramiteMPV-form.service';
import { TramiteMPVService } from 'src/app/services/tramiteMPV.service';


@Component({
  selector: 'step-resumen',
  imports: [CommonModule],
  templateUrl: './step-resumen.component.html',
  styles: ``
})
export class StepResumenComponent implements OnInit {
  @Output() prevStep = new EventEmitter<void>();

  data: any;
  loading = false;

  constructor(
    private tramiteFormService: TramiteMPVFormService,
    private tramiteService: TramiteMPVService,
  ) { }

  ngOnInit(): void {
    this.data = this.tramiteFormService.getFormData();
  }

  // =========================
  // FORMATEAR ENVÍO
  // =========================
  construirPayload() {
    return {
      demandante: this.data.demandante,
      demandado: this.data.demandado,
      solicitud: this.data.solicitud
    };
  }

  construirFormData() {
    const formData = new FormData();

    // JSON
    formData.append('data', JSON.stringify(this.construirPayload()));

    // FILES
    this.data.archivos.forEach((file: File) => {
      formData.append('files', file);
    });



    return formData;
  }

  // =========================
  // ENVIAR
  // =========================
  enviar() {
    this.loading = true;

    const formData = this.construirFormData();

    console.log("ENVIANDO DATA: ", formData);
    this.tramiteService.newTramite(formData)
      .subscribe({
        next: (response: any) => {
          this.loading = false;

          Swal.fire({
            title: 'Trámite registrado correctamente',
            html: `
                 <div class="text-left">
                   <p><strong>Número de trámite:</strong> ${response.tramite.numero_tramite}</p>
                   <p><strong>Estado:</strong> ${response.tramite.estado} </p>
                   <p><strong>Mensaje:</strong> Sirvase revisar su correo electrónico para más instrucciones</p>
                 </div>
               `,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#198754',
          });

          this.tramiteFormService.reset();
        },
        error: (err) => {
          this.loading = false;

          Swal.fire({
            icon: 'error',
            title: 'Error al registrar la solicitud',
            text: err?.message || 'Ocurrió un error al procesar tu trámite.',
            confirmButtonColor: '#d33'
          });
        }
      });
  }

  volver() {
    this.prevStep.emit();
  }
}
