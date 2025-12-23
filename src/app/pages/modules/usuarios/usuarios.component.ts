import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule, FormGroup } from '@angular/forms';
import { FormUtils } from 'src/app/utils/form-utils';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

// Service
import { UsuarioService } from 'src/app/services/admin/usuarios.service';


@Component({
  selector: 'app-usuarios',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
})
export class UsuariosComponent implements OnInit {
  // Usuarios combinados
  usuarios: any[] = [];

  // Variables
  formArbitro!: FormGroup;
  formAdjudicador!: FormGroup;
  formUsuario!: FormGroup;
  fb = inject(FormBuilder);
  formUtils = FormUtils;

  loading = true;
  filtro: string = '';
  mostrarModal = false;
  modoEdicion = false;
  usuarioSeleccionado: any = null;

  backendErrors: any = {};

  constructor(private usuarioService: UsuarioService) { }

  ngOnInit(): void {

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

  abrirModal(modo: 'crear' | 'editar' = 'crear', usuario?: any) {
    this.mostrarModal = true;
    this.modoEdicion = modo === 'editar';

    if (modo === 'editar' && usuario) {
      this.usuarioSeleccionado = usuario;
      this.formUsuario.patchValue(usuario);
      this.formUsuario.get('password')?.clearValidators();
      this.formUsuario.get('password')?.updateValueAndValidity();
    } else {
      this.usuarioSeleccionado = null;
      this.formUsuario.reset();
      this.formUsuario.get('password')?.setValidators([Validators.required]);
      this.formUsuario.get('password')?.updateValueAndValidity();
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.formUsuario.reset();
    this.modoEdicion = false;
  }

  async cargarDatos(): Promise<void> {
    this.loading = true;

    try {
      const [secretarias, admins, arbitros, adjudicadores] = await Promise.all([
        this.usuarioService.getSecretarias().toPromise(),
        this.usuarioService.getAdmins().toPromise(),
        this.usuarioService.getArbitros().toPromise(),
        this.usuarioService.getAdjudicadores().toPromise()
      ]);

      // Normalizar secretarias
      const normalizar = (lista: any[] = [], rol: string) => {

        return lista.map(item => ({
          id: item.usuario?.id ?? null,
          nombre: item.usuario?.nombre ?? '',
          apellidos: item.usuario?.apellidos ?? '',
          correo: item.usuario?.correo ?? '',
          telefono: item.usuario?.telefono ?? '',
          documento_identidad: item.usuario?.documento_identidad ?? '',
          foto_perfil: item.usuario?.foto_perfil ?? null,
          rol,
          cargo: item.cargo ?? '',
          estado: item.usuario?.estado === true,
        }));
      };

      // Normalizar admins (estructura directa)
      const normalizarDirecto = (lista: any[] = [], rol: string) => {
        return lista.map(item => ({
          id: item.id,
          nombre: item.nombre ?? '',
          apellidos: item.apellidos ?? '',
          correo: item.correo ?? '',
          telefono: item.telefono ?? '',
          documento_identidad: item.documento_identidad ?? '',
          foto_perfil: `${this.usuarioService.envs.url_image}${item.foto_perfil}?t=${Date.now()}`,
          rol,
          cargo: '',
          estado: item.estado === true,
        }));
      };

      this.usuarios = [
        ...normalizarDirecto(admins, 'Admin'),
        ...normalizar(secretarias, 'Secretaria'),
        ...normalizar(arbitros, 'Arbitros'),
        ...normalizar(adjudicadores, 'Adjudicadores'),

      ];

      //  LOG SOLO DE foto_perfil
      this.usuarios.forEach(u => {
        console.log(`Usuario ID ${u.id} | Rol ${u.rol} | estado:`, u.estado);
      });

    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    } finally {
      this.loading = false;
    }
  }

  isUsuarioActivo(user: any): boolean {
    return user.estado === true;
  }


  private manejarErroresBackend(err: any) {
    console.error("Error backend:", err);

    // Si backend envía errors: { campo: "mensaje" }
    if (err?.error?.errors) {
      this.backendErrors = err.error.errors;

      Object.keys(this.backendErrors).forEach((campo) => {
        const control = this.formUsuario.get(campo);
        if (control) {
          control.setErrors({ backend: true });
        }
      });

      Swal.fire({
        icon: 'warning',
        title: 'Errores en el formulario',
        text: 'Revisa los campos marcados en rojo.'
      });

      return;
    }

    // Mensaje general
    Swal.fire({
      icon: 'error',
      title: 'Error al procesar la solicitud',
      text: err.error?.message || 'Error inesperado.'
    });
  }

  toggleEstadoUsuario(user: any): void {
    const accion = user.estado ? 'deshabilitar' : 'habilitar';

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas ${accion} la cuenta de ${user.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      const request$ = user.estado
        ? this.usuarioService.deshabilitarUsuario(user.id)
        : this.usuarioService.habilitarUsuario(user.id);

      request$.subscribe({
        next: () => {
          user.estado = !user.estado;

          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: `Usuario ${user.estado ? 'habilitado' : 'deshabilitado'} correctamente`,
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          console.error(err);

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el estado del usuario'
          });
        }
      });
    });
  }


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

    const usuario = this.formUsuario.value;

    //  MODO EDICIÓN
    if (this.modoEdicion) {

      this.usuarioService.actualizarUsuario(usuario.id, usuario).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Usuario actualizado correctamente' });
          this.cerrarModal();
          this.cargarDatos();
        },
        error: (err) => {
          this.manejarErroresBackend(err);

          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar usuario',
            text: err.error?.message || 'Error desconocido.',
          });
        },


      });

    }

    //  MODO CREACIÓN
    this.usuarioService.crearUsuario(usuario).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Usuario creado correctamente',
          text: 'Se envió un correo con las credenciales y enlace de confirmación.'
        });

        this.cerrarModal();
        this.cargarDatos();
      },
      error: (err) => {
        this.manejarErroresBackend(err);
      }
    });
  }

  verUsuario(usuario: any) {
    Swal.fire({
      title: 'Detalles del Usuario',
      html: `
        <div class="text-left">
          <b>Nombre:</b> ${usuario.nombre} ${usuario.apellidos}<br>
          <b>Correo:</b> ${usuario.correo}<br>
          <b>Rol:</b> ${usuario.rol}<br>
          <b>Cargo:</b> ${usuario.cargo || '-'}<br>
          <b>Estado:</b> ${usuario.estado}
        </div>
      `,
    });
  }

  eliminarUsuario(id: number) {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
    }).then(result => {
      if (result.isConfirmed) {
        this.usuarioService.eliminarUsuario(id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Usuario eliminado correctamente' });
            this.cargarDatos();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error al eliminar usuario',
              text: err.error?.message || 'Error inesperado',
            });
          },
        });
      }
    });
  }
}
