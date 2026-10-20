import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, finalize, firstValueFrom, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

// Models
import { AuthPersona, AuthRol } from 'src/app/core/models/auth-session.model';

// Service
import { UsuarioService } from 'src/app/pages/features/usuarios/services/usuarios.service';

// Interfaces
import { UsuarioListadoData, UsuariosPaginatedFilters } from 'src/app/pages/features/usuarios/interfaces';

// Componentes
import { UsuariosFormComponent } from './components/usuarios-form/usuarios-form.component';
import { UsuariosViewComponent } from './components/usuarios-view/usuarios-view.component';
import { UsuariosChangeCorreoComponent } from './components/usuarios-change-correo/usuarios-change-correo.component';
import { UsuariosChangeRolComponent } from './components/usuarios-change-rol/usuarios-change-rol.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UsuariosFormComponent,
    UsuariosViewComponent,
    UsuariosChangeCorreoComponent,
    UsuariosChangeRolComponent,
  ],
  templateUrl: './usuarios.component.html',
})
export class UsuariosComponent implements OnInit, OnDestroy {

  // *********************************************************
  // USUARIOS
  // *********************************************************

  usuarios: UsuarioListadoData[] = [];
  usuario_id: number | null = null;
  mostrarModalView = false;


  isLoading = false;
  errorMessage = '';

  // *********************************************************
  // MODAL
  // *********************************************************

  mostrarModal = false;
  modoEdicion = false;

  usuarioSeleccionado: UsuarioListadoData | null = null;

  // *********************************************************
  // MODAL: CAMBIAR CORREO
  // *********************************************************

  mostrarModalCorreo = false;
  usuarioCorreoSeleccionado: UsuarioListadoData | null = null;


  // *********************************************************
  // MODAL: CAMBIAR ROL
  // *********************************************************
  mostrarModalRol = false;
  usuarioRolSeleccionado: UsuarioListadoData | null = null;


  // *********************************************************
  // BÚSQUEDA Y FILTROS
  // *********************************************************

  searchBusqueda = '';
  rolBusqueda: AuthRol | '' = '';

  // '' = todos; true = activos; false = inactivos.
  estadoBusqueda: boolean | '' = '';

  searchTimeout: ReturnType<typeof setTimeout> | undefined;

  readonly rolesDisponibles: {
    id_rol: AuthRol;
    nombre: string;
  }[] = [
      { id_rol: 'ADMIN', nombre: 'ADMINISTRADOR' },
      { id_rol: 'SECRETARIA', nombre: 'SECRETARÍA' },
      { id_rol: 'PARTICIPE', nombre: 'PARTÍCIPE' },
      { id_rol: 'ARBITRO', nombre: 'ÁRBITRO' },
      { id_rol: 'ADJUDICADOR', nombre: 'ADJUDICADOR' },
      { id_rol: 'STAFF_INTERNO', nombre: 'PERSONAL INTERNO' },
    ];

  // *********************************************************
  // PAGINADO
  // *********************************************************

  page = 1;
  limit = 5;
  totalItems = 0;
  totalPages = 0;
  currentPage = 1;

  readonly pageSizeOptions = [5, 10, 20, 50];

  // *********************************************************
  // CAMBIO DE ESTADO
  // *********************************************************

  readonly usuariosCambiandoEstado = new Set<number>();

  // *********************************************************
  // SUSCRIPCIONES Y DESTRUCCIÓN
  // *********************************************************

