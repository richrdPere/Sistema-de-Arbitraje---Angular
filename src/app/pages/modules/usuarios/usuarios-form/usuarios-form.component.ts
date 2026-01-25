import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

// Service
import { UsuarioService } from 'src/app/services/admin/usuarios.service';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'usuarios-form',
  imports: [ReactiveFormsModule, CommonModule],
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
    private authService: AuthService

  ) { }


  ngOnInit(): void {
    this.initFormUsuarios();
    this.setModalWidth('lg');
  }

  ngOnChanges(changes: SimpleChanges): void {
    //  Si el formulario aún no está creado, salir
    if (!this.formUsuario) return;

    console.log("USUARIOS EDIT: ", this.usuarioSeleccionado);

    // EDITAR
    if (changes['usuarioSeleccionado'] && this.usuarioSeleccionado) {
      this.modoEdicion = true;
      const rol = this.usuarioSeleccionado.rol?.toUpperCase();

      // Campos comunes
      let formData: any = {
        id: this.usuarioSeleccionado.id,
        nombre: this.usuarioSeleccionado.nombre,
        apellidos: this.usuarioSeleccionado.apellidos,
        correo: this.usuarioSeleccionado.correo,
        rol: this.usuarioSeleccionado.rol,
        telefono: this.usuarioSeleccionado.telefono,
        documento_identidad: this.usuarioSeleccionado.documento_identidad,
        estado: this.usuarioSeleccionado.estado,
        disponible: this.usuarioSeleccionado.disponible,
      };

      //  ARBITRO o ADJUDICADOR
      if (rol === 'ARBITRO') {
        formData = {
          ...formData,
          cargo: this.usuarioSeleccionado.arbitro?.cargo || '',
          numero_colegiatura: this.usuarioSeleccionado.arbitro.numero_colegiatura || '',
          certificado_pdf: this.usuarioSeleccionado.arbitro.certificado_pdf || '',
          especialidad: this.usuarioSeleccionado.arbitro.especialidad || '',
          experiencia: this.usuarioSeleccionado.arbitro.experiencia || '',
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



  initFormUsuarios() {
    this.formUsuario = this.fb.group({
      id: [null],
      nombre: ['', Validators.required],
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
      tipo_persona: [''],
      razon_social: [''],
      direccion: [''],
      cargo: [''],
      especialidad: [''],
      experiencia: [''],

      // Para arbitro y adjudicador
      numero_colegiatura: [''],
      certificado_pdf: [''],
      disponible: [true],
      estado: ['Activo'],
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
    // Limpiar errores previos del backend
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

    // Clonamos el value para poder manipularlo
    const usuario: any = { ...this.formUsuario.value };

    console.log('Formulario de usuario enviado:', usuario);

    // ============================
    // MODO EDICIÓN
    // ============================
    if (this.modoEdicion && usuario.id) {


      // console.log("Actualizando usuario: ", usuario.pasword);
      //  SI NO SE INGRESÓ PASSWORD → NO ENVIARLO
      if (!usuario.password || usuario.password.trim() === '') {
        delete usuario.password;
      }

      this.usuarioService.actualizarUsuario(usuario.id, usuario).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Usuario actualizado correctamente' });
          this.usuarioCreado.emit(); // refrescar tabla
          this.cerrarModal();
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar usuario',
            text: err.error?.message || 'Error desconocido.',
          });
        },
      });

      return;
    }

    // ============================
    // MODO CREACIÓN
    // ============================
    this.usuarioService.crearUsuario(usuario).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Usuario creado correctamente',
          text: 'Se envió un correo con las credenciales y enlace de confirmación.'
        });

        this.usuarioCreado.emit(); // refrescar tabla
        this.cerrarModal();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al crear usuario',
          text: err.error?.message || 'Error desconocido',
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
}
