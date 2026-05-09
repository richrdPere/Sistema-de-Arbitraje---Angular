import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

// Directives
import { UppercaseDirective } from 'src/app/pages/shared/directives/uppercase.directive';

// Service
import { UsuarioService } from 'src/app/services/admin/usuarios.service';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'usuarios-form',
  imports: [ReactiveFormsModule, CommonModule, UppercaseDirective],
  templateUrl: './usuarios-form.component.html',
  styles: ``
})
export class UsuariosFormComponent implements OnInit, OnChanges {


  @Input() mostrarModal = false;
  @Input() modoEdicion = false;
  @Input() usuarioSeleccionado: any = null;

  @Output() modalCerrado = new EventEmitter<void>();
  @Output() usuarioCreado = new EventEmitter<void>();


  formUsuario!: FormGroup;
  loading = false;
  mensajeError = '';
  mensajeExito = '';

  backendErrors: any = {};

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
    private usuarioService: UsuarioService,

  ) { }


  ngOnInit(): void {
    this.initFormUsuarios();
    this.setModalWidth('lg');
  }

  ngOnChanges(changes: SimpleChanges): void {
    //  Si el formulario aún no está creado, salir
    if (!this.formUsuario) return;

    // EDITAR
    if (changes['usuarioSeleccionado'] && this.usuarioSeleccionado) {
      this.modoEdicion = true;
      const rol = this.usuarioSeleccionado.rol?.toUpperCase();

      const persona = this.usuarioSeleccionado.persona;

      // Campos comunes
      let formData: any = {
        id: this.usuarioSeleccionado.id,
        nombre: persona?.nombres || '',
        apellidos: persona?.apellidos || '',
        correo: this.usuarioSeleccionado.correo,
        rol: this.usuarioSeleccionado.rol,
        telefono: persona?.telefono || '',
        documento_identidad: persona?.dni || persona?.ruc || '',
        estado: this.usuarioSeleccionado.estado,
      };

      //  ARBITRO o ADJUDICADOR
      if (rol === 'ARBITRO') {
        formData = {
          ...formData,
          cargo: this.usuarioSeleccionado.persona?.arbitro?.cargo || '',
          numero_colegiatura: this.usuarioSeleccionado.persona?.arbitro?.numero_colegiatura || '',
          certificado_pdf: this.usuarioSeleccionado.persona?.arbitro?.certificado_pdf || '',
          especialidad: this.usuarioSeleccionado.persona?.arbitro?.especialidad || '',
          experiencia: this.usuarioSeleccionado.persona?.arbitro?.experiencia || '',
          disponible: this.usuarioSeleccionado.persona?.arbitro?.disponible ?? true
        };
      }

      // ADJUDICADOR
      if (rol === 'ADJUDICADOR') {
        formData = {
          ...formData,
          cargo: this.usuarioSeleccionado.adjudicador?.cargo || '',
          numero_colegiatura: this.usuarioSeleccionado.adjudicador.numero_colegiatura || '',
          certificado_pdf: this.usuarioSeleccionado.adjudicador.certificado_pdf || '',
          especialidad: this.usuarioSeleccionado.adjudicador.especialidad || '',
          experiencia: this.usuarioSeleccionado.adjudicador.experiencia || '',
        };
      }

      //  SECRETARIA
      if (rol === 'SECRETARIA') {
        formData = {
          ...formData,
          cargo: this.usuarioSeleccionado.secretaria?.cargo || '',
        };
      }

      // Aplicar al formulario
      this.formUsuario.patchValue(formData);

    }

    // CREAR / CERRAR MODAL
    if (changes['mostrarModal'] && !this.mostrarModal) {
      this.formUsuario.reset();
      this.modoEdicion = false;
    }
  };

  private mapToRequestPayload(formValue: any) {

    const payload: any = {
      nombres: formValue.nombres,
      apellidos: formValue.apellidos,
      correo: formValue.correo,
      rol: formValue.rol?.toLowerCase(),
      telefono: formValue.telefono,
      documento_identidad: formValue.documento_identidad,
      tipo: 'NATURAL',

      // Campos opcionales
      cargo: formValue.cargo,
      especialidad: formValue.especialidad,
      experiencia: formValue.experiencia,
      numero_colegiatura: formValue.numero_colegiatura,

      // Solo enviar password si existe
      password: formValue.password
    };

    // Eliminar campos vacíos
    Object.keys(payload).forEach(key => {
      if (
        payload[key] === null ||
        payload[key] === undefined ||
        payload[key] === ''
      ) {
        delete payload[key];
      }
    });

    return payload;
  }

  initFormUsuarios() {
    this.formUsuario = this.fb.group({
      id: [null],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: [''],
      rol: ['', Validators.required],
      telefono: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]+$'),
          Validators.minLength(9),
          Validators.maxLength(9),
        ],
      ],
      documento_identidad: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]+$'),
          Validators.minLength(8),
          Validators.maxLength(8),
        ],
      ],

      // Campos opcionales (dependen del rol)
      cargo: [''],
      especialidad: [''],
      experiencia: [''],

      // Para arbitro y adjudicador
      numero_colegiatura: [''],
      // certificado_pdf: [''],
      // disponible: [true],
      // estado: ['Activo'],
    });
  }

  cerrarModal() {
    this.formUsuario.reset();
    this.modoEdicion = false;
    this.usuarioSeleccionado = null;
    this.modalCerrado.emit();

  }

  // Crear o Editar usuario
  crearOEditarUsuario() {

    this.backendErrors = {};

    if (this.formUsuario.invalid) {

      this.formUsuario.markAllAsTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos requeridos.',
      });

      return;
    }

    const formData = { ...this.formUsuario.value };

    const payload = this.mapToRequestPayload(formData);

    // ==========================================
    // EDITAR
    // ==========================================
    if (this.modoEdicion && formData.id) {

      Swal.fire({
        title: 'Actualizando usuario...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      this.usuarioService.updateUsuario(formData.id, payload)
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'Usuario actualizado correctamente'
            });

            this.usuarioCreado.emit();
            this.cerrarModal();
          },

          error: (err) => {

            this.backendErrors = err?.error?.errores || {};

            Swal.fire({
              icon: 'error',
              title: 'Error al actualizar usuario',
              text: err?.error?.message || 'Error desconocido.'
            });
          }
        });

      return;
    }

    // ==========================================
    // CREAR
    // ==========================================
    Swal.fire({
      title: 'Creando usuario...',
      text: 'Enviando información, por favor espera',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading()
    });

    this.usuarioService.newUsuario(payload)
      .subscribe({

        next: () => {

          Swal.fire({
            icon: 'success',
            title: 'Usuario creado correctamente',
            text: 'Se envió un correo con las credenciales.'
          });

          this.usuarioCreado.emit();
          this.cerrarModal();
        },

        error: (err) => {

          this.backendErrors = err?.error?.errores || {};

          Swal.fire({
            icon: 'error',
            title: 'Error al crear usuario',
            text: err?.error?.message || 'Error desconocido'
          });
        }
      });
  }

  soloNumeros(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  get f() {
    return this.formUsuario.controls;
  }

  hasError(field: string, error: string): boolean {
    return !!this.formUsuario.get(field)?.hasError(error)
      && !!this.formUsuario.get(field)?.touched;
  }

  isInvalid(field: string): boolean {
    return !!this.formUsuario.get(field)?.invalid
      && !!this.formUsuario.get(field)?.touched;
  }
}