  private listadoSubscription?: Subscription;
  private readonly destruir$ = new Subject<void>();
  private destruido = false;

  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.getUsuariosPaginated();
  }

  ngOnDestroy(): void {
    this.destruido = true;

    clearTimeout(this.searchTimeout);

    this.destruir$.next();
    this.destruir$.complete();
  }

  // *********************************************************
  // 1. OBTENER USUARIOS PAGINADOS
  // *********************************************************

  getUsuariosPaginated(): void {
    // Evita que una consulta anterior reemplace
    // el resultado de los filtros actuales.
    this.listadoSubscription?.unsubscribe();

    const params: UsuariosPaginatedFilters = {
      page: this.page,
      limit: this.limit,

      search: this.searchBusqueda.trim() || undefined,
      rol: this.rolBusqueda || undefined,

      estado: this.estadoBusqueda === ''
        ? undefined
        : this.estadoBusqueda,

      sort_by: 'createdAt',
      sort_order: 'DESC',
    };

    this.isLoading = true;
    this.errorMessage = '';

    this.listadoSubscription = this.usuarioService
      .getUsuariosPaginated(params)
      .pipe(
        takeUntil(this.destruir$),

        finalize(() => {
          this.isLoading = false;

          if (!this.destruido) {
            this.cdr.markForCheck();
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.limpiarListado();

            this.errorMessage =
              response.message ||
              'No se pudieron obtener los usuarios.';

            return;
          }

          const { items, pagination } = response.data;

          this.usuarios = items;
          this.totalItems = pagination.total;
          this.totalPages = pagination.totalPages;

          this.page = pagination.page;
          this.currentPage = pagination.page;
          this.limit = pagination.limit;
        },

        error: (error: unknown) => {
          this.limpiarListado();

          this.errorMessage = this.obtenerMensajeError(
            error,
            'No se pudieron obtener los usuarios.',
          );
        },
      });
  }

  // *********************************************************
  // 2. EDITAR USUARIO
  // *********************************************************

  editarUsuario(usuario: UsuarioListadoData): void {
    this.modoEdicion = true;

    this.usuarioSeleccionado = {
      ...usuario,
      persona: { ...usuario.persona },
    };

    this.mostrarModal = true;
  }

  // *********************************************************
  // 3. VER USUARIO
  // *********************************************************

  verUsuario(usuario: UsuarioListadoData): void {
    this.usuario_id = usuario.id_usuario;
    this.mostrarModalView = true;
  }

  cerrarModalInfo(): void {
    this.mostrarModalView = false;
    this.usuario_id = null;
  }

  // *********************************************************
  // 3.1. MODAL: CAMBIAR CORREO
  // *********************************************************

  abrirModalCorreo(usuario: UsuarioListadoData): void {
    this.usuarioCorreoSeleccionado = {
      ...usuario,
      persona: { ...usuario.persona },
    };

    this.mostrarModalCorreo = true;
  }

  cerrarModalCorreo(): void {
    this.mostrarModalCorreo = false;
    this.usuarioCorreoSeleccionado = null;
  }

  onCorreoActualizado(): void {
    this.cerrarModalCorreo();
    this.getUsuariosPaginated();
  }

  // *********************************************************
  // 3.2. MODAL: CAMBIAR ROL
  // *********************************************************
  abrirModalRol(usuario: UsuarioListadoData): void {
    this.usuarioRolSeleccionado = {
      ...usuario,
      persona: { ...usuario.persona },
    };

    this.mostrarModalRol = true;
  }

  cerrarModalRol(): void {
    this.mostrarModalRol = false;
    this.usuarioRolSeleccionado = null;
  }

  onRolActualizado(): void {
    this.cerrarModalRol();
    this.getUsuariosPaginated();
  }

  // *********************************************************
  // 4. CAMBIAR ESTADO
  // Usar desde el evento (change) del checkbox.
  // *********************************************************

  async cambiarEstado(
    usuario: UsuarioListadoData,
    event: Event,
  ): Promise<void> {
    const input = event.target instanceof HTMLInputElement
      ? event.target
      : null;

    // El checkbox ya cambió visualmente.
    // Se restaura hasta recibir confirmación del backend.
    if (input) {
      input.checked = usuario.estado;
    }

    const usuarioId = usuario.id_usuario;

    if (this.usuariosCambiandoEstado.has(usuarioId)) {
      return;
    }

    const nuevoEstado = !usuario.estado;
    const nombre = this.getNombreCompleto(usuario.persona);

    this.usuariosCambiandoEstado.add(usuarioId);
    this.cdr.markForCheck();

    try {
      const resultado = await Swal.fire({
        icon: 'warning',

        title: nuevoEstado
          ? '¿Activar usuario?'
          : '¿Desactivar usuario?',

        text: nuevoEstado
          ? `Se habilitará la cuenta de ${nombre}.`
          : `Se deshabilitará la cuenta de ${nombre}.`,

        showCancelButton: true,

        confirmButtonText: nuevoEstado
          ? 'Sí, activar'
          : 'Sí, desactivar',

        cancelButtonText: 'Cancelar',

        confirmButtonColor: nuevoEstado
          ? '#16a34a'
          : '#dc2626',

        reverseButtons: true,
        focusCancel: true,
        showLoaderOnConfirm: true,

        allowOutsideClick: () => !Swal.isLoading(),
        allowEscapeKey: () => !Swal.isLoading(),

        preConfirm: async () => {
          if (this.destruido) {
            return false;
          }

          try {
            const response = await firstValueFrom(
              this.usuarioService
                .changeEstadoUsuario(
                  usuarioId,
                  { estado: nuevoEstado },
                )
                .pipe(
                  takeUntil(this.destruir$),
                ),
            );

            if (!response.success) {
              Swal.showValidationMessage(
                response.message ||
                'No se pudo actualizar el estado.',
              );

              return false;
            }

            return response;
          } catch (error: unknown) {
            if (!this.destruido) {
              Swal.showValidationMessage(
                this.obtenerMensajeError(
                  error,
                  'No se pudo actualizar el estado del usuario.',
                ),
              );
            }

            return false;
          }
        },
      });

      if (
        this.destruido ||
        !resultado.isConfirmed ||
        !resultado.value
      ) {
        return;
      }

      // Estado confirmado por el backend.
      usuario.estado = resultado.value.data.estado;

      if (input) {
        input.checked = usuario.estado;
      }

      // Actualiza filtros, paginación y fechas del listado.
      this.getUsuariosPaginated();

      void Swal.fire({
        icon: 'success',

        title: usuario.estado
          ? 'Usuario activado'
          : 'Usuario desactivado',

        text: resultado.value.message,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error: unknown) {
      if (!this.destruido) {
        void Swal.fire({
          icon: 'error',
          title: 'Error al cambiar el estado',
          text: this.obtenerMensajeError(
            error,
            'No se pudo actualizar el estado del usuario.',
          ),
        });
      }
    } finally {
      this.usuariosCambiandoEstado.delete(usuarioId);

      if (!this.destruido) {
        this.cdr.markForCheck();
      }
    }
  }

  estaCambiandoEstado(
    usuario: UsuarioListadoData,
  ): boolean {
    return this.usuariosCambiandoEstado.has(
      usuario.id_usuario,
    );
  }

  // *********************************************************
  // BÚSQUEDA Y FILTROS
  // *********************************************************

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      this.page = 1;
      this.currentPage = 1;

      this.getUsuariosPaginated();
    }, 300);
  }

  onFiltroChange(): void {
    clearTimeout(this.searchTimeout);

    this.page = 1;
    this.currentPage = 1;

    this.getUsuariosPaginated();
  }

  limpiarFiltros(): void {
    clearTimeout(this.searchTimeout);

    this.searchBusqueda = '';
    this.rolBusqueda = '';
    this.estadoBusqueda = '';

    this.page = 1;
    this.currentPage = 1;

    this.getUsuariosPaginated();
  }

  // *********************************************************
  // PAGINACIÓN
  // *********************************************************

  cambiarPagina(nuevaPagina: number): void {
    if (
      this.isLoading ||
      !Number.isInteger(nuevaPagina) ||
      nuevaPagina < 1 ||
      nuevaPagina > this.totalPages ||
      nuevaPagina === this.page
    ) {
      return;
    }

    clearTimeout(this.searchTimeout);

    this.page = nuevaPagina;
    this.currentPage = nuevaPagina;

    this.getUsuariosPaginated();
  }

  cambiarLimite(): void {
    clearTimeout(this.searchTimeout);

    const nuevoLimite = Number(this.limit);

    this.limit = this.pageSizeOptions.includes(nuevoLimite)
      ? nuevoLimite
      : this.pageSizeOptions[0];

    this.page = 1;
    this.currentPage = 1;

    this.getUsuariosPaginated();
  }

  onPageSizeChange(): void {
    this.cambiarLimite();
  }

  // *********************************************************
  // MODALES
  // *********************************************************

  abrirModal(): void {
    this.modoEdicion = false;
    this.usuarioSeleccionado = null;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.modoEdicion = false;
    this.usuarioSeleccionado = null;
  }

  /**
   * Conectar al evento de guardado exitoso
   * del subcomponente de formulario.
   */
  onUsuarioGuardado(): void {
    const eraEdicion = this.modoEdicion;

    this.cerrarModal();

    if (!eraEdicion) {
      this.page = 1;
      this.currentPage = 1;
    }

    this.getUsuariosPaginated();
  }

  // *********************************************************
  // HELPERS DE PRESENTACIÓN
  // *********************************************************
 get hayFiltros(): boolean {
    return !!(
      this.searchBusqueda.trim() ||
      this.rolBusqueda ||
      this.estadoBusqueda
    );
  }

  getNombreCompleto(
    persona: AuthPersona | null | undefined,
  ): string {
    if (!persona) {
      return '-';
    }

    switch (persona.tipo) {
      case 'NATURAL':
        return [
          persona.nombres?.trim(),
          persona.apellidos?.trim(),
        ]
          .filter(Boolean)
          .join(' ') || '-';

      case 'JURIDICA':
        return persona.razon_social?.trim() || '-';

      case 'ENTIDAD_PUBLICA':
        return persona.nombre_entidad?.trim() || '-';

      default:
        return '-';
    }
  }

  getDocumentoUsuario(
    usuario: UsuarioListadoData,
  ): string {
    return usuario.persona.dni?.trim() ||
      usuario.persona.ruc?.trim() ||
      '-';
  }

  getCargoUsuario(
    usuario: UsuarioListadoData,
  ): string {
    return usuario.persona.cargo?.trim() || '-';
  }

  isUsuarioActivo(
    usuario: UsuarioListadoData,
  ): boolean {
    return usuario.estado;
  }

  private limpiarListado(): void {
    this.usuarios = [];
    this.totalItems = 0;
    this.totalPages = 0;
  }

  // *********************************************************
  // HELPER DE ERRORES
  // *********************************************************

  private obtenerMensajeError(
    error: unknown,
    mensajePredeterminado: string,
  ): string {
    if (typeof error === 'string') {
      return error.trim() || mensajePredeterminado;
    }

    const err = error as {
      error?: { message?: unknown } | string;
      message?: unknown;
    } | null;

    const mensajeBackend =
      typeof err?.error === 'string'
        ? err.error
        : err?.error?.message;

    if (
      typeof mensajeBackend === 'string' &&
      mensajeBackend.trim()
    ) {
      return mensajeBackend;
    }

    if (
      typeof err?.message === 'string' &&
      err.message.trim()
    ) {
      return err.message;
    }

    return mensajePredeterminado;
  }
}

