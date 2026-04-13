import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Directives
import { UppercaseDirective } from 'src/app/pages/shared/directives/uppercase.directive';

// Pipes
import { FileSizePipe } from 'src/app/pipes/size-file.pipe';
import { TruncatePipe } from 'src/app/pipes/truncate.pipe';

// Service
import { TramiteMPVFormService } from 'src/app/services/tramiteMPV-form.service';

@Component({
  selector: 'step-solicitud',
  imports: [ReactiveFormsModule, CommonModule, UppercaseDirective, FileSizePipe, TruncatePipe],
  templateUrl: './step-solicitud.component.html',
  styles: ``
})
export class StepSolicitudComponent implements OnInit {

  @Output() nextStep = new EventEmitter<void>();
  @Output() prevStep = new EventEmitter<void>();

  form!: FormGroup;
  archivos: File[] = [];

  descripcionTipoArbitraje: string | null = null;

  // SELECTOR
  tipoSolicitud = [
    { id: 'Arbitraje de Emergencia', nombre: 'ARBITRAJE DE EMERGENCIA' },
    { id: 'Arbitraje Ad Hoc', nombre: 'ARBITRAJE AD HOC' },
    { id: 'Arbitraje Institucional', nombre: 'ARBITRAJE INSTITUCIONAL' }
  ];

  // MAPEOS
  tipoSolicitudToCodigo: Record<string, string> = {
    'Arbitraje de Emergencia': 'AE-FIRMA-LEGAL',
    'Arbitraje Ad Hoc': 'AD HOC-FIRMA-LEGAL',
    'Arbitraje Institucional': 'CA-FIRMA-LEGAL'
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
    this.loadData();
  }

  // =========================
  // FORMULARIO
  // =========================
  initFormSolicitud() {
    this.form = this.fb.group({
      tipo_solicitud: [null, Validators.required],
      codigo: [{ value: '', disabled: true }],
      descripcion: ['', Validators.required]
    });
  }

  // =========================
  // ESCUCHAR CAMBIOS
  // =========================
  listenTipoSolicitud() {
    this.form.get('tipo_solicitud')?.valueChanges.subscribe(tipo => {
      if (!tipo) return;

      const codigo = this.tipoSolicitudToCodigo[tipo] || '';

      // Se guarda internamente (no visible)
      this.form.get('codigo')?.setValue(codigo);

      // Se muestra al usuario
      this.descripcionTipoArbitraje = this.descripciones[tipo] || null;
    });
  }

  // =========================
  // CARGAR DATOS
  // =========================
  loadData() {
    const data = this.tramiteService.getFormData();

    if (data?.solicitud) {
      this.form.patchValue(data.solicitud);
      this.archivos = data.archivos || [];

      if (data.solicitud.tipo_solicitud) {
        this.descripcionTipoArbitraje =
          this.descripciones[data.solicitud.tipo_solicitud];
      }
    }
  }

  // =========================
  // ARCHIVOS
  // =========================
  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach(file => {
      this.archivos.push(file);
    });

    input.value = '';
  }

  eliminarArchivo(index: number) {
    this.archivos.splice(index, 1);
  }

  verArchivo(file: File) {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // =========================
  // NAVEGACIÓN
  // =========================
  continuar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.log("enviando: ", this.form.getRawValue());
    this.tramiteService.setSolicitud(this.form.getRawValue());
    this.tramiteService.setArchivos(this.archivos);

    this.nextStep.emit();
  }

  volver() {
    this.prevStep.emit();
  }
}
