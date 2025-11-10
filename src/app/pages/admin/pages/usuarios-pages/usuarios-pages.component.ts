import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule, FormGroup } from '@angular/forms';
import { FormUtils } from 'src/app/utils/form-utils';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

// Service
import { UsuarioService } from 'src/app/services/admin/usuarios.service';

@Component({
  selector: 'app-usuarios-pages',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './usuarios-pages.component.html',
})
export class UsuariosPagesComponent implements OnInit {

  // Usuarios combinados
  usuarios: any[] = [];


  // Usuarios
  // arbitros: any[] = [];
  // secretarias: any[] = [];
  // participes: any[] = [];

  // Variables
  formUsuario!: FormGroup;
  fb = inject(FormBuilder);
  formUtils = FormUtils;

  loading = true;
  filtro: string = '';
  mostrarModal = false;

  constructor(private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.formUsuario = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
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
    });

    // Opcional: limpiar campos cuando cambia el rol
    this.formUsuario.get('rol')?.valueChanges.subscribe(() => this.resetCamposRol());
    this.cargarDatos();
  }

  private resetCamposRol() {
    this.formUsuario.patchValue({
      tipo_persona: '',
      documento_identidad: '',
      razon_social: '',
      telefono: '',
      direccion: '',
      cargo: '',
      especialidad: '',
      experiencia: '',
    });
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.formUsuario.reset();
  }

  async cargarDatos(): Promise<void> {
    this.loading = true;

    try {
      const [arbitros, secretarias, participes, admins] = await Promise.all([
        this.usuarioService.getArbitros().toPromise(),
        this.usuarioService.getSecretarias().toPromise(),
        this.usuarioService.getParticipes().toPromise(),
        this.usuarioService.getAdmins().toPromise(),
      ]);

      // Normalizamos los tres tipos
      const normalizar = (lista: any[], rol: string) => {
        return (lista || []).map(item => ({
          id: item.usuario?.id ?? null,
          nombre: item.usuario?.nombre ?? '',
          apellidos: item.usuario?.apellidos ?? '',
          correo: item.usuario?.correo ?? '',
          rol,
          cargo: item.cargo ?? '',
          estado: item.estado === 'Activo' || item.estado === true ? 'Activo' : 'Inactivo',
        }));
      };

      // Función para normalizar admins con estructura directa
      const normalizarDirecto = (lista: any[], rol: string) => {
        return (lista || []).map(item => ({
          id: item.id ?? null,
          nombre: item.nombre ?? '',
          apellidos: item.apellidos ?? '',
          correo: item.correo ?? '',
          rol,
          cargo: item.cargo ?? '',
          estado: item.estado === true || item.estado === 'Activo' ? 'Activo' : 'Desactivado',
        }));
      };

      this.usuarios = [
        // ...normalizar(arbitros ?? [], 'Árbitro'),
        ...normalizar(secretarias ?? [], 'Secretaria'),
        // ...normalizar(participes ?? [], 'Partícipe'),
        ...normalizarDirecto(admins ?? [], 'Admin'),
      ];
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    } finally {
      this.loading = false;
    }
  }

  // // Combina todos los usuarios
  // get usuarios(): any[] {
  //   return [...this.arbitros, ...this.secretarias, ...this.participes];
  // }



  // Filtro por nombre o correo
  usuariosFiltrados(): any[] {
    if (!this.filtro.trim()) return this.usuarios;
    const filtroLower = this.filtro.toLowerCase();
    return this.usuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(filtroLower) ||
        u.correo.toLowerCase().includes(filtroLower)
    );
  }


  // cerrar modal
  crearUsuario(): void {
    if (this.formUsuario.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, completa todos los campos requeridos antes de continuar.',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    const usuario = this.formUsuario.value;

    this.usuarioService.crearUsuario(usuario).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Usuario creado correctamente',
          text: `El usuario ${usuario.nombre} ha sido registrado con éxito.`,
          confirmButtonColor: '#3085d6'
        }).then(() => {
          this.cerrarModal();
          this.cargarDatos();
        });
      },
      error: (err) => {
        const mensaje = err.error?.message || 'Error inesperado al crear el usuario.';
        Swal.fire({
          icon: 'error',
          title: 'Error al crear usuario',
          text: mensaje,
          confirmButtonColor: '#d33'
        });
        console.error('Error al crear usuario:', err);
      },
    });
  }
}
