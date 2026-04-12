import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Service
import { TramiteMPVFormService } from 'src/app/services/tramiteMPV-form.service';

@Component({
  selector: 'step-solicitud',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './step-solicitud.component.html',
  styles: ``
})
export class StepSolicitudComponent implements OnInit{

  @Output() nextStep = new EventEmitter<void>();
  @Output() prevStep = new EventEmitter<void>();

  form!: FormGroup;
  descripcionTipoArbitraje: string | null = null;

  // SELECTOR
  tipoSolicitud = [
    { id: 'Arbitraje de Emergencia', nombre: 'ARBITRAJE DE EMERGENCIA' },
    { id: 'Arbitraje Ad Hoc', nombre: 'ARBITRAJE AD HOC' },
    { id: 'Arbitraje Institucional', nombre: 'ARBITRAJE INSTITUCIONAL' }
  ];

  // MAPEOS
  tipoSolicitudToCodigo: Record<string, string> = {
    'Arbitraje de Emergencia': 'AE',
    'Arbitraje Ad Hoc': 'AH',
    'Arbitraje Institucional': 'AI'
  };

  descripciones: Record<string, string> = {
    'Arbitraje de Emergencia':
      'Procedimiento excepcional y rápido destinado a resolver situaciones urgentes que requieren una medida inmediata antes de la constitución del tribunal arbitral.',

    'Arbitraje Ad Hoc':
      'Arbitraje organizado directamente por las partes, sin intervención de una institución arbitral. Las reglas y el procedimiento son definidos por los propios interesados.',

    'Arbitraje Institucional':
      'Arbitraje administrado por una institución arbitral, que brinda reglas, soporte administrativo y supervisión del procedimiento.'
  };

  // Colores opcionales para alerta
  colorAlerta = '#3b82f6';

  constructor(
    private fb: FormBuilder,
    private tramiteService: TramiteMPVFormService
  ) { }

  ngOnInit(): void {
    this.initFormSolicitud();
    this.listenTipoSolicitud();
  }

  // =========================
  // FORMULARIO
  // =========================
  initFormSolicitud() {
    this.form = this.fb.group({
      tipo_solicitud: [null, Validators.required],
      codigo: [{ value: '', disabled: true }]
    });
  }

  // =========================
  // ESCUCHAR CAMBIOS
  // =========================
  listenTipoSolicitud() {
    this.form.get('tipo_solicitud')?.valueChanges.subscribe(tipo => {
      if (!tipo) return;

      const codigo = this.tipoSolicitudToCodigo[tipo] || '';
      this.form.get('codigo')?.setValue(codigo);
      this.descripcionTipoArbitraje = this.descripciones[tipo] || null;
    });
  }

  // =========================
  // NAVEGACIÓN
  // =========================
  continuar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // IMPORTANTE: getRawValue para incluir campos disabled
    this.tramiteService.setSolicitud(this.form.getRawValue());

    this.nextStep.emit();
  }

  volver() {
    this.prevStep.emit();
  }
}
