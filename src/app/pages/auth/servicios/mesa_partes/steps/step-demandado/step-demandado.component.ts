import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Directives
import { UppercaseDirective } from 'src/app/pages/shared/directives/uppercase.directive';

// Service
import { TramiteMPVFormService } from 'src/app/services/tramiteMPV-form.service';
import { PersonaService } from 'src/app/services/persona.service';

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
    private tramiteService: TramiteMPVFormService,
    private personaService: PersonaService
  ) { }

  ngOnInit(): void {
    this.initFormDemandado();
    this.loadDataDemandado();
    this.listenTipoDemandado();
    this.listenBusquedaPersona();
    this.listenDuplicidad();
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

  loadDataDemandado() {
    const data = this.tramiteService.getFormData();

    if (data?.demandado && Object.keys(data.demandado).length > 0) {

      this.form.patchValue(data.demandado);

      // IMPORTANTE: restaurar tipo seleccionado
      this.tipoUsuarioDemandado = data.demandado.tipo;

      // Volver a aplicar validaciones dinámicas
      this.onTipoUsuarioDemandadoChange(false);
    }
  }

  listenTipoDemandado() {
    this.form.get('tipo')?.valueChanges.subscribe(() => {
      this.onTipoUsuarioDemandadoChange(true);
    });
  }

  listenDuplicidad() {
    this.form.get('dni')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.validarDuplicidadConDemandante());

    this.form.get('ruc')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.validarDuplicidadConDemandante());
  }

  listenBusquedaPersona() {
    // DNI (persona natural)
    this.form.get('dni')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(dni => {

        if (!dni || dni.length !== 8) return;


        this.personaService.searchPersona({ dni })
          .subscribe(resp => {

            if (!resp) return;

            this.form.patchValue({
              nombres: resp.nombres,
              apellidos: resp.apellidos,
              email: resp.email,
              telefono: resp.telefono,
              direccion: resp.direccion,
              cargo: resp.cargo
            });

          });

      });

    // RUC (jurídica / entidad)
    this.form.get('ruc')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(ruc => {

        if (!ruc || ruc.length !== 11) return;

        this.personaService.searchPersona({ ruc })
          .subscribe(resp => {

            if (!resp) return;

            // Forzar tipo correcto
            this.form.patchValue({ tipo: resp.tipo });
            this.tipoUsuarioDemandado = resp.tipo;

            this.onTipoUsuarioDemandadoChange(false);

            this.form.patchValue({
              razon_social: resp.razon_social,
              nombre_entidad: resp.nombre_entidad,
              email: resp.email,
              telefono: resp.telefono,
              direccion: resp.direccion,
              ruc: resp.ruc
            });
          });
      });
  }


  // =========================
  // CAMBIO DE TIPO
  // =========================
  onTipoUsuarioDemandadoChange(resetValues: boolean = true) {
    const tipo = this.form.get('tipo')?.value;
    this.tipoUsuarioDemandado = tipo;

    // SOLO resetear si es cambio manual
    if (resetValues) {
      this.form.patchValue({
        nombres: '',
        apellidos: '',
        dni: '',
        ruc: '',
        razon_social: '',
        nombre_entidad: ''
      });
    }

    // LIMPIAR VALIDADORES
    this.clearValidators([
      'dni',
      'nombres',
      'apellidos',
      'ruc',
      'razon_social',
      'nombre_entidad'
    ]);

    // =========================
    // REGLAS
    // =========================
    if (tipo === 'NATURAL') {
      this.form.get('dni')?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{8}$/)
      ]);

      this.form.get('nombres')?.setValidators([Validators.required]);
      this.form.get('apellidos')?.setValidators([Validators.required]);
    }

    if (tipo === 'JURIDICA') {
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

    this.form.updateValueAndValidity();
  }

  clearValidators(fields: string[]) {
    fields.forEach(field => {
      this.form.get(field)?.clearValidators();
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

  soloNumeros(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  validarDuplicidadConDemandante() {
    const demandante = this.tramiteService.getFormData()?.demandante;

    if (!demandante) return;

    const dniControl = this.form.get('dni');
    const rucControl = this.form.get('ruc');

    const dniDemandado = dniControl?.value;
    const rucDemandado = rucControl?.value;

    // LIMPIAR SOLO ERROR "mismo"
    const limpiarError = (control: any) => {
      if (!control?.errors) return;

      const errors = { ...control.errors };
      delete errors['mismo'];

      control.setErrors(Object.keys(errors).length ? errors : null);
    };

    limpiarError(dniControl);
    limpiarError(rucControl);

    // VALIDAR DNI
    if (
      demandante.dni &&
      dniDemandado &&
      demandante.dni === dniDemandado
    ) {
      dniControl?.setErrors({ ...(dniControl.errors || {}), mismo: true });
    }

    // VALIDAR RUC
    if (
      demandante.ruc &&
      rucDemandado &&
      demandante.ruc === rucDemandado
    ) {
      rucControl?.setErrors({ ...(rucControl.errors || {}), mismo: true });
    }
  }

  // =========================
  // NAVEGACIÓN
  // =========================
  continuar() {
    // Ejecutar validación final
    this.validarDuplicidadConDemandante();

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


