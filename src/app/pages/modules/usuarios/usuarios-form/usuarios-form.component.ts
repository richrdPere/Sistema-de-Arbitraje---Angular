import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Service
import { UsuarioService } from 'src/app/services/admin/usuarios.service';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'usuarios-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './usuarios-form.component.html',
  styles: ``
})
export class UsuariosFormComponent implements OnInit {


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
    private usuariosService: UsuarioService,
    private authService: AuthService

  ) { }


  ngOnInit(): void {
    this.initFormUsuarios();
    this.setModalWidth('lg');
  }


  initFormUsuarios() {
    this.formUsuario = this.fb.group({
      id: [null],
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      // password: ['', Validators.required],
      rol: ['', Validators.required],
      telefono: [''],
      documento_identidad: [''],

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

  crearOEditarUsuario() {
    throw new Error('Method not implemented.');
  }
  cerrarModal() {
    this.mostrarModal = false;
    this.modalCerrado.emit();
    this.formUsuario.reset();

  }

}
