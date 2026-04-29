import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Directives
import { UppercaseDirective } from 'src/app/pages/shared/directives/uppercase.directive';

// Service
import { ExpedienteFormService } from 'src/app/services/admin/expedientes-form.service';


@Component({
  selector: 'step-expediente',
  imports: [ReactiveFormsModule, CommonModule, UppercaseDirective],
  templateUrl: './step-expediente.component.html',
  styles: ``
})
export class StepExpedienteComponent implements OnInit {

  @Output() nextStep = new EventEmitter<void>();
  @Output() prevStep = new EventEmitter<void>();

  form!: FormGroup;
  // tipoExpedienteSeleccionado: string | null = null;

  // Selector
  tipoArbitraje = [
    { value: 'Arbitraje Institucional', label: 'Arbitraje Institucional' },
    { value: 'Arbitraje de Emergencia', label: 'Arbitraje de Emergencia' },
    { value: 'Arbitraje Ad Hoc', label: 'Arbitraje Ad Hoc' }
  ];

  // MAPEO A CÓDIGO
  tipoSolicitudToCodigo: any = {
    'Arbitraje de Emergencia': 'AE-FIRMA-LEGAL',
    'Arbitraje Ad Hoc': 'AD HOC-FIRMA-LEGAL',
    'Arbitraje Institucional': 'CA-FIRMA-LEGAL',
  };

  constructor(
    private fb: FormBuilder,
    private expedienteFormService: ExpedienteFormService,
  ) { }

  ngOnInit(): void {
    this.initFormExpediente();
    this.loadDataExpediente();
    this.listenTipo();
  }

  // =========================
  // FORMULARIO
  // =========================
  initFormExpediente() {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
      tipo: [null, Validators.required],
      codigo: [{ value: '', disabled: true }, Validators.required],
      fecha_inicio: [this.getFechaHoy(), Validators.required],
      fecha_laudo: [null],
      fecha_resolucion: [null],
    });
  }

  // - CARGAR DATOS (EDICIÓN)
  loadDataExpediente() {
    const data = this.expedienteFormService.getExpediente();

    if (data && Object.keys(data).length > 0) {
      this.form.patchValue(data);

      // Si ya hay tipo, recalcular código
      if (data.tipo) {
        const codigo = this.tipoSolicitudToCodigo[data.tipo] || '';
        this.form.get('codigo')?.setValue(codigo);
      }
    }
  }

  // - AUTOCÓDIGO
  listenTipo() {
    this.form.get('tipo')?.valueChanges.subscribe(tipo => {
      const codigo = this.tipoSolicitudToCodigo[tipo] || '';
      this.form.get('codigo')?.setValue(codigo);
    });
  }

  // =========================
  // HELPERS
  // =========================

  // - Fecha hoy
  getFechaHoy(): string {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  }


  // - Es requerido
  esRequerido(campo: string): boolean {
    const control = this.form.get(campo);
    return control?.hasValidator(Validators.required) ?? false;
  }

  // =========================
  // NAVEGACIÓN
  // =========================
  continuar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // IMPORTANTE: incluir campos disabled
    const data = this.form.getRawValue();
    this.expedienteFormService.setExpediente(data);
    this.nextStep.emit();
  }

  volver() {
    this.prevStep.emit();
  }
}