// import { CommonModule, DatePipe, } from '@angular/common';
// import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { finalize, firstValueFrom } from 'rxjs';
// import Swal from 'sweetalert2';

// // Directives
// import { UppercaseDirective } from 'src/app/shared/directives/uppercase.directive';


// // Service
// import { UsuarioService } from 'src/app/pages/features/usuarios/services/usuarios.service';

// // Componentes
// import { UsuariosFormComponent } from "./components/usuarios-form/usuarios-form.component";


// @Component({
//   selector: 'app-usuarios',
//   imports: [
//     CommonModule,
//     FormsModule,

//     UsuariosFormComponent,

//   ],
//   templateUrl: './usuarios.component.html',
// })
// export class UsuariosComponent implements OnInit {

//   // Usuarios combinados
//   usuarios: any[] = [];

//   // Variables
//   formArbitro!: FormGroup;
//   formAdjudicador!: FormGroup;
//   formUsuario!: FormGroup;
//   fb = inject(FormBuilder);
//   formUtils = FormUtils;

//   loading = true;
//   filtro: string = '';
//   mostrarModal = false;
//   modoEdicion = false;
//   usuarioSeleccionado: any = null;

//   backendErrors: any = {};
//   errorMessage: string = '';

//   // Search
//   search: string = '';
//   rolFiltro: string = '';

