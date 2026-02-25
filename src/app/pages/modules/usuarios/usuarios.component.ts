import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule, FormGroup } from '@angular/forms';
import { FormUtils } from 'src/app/utils/form-utils';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

// Service
import { UsuarioService } from 'src/app/services/admin/usuarios.service';
import { UsuariosFormComponent } from "./usuarios-form/usuarios-form.component";


export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  documento_identidad: string;
  telefono: string;
  rol: string;
  estado: boolean;
  foto_perfil?: string;
}


@Component({
  selector: 'app-usuarios',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UsuariosFormComponent,

  ],
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

  // Search
  search: string = '';
  rolFiltro: string = '';

  // Paginado
  page = 1;
  limit = 5;
  totalItems = 0;
  totalPages = 0;
  currentPage = 1;

  pageSizeOptions = [5, 10, 20, 50];

  onPageSizeChange() {
    this.currentPage = 1; // vuelve a la primera página
  }

  constructor(private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.loading = true;

    this.usuarioService.getUsuariosPaginados({
      page: this.page,
      limit: this.limit,
      rol: this.rolFiltro || undefined,
      search: this.search?.trim() || undefined,

    }).subscribe(res => {
      this.usuarios = res.data;
      this.totalItems = res.total;
      this.totalPages = res.totalPages;
      this.loading = false;
    });
  }

  getCargoUsuario(user: any): string {
    const rol = user?.rol?.toUpperCase();

    switch (rol) {
      case 'SECRETARIA':
        return user?.secretaria?.cargo || '-';

      case 'ARBITRO':
        return user?.arbitro?.cargo || '-';

      case 'ADJUDICADOR':
        return user?.adjudicador?.cargo || '-';

      default:
        return '-';
    }
  }

  onFiltroChange() {
    this.page = 1;
    this.cargarUsuarios();
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPages) return;
    this.page = nuevaPagina;
    this.cargarUsuarios();
  }

  cambiarLimite() {
    this.limit = Number(this.limit);
    this.page = 1;
    this.cargarUsuarios();
  }



  abrirModal(modo: 'crear' | 'editar' = 'crear', usuario?: any) {

    this.mostrarModal = true;

    if (modo === 'editar' && usuario) {

      this.modoEdicion = true;
      this.usuarioSeleccionado = { ...usuario }; // copia segura
    } else {
      this.modoEdicion = false;
      this.usuarioSeleccionado = null;
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  displayedColumns: string[] = [
    'index',
    'usuario',
    'correo',
    'dni',
    'telefono',
    'estado',
    'acciones'
  ];

  isUsuarioActivo(user: any): boolean {
    return user.estado === true;
  }


  private manejarErroresBackend(err: any) {

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

  toggleEstadoUsuario(user: any, event: Event): void {
    event.preventDefault();

    const estadoActual = user.estado;
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
            this.cargarUsuarios();
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
