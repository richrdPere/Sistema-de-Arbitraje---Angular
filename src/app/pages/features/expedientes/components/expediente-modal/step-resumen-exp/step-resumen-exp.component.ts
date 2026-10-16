import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

// Directives
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';
import { ExpedienteFormService } from 'src/app/services/admin/expedientes-form.service';


@Component({
  selector: 'step-resumen-exp',
  imports: [CommonModule],
  templateUrl: './step-resumen-exp.component.html',
  styles: ``
})
export class StepResumenExpComponent implements OnInit {

  @Output() prevStep = new EventEmitter<void>();
  @Output() resetStepper = new EventEmitter<void>();
  @Output() expedienteGuardado = new EventEmitter<void>();

  data: any;
  loading = false;

  constructor(
    private expedienteFormService: ExpedienteFormService,
    private expedienteService: ExpedientesService,
  ) { }

  ngOnInit(): void {
    this.data = this.expedienteFormService.buildPayload();
  }


  // VOLVER
  volver() {
    this.prevStep.emit();
  }

  // =========================
  // ENVIAR FINAL
  // =========================
  guardar() {

    this.loading = true;

    const payload = this.expedienteFormService.buildPayload();

    const isEdit = this.expedienteFormService.getModoEdicion();
    const id = this.expedienteFormService.getExpedienteId();


    // =========================
    // EDITAR EXPEDIENTE
    // =========================

    if (isEdit && id) {

      this.expedienteService.updateExpediente(id, payload)
        .subscribe({
          next: () => {
            this.loading = false;

            Swal.fire({
              icon: 'success',
              title: 'Expediente actualizado correctamente'
            });

            this.expedienteGuardado.emit();
            this.resetStepper.emit();
          },
          error: (err) => {
            this.loading = false;

            Swal.fire({
              icon: 'error',
              title: 'Error al actualizar expediente',
              text: err.error?.message || 'Error desconocido'
            });
          }
        });

      return;
    }

    // =========================
    // CREAR EXPEDIENTE
    // =========================
    this.expedienteService.newExpediente(payload)
      .subscribe({
        next: () => {
          this.loading = false;

          Swal.fire({
            icon: 'success',
            title: 'Expediente creado correctamente'
          });

          this.expedienteGuardado.emit();
          this.resetStepper.emit();
        },
        error: (err) => {
          this.loading = false;

          Swal.fire({
            icon: 'error',
            title: 'Error al crear expediente',
            text: err.error?.message || 'Error desconocido'
          });
        }
      });
  }

  // =========================
  // DATA VIEW (helpers opcional)
  // =========================
  get persona() {
    return this.data?.persona || {};
  }

  get expediente() {
    return this.data?.expediente || {};
  }

  get esEdicion(): boolean {
    return this.expedienteFormService.getModoEdicion();
  }
}