//   // Paginado
//   page = 1;
//   limit = 5;
//   totalItems = 0;
//   totalPages = 0;
//   currentPage = 1;

//   pageSizeOptions = [5, 10, 20, 50];

//   onPageSizeChange() {
//     this.currentPage = 1; // vuelve a la primera página
//   }

//   constructor(private usuarioService: UsuarioService) { }

//   ngOnInit(): void {
//     this.cargarUsuarios();
//   }

//   // =====================================================
//   // METHODS
//   // =====================================================
//   cargarUsuarios() {
//     this.loading = true;

//     this.usuarioService.getUsuariosPaginated({
//       page: this.page,
//       limit: this.limit,
//       rol: this.rolFiltro || undefined,
//       search: this.search?.trim() || undefined,

//     }).subscribe({
//       next: (resp) => {
//         this.usuarios = resp.data.map((u: any) => ({
//           ...u,
//           nombre: this.getNombreCompleto(u.persona),
//           documento: u.persona?.dni || u.persona?.ruc || '-',
//           telefono: u.persona?.telefono || '-',
//           documento_identidad: u.persona?.dni || u.persona?.ruc || '-',
//           email: u.persona?.email || u.correo
//         }));
//         this.totalItems = resp.total;
//         this.totalPages = resp.totalPages;
//         this.currentPage = resp.page;
//         this.loading = false;
//       },
//       error: (err) => {
//         this.loading = false;
//         this.errorMessage = err.error?.message || 'Error al cargar usuarios';
//       },
//     });
//   }

