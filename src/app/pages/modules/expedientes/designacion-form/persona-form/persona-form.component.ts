
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Directiva
import { UppercaseDirective } from 'src/app/pages/shared/directives/uppercase.directive';

// SERVICES
import { PersonaService } from 'src/app/services/persona.service';

@Component({
  selector: 'persona-form',
  imports: [ReactiveFormsModule, CommonModule, UppercaseDirective],
  templateUrl: './persona-form.component.html',
  styles: ``
})
export class PersonaFormComponent implements OnInit {
  @Input() mostrarModal = false;
  @Input() persona: any = null;
  @Input() mostrarBotones = true;

  @Output() guardar = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<void>();

  form!: FormGroup;
  tipoUsuarioSeleccionado: string | null = null;
  loadingBusqueda = false;

  // Selectores
  tipoUsuarios = [
    { id: 'NATURAL', nombre: 'PERSONA NATURAL' },
    { id: 'JURIDICA', nombre: 'PERSONA JURÍDICA' },
    { id: 'ENTIDAD_PUBLICA', nombre: 'ENTIDAD PÚBLICA' }
  ];

  constructor(
    private fb: FormBuilder,
    private personaService: PersonaService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.listenTipoPersona();
    this.listenBusquedaPersona();
    if (this.persona) {
      this.loadPersona();
    }
  }

  // =========================
  // INIT FORM
  // =========================

  initForm() {
    this.form = this.fb.group({
      tipo: [null, Validators.required],

      // NATURAL
      nombres: [''],
      apellidos: [''],
      dni: [''],
      // JURIDICA / ENTIDAD
      ruc: [''],
      razon_social: [''],
      nombre_entidad: [''],
      // CONTACTO
      email: ['', Validators.email],
      telefono: [''],
      direccion: [''],
      cargo: ['']
    });
  }

  // =========================
  // LOAD PERSONA
  // =========================

  loadPersona() {
    this.form.patchValue(this.persona);
    this.tipoUsuarioSeleccionado = this.persona.tipo;
    this.onTipoPersonaChange(false);

  }

  // =========================
  // LISTENERS
  // =========================
  listenTipoPersona() {
    this.form.get('tipo')?.valueChanges.subscribe(() => {
      this.onTipoPersonaChange(true);
    });
  }

  listenBusquedaPersona() {
    // DNI
    this.form.get('dni')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(dni => {

        if (!dni || dni.length !== 8) return;
        this.loadingBusqueda = true;
        this.personaService.searchPersona({ dni })
          .subscribe({
            next: (resp: any) => {
              if (!resp) {
                this.loadingBusqueda = false;
                return;
              }

              this.form.patchValue({

                tipo: resp.tipo,
                dni: resp.dni,
                nombres: resp.nombres,
                apellidos: resp.apellidos,
                email: resp.email,
                telefono: resp.telefono,
                direccion: resp.direccion,
                cargo: resp.cargo
              });

              this.tipoUsuarioSeleccionado = resp.tipo;
              this.onTipoPersonaChange(false);
              this.loadingBusqueda = false;

            },

            error: () => {
              this.loadingBusqueda = false;
            }

          });

      });

    // RUC
    this.form.get('ruc')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(ruc => {

        if (!ruc || ruc.length !== 11) return;
        this.loadingBusqueda = true;
        this.personaService.searchPersona({ ruc })
          .subscribe({

            next: (resp: any) => {

              if (!resp) {
                this.loadingBusqueda = false;
                return;
              }

              // Forzar tipo
              this.form.patchValue({
                tipo: resp.tipo
              });

              this.tipoUsuarioSeleccionado = resp.tipo;

              this.onTipoPersonaChange(false);

              this.form.patchValue({

                razon_social: resp.razon_social,
                nombre_entidad: resp.nombre_entidad,

                ruc: resp.ruc,

                email: resp.email,
                telefono: resp.telefono,
                direccion: resp.direccion,
                cargo: resp.cargo

              });

              this.loadingBusqueda = false;

            },

            error: () => {
              this.loadingBusqueda = false;
            }
          });
      });
  }

  // =========================
  // CAMBIO TIPO
  // =========================
  onTipoPersonaChange(resetValues: boolean = true) {
    const tipo = this.form.get('tipo')?.value;
    this.tipoUsuarioSeleccionado = tipo;


    // RESET
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

    // LIMPIAR VALIDACIONES
    this.clearValidators([
      'dni',
      'nombres',
      'apellidos',
      'ruc',
      'razon_social',
      'nombre_entidad'
    ]);


    // NATURAL
    if (tipo === 'NATURAL') {

      this.form.get('dni')?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{8}$/)
      ]);

      this.form.get('nombres')?.setValidators([
        Validators.required
      ]);

      this.form.get('apellidos')?.setValidators([
        Validators.required
      ]);
    }

    // JURIDICA
    if (tipo === 'JURIDICA') {

      this.form.get('ruc')?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{11}$/)
      ]);

      this.form.get('razon_social')?.setValidators([
        Validators.required
      ]);

    }

    // ENTIDAD
    if (tipo === 'ENTIDAD_PUBLICA') {

      this.form.get('ruc')?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{11}$/)
      ]);

      this.form.get('nombre_entidad')?.setValidators([
        Validators.required
      ]);

    }

    this.form.updateValueAndValidity();

  }

  // CLEAR VALIDATORS
  clearValidators(fields: string[]) {
    fields.forEach(field => {
      this.form.get(field)?.clearValidators();
      this.form.get(field)?.updateValueAndValidity();

    });

  }

  // =========================
  // HELPERS
  // =========================

  esNatural() {
    return this.tipoUsuarioSeleccionado === 'NATURAL';
  }

  esJuridica() {
    return this.tipoUsuarioSeleccionado === 'JURIDICA';
  }

  esEntidad() {
    return this.tipoUsuarioSeleccionado === 'ENTIDAD_PUBLICA';
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

  // =========================
  // GUARDAR
  // =========================

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;

    }
    this.guardar.emit(this.form.getRawValue());
    this.resetForm();
  }

  // =========================
  // CANCELAR
  // =========================
  close() {
    this.resetForm();
    this.mostrarModal = false;
    this.cancelar.emit();
  }

  resetForm() {

    this.form.reset();
    this.tipoUsuarioSeleccionado = null;
    this.persona = null;
    this.loadingBusqueda = false;

    // Limpiar validadores
    this.clearValidators([
      'dni',
      'nombres',
      'apellidos',
      'ruc',
      'razon_social',
      'nombre_entidad'
    ]);

    this.form.updateValueAndValidity();
  }
}
