import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Directives
import { UppercaseDirective } from 'src/app/pages/shared/directives/uppercase.directive';

// Service
import { ExpedienteFormService } from 'src/app/services/admin/expedientes-form.service';
import { PersonaService } from 'src/app/services/persona.service';

@Component({
  selector: 'step-persona',
  imports: [ReactiveFormsModule, CommonModule, UppercaseDirective],
  templateUrl: './step-persona.component.html',
  styles: ``
})
export class StepPersonaComponent implements OnInit {

  @Output() nextStep = new EventEmitter<void>();

  form!: FormGroup;
  tipoUsuarioSeleccionado: string | null = null;

  // Selector
  tipoUsuarios = [
    { id: 'NATURAL', nombre: 'PERSONA NATURAL' },
    { id: 'JURIDICA', nombre: 'JURIDICA' },
    { id: 'ENTIDAD_PUBLICA', nombre: 'ENTIDAD PÚBLICA' }
  ];


  constructor(
    private fb: FormBuilder,
    private expedienteFormService: ExpedienteFormService,
    private personaService: PersonaService
  ) { }

  ngOnInit(): void {
    this.initFormPersona();
    this.loadDataPersona();
    this.listenTipoPersona();
    this.listenBusquedaPersona();
  }

  // =========================
  // FORMULARIO
  // =========================
  initFormPersona() {
    this.form = this.fb.group({
      tipo: [null, Validators.required],

      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
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

  loadDataPersona() {
    const data = this.expedienteFormService.getExpediente();

    if (data && Object.keys(data).length > 0) {

      this.form.patchValue(data);

      // Restaurar tipo
      this.tipoUsuarioSeleccionado = data.tipo || null;

      // Reaplicar validaciones sin resetear
      this.onTipoUsuarioChange(false);
    }
  }

  listenTipoPersona() {
    this.form.get('tipo')?.valueChanges.subscribe(() => {
      this.onTipoUsuarioChange(true);
    });
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

            // Forzar al tipo correcto
            this.form.patchValue({
              tipo: resp.tipo
            });

            this.tipoUsuarioSeleccionado = resp.tipo;

            this.onTipoUsuarioChange(false); // reaplica validaciones sin resetear

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

  // - CAMBIO DE TIPO
  onTipoUsuarioChange(resetValues: boolean = true) {

    const tipo = this.form.get('tipo')?.value;
    this.tipoUsuarioSeleccionado = tipo;

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

    // Validaciones dinámicas
    if (tipo === 'NATURAL') {
      this.form.get('dni')?.setValidators([Validators.required, Validators.pattern(/^\d{8}$/)]);
      this.form.get('nombres')?.setValidators([Validators.required]);
      this.form.get('apellidos')?.setValidators([Validators.required]);

      this.clearValidators(['ruc', 'razon_social', 'nombre_entidad']);
    }

    if (tipo === 'JURIDICA') {
      this.form.get('ruc')?.setValidators([Validators.required, Validators.pattern(/^\d{11}$/)]);
      this.form.get('razon_social')?.setValidators([Validators.required]);

      this.clearValidators(['dni', 'nombres', 'apellidos', 'nombre_entidad']);
    }

    if (tipo === 'ENTIDAD_PUBLICA') {
      this.form.get('ruc')?.setValidators([Validators.required]);
      this.form.get('nombre_entidad')?.setValidators([Validators.required]);

      this.clearValidators(['dni', 'nombres', 'apellidos', 'razon_social']);
    }

    this.form.updateValueAndValidity();
  }

  // - Limpiar validaciones
  clearValidators(fields: string[]) {
    fields.forEach(field => {
      this.form.get(field)?.clearValidators();
      this.form.get(field)?.updateValueAndValidity();
    });
  }

  // - Es natural
  esNatural() {
    return this.tipoUsuarioSeleccionado === 'NATURAL';
  }

  // - Es natural
  esJuridica() {
    return this.tipoUsuarioSeleccionado === 'JURIDICA';
  }

  // - Es juridica
  esEntidad() {
    return this.tipoUsuarioSeleccionado === 'ENTIDAD_PUBLICA';
  }

  // - Es requerido
  esRequerido(campo: string): boolean {
    const control = this.form.get(campo);
    return control?.hasValidator(Validators.required) ?? false;
  }

  // - Solo numeros
  soloNumeros(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  // =========================
  // SIGUIENTE STEP
  // =========================
  continuar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.expedienteFormService.setPersona(this.form.value);

    this.nextStep.emit();
  }


}