//   getCargoUsuario(user: any): string {
//     const rol = user?.rol?.toUpperCase();

//     switch (rol) {
//       case 'SECRETARIA':
//         return user?.secretaria?.cargo || '-';

//       case 'ARBITRO':
//         return user?.arbitro?.cargo || '-';

//       case 'ADJUDICADOR':
//         return user?.adjudicador?.cargo || '-';

//       default:
//         return '-';
//     }
//   }

//   onFiltroChange() {
//     this.page = 1;
//     this.cargarUsuarios();
//   }

//   cambiarPagina(nuevaPagina: number) {
//     if (nuevaPagina < 1 || nuevaPagina > this.totalPages) return;
//     this.page = nuevaPagina;
//     this.cargarUsuarios();
//   }

//   cambiarLimite() {
//     this.limit = Number(this.limit);
//     this.page = 1;
//     this.cargarUsuarios();
//   }



//   abrirModal(modo: 'crear' | 'editar' = 'crear', usuario?: any) {

//     this.mostrarModal = true;

//     if (modo === 'editar' && usuario) {

//       this.modoEdicion = true;
//       this.usuarioSeleccionado = { ...usuario }; // copia segura
//     } else {
//       this.modoEdicion = false;
//       this.usuarioSeleccionado = null;
//     }
//   }

//   cerrarModal() {
//     this.mostrarModal = false;
//   }

//   displayedColumns: string[] = [
//     'index',
//     'usuario',
//     'correo',
//     'dni',
//     'telefono',
//     'estado',
//     'acciones'
//   ];

//   isUsuarioActivo(user: any): boolean {
//     return user.estado === true;
//   }


//   private manejarErroresBackend(err: any) {

