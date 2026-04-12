import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Directives
import { UppercaseDirective } from 'src/app/pages/shared/directives/uppercase.directive';

// Service
import { TramiteMPVFormService } from 'src/app/services/tramiteMPV-form.service';

@Component({
  selector: 'step-demandado',
  imports: [ReactiveFormsModule, CommonModule, UppercaseDirective],
  templateUrl: './step-demandado.component.html',
  styles: ``
})
export class StepDemandadoComponent implements OnInit {

  @Output() nextStep = new EventEmitter<void>();
  @Output() prevStep = new EventEmitter<void>();

  form!: FormGroup;
  tipoUsuarioDemandado: string | null = null;

  // Selector
  tipoUsuarios = [
    { id: 'NATURAL', nombre: 'PERSONA NATURAL' },
    { id: 'JURIDICA', nombre: 'JURIDICA' },
    { id: 'ENTIDAD_PUBLICA', nombre: 'ENTIDAD PÚBLICA' }
  ];

  constructor(
    private fb: FormBuilder,
    private tramiteService: TramiteMPVFormService
  ) { }

  ngOnInit(): void {
    this.initFormDemandado();
    this.listenTipoDemandado();
  }

  // =========================
  // FORMULARIO
  // =========================
  initFormDemandado() {
    this.form = this.fb.group({
      tipo: [null, Validators.required],

      nombres: [''],
      apellidos: [''],
      dni: [''],

      ruc: [''],
      razon_social: [''],
      nombre_entidad: [''],

      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      direccion: [''],
      cargo: ['']
    });
  }

  listenTipoDemandado() {
    this.form.get('tipo')?.valueChanges.subscribe(() => {
      this.onTipoUsuarioDemandadoChange();
    });
  }



  // =========================
  // CAMBIO DE TIPO
  // =========================
  onTipoUsuarioDemandadoChange() {
    const tipo = this.form.get('tipo')?.value;
    this.tipoUsuarioDemandado = tipo;

    const controls = [
      'nombres',
      'apellidos',
      'dni',
      'ruc',
      'razon_social',
      'nombre_entidad'
    ];

    // Reset + limpiar validaciones
    controls.forEach(field => {
      this.form.get(field)?.reset();
      this.form.get(field)?.clearValidators();
    });

    // =========================
    // REGLAS
    // =========================
    if (tipo === 'NATURAL') {
      this.setValidators(['nombres', 'apellidos'], [Validators.required]);

      this.form.get('dni')?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{8}$/)
      ]);
    }

    if (tipo === 'JURIDICA') {
      this.setValidators(['nombres', 'apellidos'], [Validators.required]);

      this.form.get('dni')?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{8}$/)
      ]);

      this.form.get('ruc')?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{11}$/)
      ]);

      this.form.get('razon_social')?.setValidators([Validators.required]);
    }

    if (tipo === 'ENTIDAD_PUBLICA') {
      this.form.get('ruc')?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{11}$/)
      ]);

      this.form.get('nombre_entidad')?.setValidators([Validators.required]);
    }

    controls.forEach(field => {
      this.form.get(field)?.updateValueAndValidity();
    });
  }

  setValidators(fields: string[], validators: any[]) {
    fields.forEach(field => {
      this.form.get(field)?.setValidators(validators);
    });
  }

  // =========================
  // HELPERS
  // =========================
  esNatural() {
    return this.tipoUsuarioDemandado === 'NATURAL';
  }

  esJuridica() {
    return this.tipoUsuarioDemandado === 'JURIDICA';
  }

  esEntidad() {
    return this.tipoUsuarioDemandado === 'ENTIDAD_PUBLICA';
  }

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

    this.tramiteService.setDemandado(this.form.value);
    this.nextStep.emit();
  }

  volver() {
    this.prevStep.emit();
  }

}


