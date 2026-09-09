import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

// Directives
import { UppercaseDirective } from 'src/app/pages/shared/directives/uppercase.directive';

// Interfaces
import { Arbitro } from 'src/app/interfaces/usuario.interface';

// Services
import { ArbitrosService } from 'src/app/services/admin/arbitros.service';


// Services

@Component({
  selector: 'arbitros-form',
  imports: [ReactiveFormsModule, CommonModule, UppercaseDirective],
  templateUrl: './arbitros-form.component.html',
  styles: ``
})
export class ArbitrosFormComponent implements OnInit, OnChanges {

  @Input() mostrarModal = false;
  @Input() modoEdicion = false;
  @Input() arbitroSeleccionado: Arbitro | null = null;

  @Output() modalCerrado = new EventEmitter<void>();
  @Output() arbitroCreado = new EventEmitter<void>();

  formArbitro!: FormGroup;
  isLoading = false;


  modalWidthClass = 'max-w-4xl'; // default

  setModalWidth(size: 'sm' | 'md' | 'lg' | 'xl' | 'full') {
    const map = {
      sm: 'max-w-md',
      md: 'max-w-xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-full w-[95vw]'
    };

    this.modalWidthClass = map[size];
  }


  constructor(
    private fb: FormBuilder,
    private arbitrosService: ArbitrosService,

  ) { }

  ngOnInit(): void {
    this.initFormArbitros();
    this.setModalWidth('lg');
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (!this.formArbitro) return;

    // =========================================
    // MODO EDICIÓN
    // =========================================
    if (
      changes['arbitroSeleccionado'] &&
      this.arbitroSeleccionado &&
      this.modoEdicion
    ) {

      this.formArbitro.patchValue({

        id: this.arbitroSeleccionado.id_arbitro,

        // PERSONA
        nombres: this.arbitroSeleccionado.persona?.nombres || '',
        apellidos: this.arbitroSeleccionado.persona?.apellidos || '',
        dni: this.arbitroSeleccionado.persona?.dni || '',
        telefono: this.arbitroSeleccionado.persona?.telefono || '',
        direccion: this.arbitroSeleccionado.persona?.direccion || '',

        // USUARIO
        correo: this.arbitroSeleccionado.usuario?.correo || '',
        password: '',

        // ARBITRO
        cargo: this.arbitroSeleccionado.cargo || '',
        especialidad: this.arbitroSeleccionado.especialidad || '',
        experiencia: this.arbitroSeleccionado.experiencia || '',
        numero_colegiatura: this.arbitroSeleccionado.numero_colegiatura || '',
      });

      // Password opcional
      this.formArbitro.get('password')?.clearValidators();
      this.formArbitro.get('password')?.updateValueAndValidity();
    }

    // =========================================
    // MODO CREAR
    // =========================================
    if (
      changes['modoEdicion'] &&
      !this.modoEdicion
    ) {

      this.formArbitro.reset({
        cargo: 'Árbitro Institucional'
      });

      this.formArbitro.get('password')?.setValidators([
        Validators.required,
        Validators.minLength(6)
      ]);

      this.formArbitro.get('password')?.updateValueAndValidity();
    }
  }


  // ====================================
  // Formulario
  // ====================================
  initFormArbitros() {
    this.formArbitro = this.fb.group({
      id: [null],
      // PERSONA
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      telefono: [''],
      direccion: [''],

      // USUARIO
      correo: ['', [Validators.required, Validators.email]],
      password: ['', this.modoEdicion ? [] : [Validators.required, Validators.minLength(6)]],

      // ARBITRO
      cargo: ['Árbitro Institucional', Validators.required],
      especialidad: [''],
      experiencia: [''],
      numero_colegiatura: [''],

      // disponible: [true]

    });
  }

  // ====================================
  // Guardar árbitro
  // ====================================
  guardarArbitro() {

    if (this.formArbitro.invalid) {
      this.formArbitro.markAllAsTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        text: 'Completa todos los campos requeridos'
      });

      return;
    }

    this.isLoading = true;

    const formValue = this.formArbitro.value;

    // Payload
    const payload = {
      nombres: formValue.nombres,
      apellidos: formValue.apellidos,
      dni: formValue.dni,
      telefono: formValue.telefono,
      direccion: formValue.direccion,
      correo: formValue.correo,
      password: formValue.password,

      cargo: formValue.cargo,
      especialidad: formValue.especialidad,
      experiencia: formValue.experiencia,
      numero_colegiatura: formValue.numero_colegiatura,
      // arbitro: {

      //   disponible: formValue.disponible
      // }

    };

    // ====================================
    // EDITAR
    // ====================================
    if (this.modoEdicion && this.arbitroSeleccionado) {

      this.arbitrosService
        .updateArbitro(this.arbitroSeleccionado.id_arbitro, payload)
        .subscribe({

          next: (resp) => {

            this.isLoading = false;

            Swal.fire({
              icon: 'success',
              title: 'Actualizado',
              text: 'Árbitro actualizado correctamente'
            });

            this.arbitroCreado.emit();
            this.cerrarModal();
          },

          error: (error) => {

            this.isLoading = false;

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error?.error?.message || 'No se pudo actualizar'
            });
          }

        });

      return;
    }

    // ====================================
    // CREAR
    // ====================================
    this.arbitrosService
      .newArbitro(payload)
      .subscribe({

        next: (resp) => {

          this.isLoading = false;

          Swal.fire({
            icon: 'success',
            title: 'Registrado',
            text: 'Árbitro creado correctamente'
          });

          this.arbitroCreado.emit();
          this.cerrarModal();
        },

        error: (error) => {

          this.isLoading = false;

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error?.error?.message || 'No se pudo registrar'
          });
        }

      });
  }



  // ====================================
  // Helpers methods
  // ====================================
  soloNumeros(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  cerrarModal() {
    this.formArbitro.reset({
      cargo: 'Árbitro Institucional'
    });

    this.modalCerrado.emit();
  }

  esRequerido(campo: string): boolean {
    const control = this.formArbitro.get(campo);
    return control?.hasValidator(Validators.required) ?? false;
  }
}