//     // Si backend envía errors: { campo: "mensaje" }
//     if (err?.error?.errors) {
//       this.backendErrors = err.error.errors;

//       Object.keys(this.backendErrors).forEach((campo) => {
//         const control = this.formUsuario.get(campo);
//         if (control) {
//           control.setErrors({ backend: true });
//         }
//       });

//       Swal.fire({
//         icon: 'warning',
//         title: 'Errores en el formulario',
//         text: 'Revisa los campos marcados en rojo.'
//       });

//       return;
//     }

//     // Mensaje general
//     Swal.fire({
//       icon: 'error',
//       title: 'Error al procesar la solicitud',
//       text: err.error?.message || 'Error inesperado.'
//     });
//   }

//   toggleEstadoUsuario(user: any, event: Event): void {
//     event.preventDefault();

//     const nuevoEstado = !user.estado;
//     const accion = nuevoEstado ? 'habilitar' : 'deshabilitar';

//     Swal.fire({
//       title: '¿Estás seguro?',
//       text: `¿Deseas ${accion} la cuenta de ${user.nombre}?`,
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Sí, continuar',
//       cancelButtonText: 'Cancelar',
//       reverseButtons: true
//     }).then((result) => {
//       if (!result.isConfirmed) return;

//       this.usuarioService.changeStateUsuario(user.id, nuevoEstado).subscribe({
//         next: () => {

//           user.estado = nuevoEstado;

//           Swal.fire({
//             icon: 'success',
//             title: 'Éxito',
//             text: `Usuario ${accion} correctamente`,
//             timer: 1500,
//             showConfirmButton: false
//           });
//         },
//         error: () => {
//           Swal.fire({
//             icon: 'error',
//             title: 'Error',
//             text: 'No se pudo actualizar el estado del usuario'
//           });
//         }
//       });
//     });
//   }


//   // Filtro por nombre o correo
//   usuariosFiltrados(): any[] {
//     if (!this.filtro.trim()) return this.usuarios;
//     const filtroLower = this.filtro.toLowerCase();
//     return this.usuarios.filter(
//       (u) =>
//         u.nombre.toLowerCase().includes(filtroLower) ||
//         u.correo.toLowerCase().includes(filtroLower)
//     );
//   }

//   verUsuario(usuario: any) {
//     Swal.fire({
//       title: 'Detalles del Usuario',
//       html: `
//         <div class="text-left">
//           <b>Nombre:</b> ${usuario.nombre} ${usuario.apellidos}<br>
//           <b>Correo:</b> ${usuario.correo}<br>
//           <b>Rol:</b> ${usuario.rol}<br>
//           <b>Cargo:</b> ${usuario.cargo || '-'}<br>
//           <b>Estado:</b> ${usuario.estado}
//         </div>
//       `,
//     });
//   }

//   eliminarUsuario(id: number) {
//     Swal.fire({
//       title: '¿Eliminar usuario?',
//       text: 'Esta acción no se puede deshacer.',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6',
//       confirmButtonText: 'Sí, eliminar',
//     }).then(result => {
//       if (result.isConfirmed) {
//         this.usuarioService.eliminarUsuario(id).subscribe({
//           next: () => {
//             Swal.fire({ icon: 'success', title: 'Usuario eliminado correctamente' });
//             this.cargarUsuarios();
//           },
//           error: (err) => {
//             Swal.fire({
//               icon: 'error',
//               title: 'Error al eliminar usuario',
//               text: err.error?.message || 'Error inesperado',
//             });
//           },
//         });
//       }
//     });
//   }

//   // ===========================================================
//   // HELPERS METHODS
//   // ===========================================================
//   getNombreCompleto(persona: any): string {
//     if (!persona) return '-';

//     if (persona.tipo === 'NATURAL') {
//       return `${persona.nombres || ''} ${persona.apellidos || ''}`.trim();
//     }

//     return persona.razon_social || persona.nombre_entidad || '-';
//   }
// }
