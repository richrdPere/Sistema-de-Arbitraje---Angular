import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { catchError, finalize, interval, of, Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Services
import { MesaPartesService } from 'src/app/pages/features/solicitudes/services/mesa-partes.service';

import { MesaPartesFormService } from 'src/app/pages/features/solicitudes/services/mesa-partes-form.service';

// Components
import { StepDemandanteComponent } from './steps/step-demandante/step-demandante.component';
import { StepDemandadoComponent } from './steps/step-demandado/step-demandado.component';
import { StepSolicitudComponent } from './steps/step-solicitud/step-solicitud.component';
import { StepArchivosComponent } from './steps/step-archivos/step-archivos.component';
import { StepResumenComponent } from './steps/step-resumen/step-resumen.component';

@Component({
  selector: 'app-mesa-partes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StepDemandanteComponent,
    StepDemandadoComponent,
    StepSolicitudComponent,
    // StepArchivosComponent,
    StepResumenComponent,
  ],
  templateUrl: './mesa_partes.component.html',
})
export class MesaPartesComponent implements OnInit {

  private readonly destroyRef = inject(DestroyRef);

  // *********************************************************
  // ESTADO
  // *********************************************************
  fechaActual = '';
  numeroSolicitud = '';
  currentStep = 1;

  readonly totalSteps = 5;

  cargandoPreview = false;
  errorPreview = '';

  private previewSubscription?: Subscription;

  constructor(
    private readonly mesaPartesService: MesaPartesService,
    private readonly mesaPartesFormService: MesaPartesFormService,
  ) { }

  // *********************************************************
  // INICIALIZACIÓN
  // *********************************************************
  ngOnInit(): void {
    this.actualizarFechaHora();
    this.obtenerPreview();

    interval(1000)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.actualizarFechaHora();
      });
  }

  // *********************************************************
  // PREVIEW DEL NÚMERO DE TRÁMITE
  // Es referencial; el definitivo lo asigna el backend.
  // *********************************************************
  obtenerPreview(): void {
    this.previewSubscription?.unsubscribe();

    this.numeroSolicitud = '';
    this.errorPreview = '';
    this.cargandoPreview = true;

    this.previewSubscription = this.mesaPartesService
      .previewNumeroTramite()
      .pipe(
        catchError(() => {
          this.errorPreview =
            'No se pudo obtener el número referencial del trámite.';

          return of(null);
        }),

        finalize(() => {
          this.cargandoPreview = false;
        }),

        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        if (!response) {
          return;
        }

        if (!response.success) {
          this.errorPreview =
            response.message ||
            'No se pudo obtener el número referencial.';

          return;
        }

        this.numeroSolicitud = this.extraerNumeroPreview(
          response.data,
        );

        if (!this.numeroSolicitud) {
          this.errorPreview =
            'La respuesta no contiene el número referencial.';
        }
      });
  }

  // No se compartió todavía la interface del preview.
  // Esta lectura admite data.numero_tramite o data.numero.
  private extraerNumeroPreview(data: unknown): string {
    if (
      !data ||
      typeof data !== 'object'
    ) {
      return '';
    }

    if (
      'numero_tramite' in data &&
      typeof data.numero_tramite === 'string'
    ) {
      return data.numero_tramite;
    }

    if (
      'numero' in data &&
      typeof data.numero === 'string'
    ) {
      return data.numero;
    }

    return '';
  }

  // *********************************************************
  // FECHA Y HORA DE PERÚ
  // *********************************************************
  actualizarFechaHora(): void {
    const partes = new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date());

    const obtener = (tipo: string): string =>
      partes.find((parte) => parte.type === tipo)?.value || '';

    this.fechaActual =
      `${obtener('year')}/${obtener('month')}/${obtener('day')}` +
      ` - ${obtener('hour')}:${obtener('minute')}`;
  }

  // *********************************************************
  // NAVEGACIÓN
  // Los subcomponentes validan antes de emitir nextStep.
  // *********************************************************
  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  irAlPaso(paso: number): void {
    if (
      !Number.isInteger(paso) ||
      paso < 1 ||
      paso > this.totalSteps
    ) {
      return;
    }

    // El avance se realiza mediante nextStep,
    // después de validar el paso actual.
    if (paso <= this.currentStep) {
      this.currentStep = paso;
    }
  }

  // *********************************************************
  // REINICIAR
  // *********************************************************
  resetFormulario(): void {
    this.mesaPartesFormService.reset();

    this.currentStep = 1;

    this.obtenerPreview();
  }
}
