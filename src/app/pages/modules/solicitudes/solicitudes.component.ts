import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from 'src/app/utils/form-utils';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import Swal from 'sweetalert2';

// Service
import { TramiteMPVService } from 'src/app/services/tramiteMPV.service';
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';
import { AuthService } from 'src/app/services/auth.service';

// Pipes
import { DatePipe } from '@angular/common';
import { SolicitudDetailComponent } from "./solicitud-detail/solicitud-detail.component";
import { SolicitudAprobadoComponent } from "./solicitud-aprobado/solicitud-aprobado.component";
import { SolicitudDocsComponent } from "./solicitud-docs/solicitud-docs.component";
import { Router } from '@angular/router';
import { ListAprobadosComponent } from "./list-aprobados/list-aprobados.component";
import { ListRechazadosComponent } from "./list-rechazados/list-rechazados.component";

@Component({
  selector: 'app-solicitudes',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SolicitudDetailComponent, SolicitudAprobadoComponent, SolicitudDocsComponent, ListAprobadosComponent, ListRechazadosComponent],
  templateUrl: './solicitudes.component.html',
  styles: ``
})
export class SolicitudesComponent implements OnInit {

  // Variables
  fb = inject(FormBuilder);
  formUtils = FormUtils;

  solicitudes: any[] = [];
  solicitudesFiltradas: any[] = [];

  // Nuevo campo para razón o comentario
  razonRechazo: string = '';

  loading = false;

  usuario: any = null;
  rol: string = '';

  mostrarModal = false;
  mostrarDetalle = false;
  tramiteSeleccionado: any = null;
  tramiteDetalle: any = null;

  documentosSeleccionados: any[] = [];

  // Filtros
  search = '';
  estado = 'pendiente';
  tipo = '';
  fecha_inicio = '';
  fecha_fin = '';
  filtroSearch: string = '';
  filtroTipo: string = '';
  // filtroEstado: string = '';

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

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPages) return;
    this.page = nuevaPagina;
    this.cargarTramitesPorEstado();
  }

  cambiarLimite() {
    this.limit = Number(this.limit);
    this.page = 1;
    this.cargarTramitesPorEstado();
  }

  // ya las tienes, pero añade:

  // solicitudesPendientesFiltradas: any[] = [];   // PARA TAB PENDIENTES
  // solicitudesAprobadasFiltradas: any[] = [];    // PARA TAB APROBADAS
  // solicitudesRechazadasFiltradas: any[] = [];   // PARA TAB RECHAZADAS

  tabActivo: 'pendiente' | 'aprobado' | 'rechazado' = 'pendiente';

  // lista de tipos (si no la tienes)
  tiposTramite: string[] = ['Arbitraje Ad Hoc', 'Arbitraje Institucional', 'Arbitraje de Emergencia', 'Recusación', 'Designación residual', 'Instalación'];

  // Dropdown
  menuAbierto: number | null = null;

  menuPosX = 0;
  menuPosY = 0;

  toggleDropdown(index: number, event: MouseEvent) {
    // Si se vuelve a hacer click en el mismo menú, se cierra
    event.stopPropagation(); // Evita que se cierre inmediatamente
    this.menuAbierto = this.menuAbierto === index ? null : index;
  }

  cerrarDropdown() {
    this.menuAbierto = null;
  }


  // MODAL
  modalVisible = false;
  nuevoEstado: string = '';
  tipoModal: 'detalle' | 'estado' | null = null;

  constructor(
    private router: Router,
    private tramiteService: TramiteMPVService,
    private expedientesService: ExpedientesService,
    private authService: AuthService
  ) {

    this.usuario = authService.getUser()

    if (this.usuario) {
      this.rol = this.usuario.rol;
    }
  }


  ngOnInit(): void {
    this.cargarTramitesPorEstado();
  }

  // ======================================================
  //  Cargar trámites usando el nuevo service con filtros
  // ======================================================
  cargarTramitesPorEstado(estado?: 'pendiente' | 'aprobada' | 'rechazada'): void {
    this.loading = true;

    const filtros: any = {
      page: this.page,
      limit: this.limit,
      search: this.filtroSearch,
      tipo: this.filtroTipo,
      estado: "pendiente",
    };

    // Si es usuario, debe enviarse el id_usuario
    if (this.rol === 'usuario') {
      filtros.id_usuario = this.usuario.id_usuario;
    }

    this.tramiteService.listarTramites(filtros).subscribe({
      next: (resp) => {

        console.log('Trámites cargados:', resp);
        this.solicitudes = resp.data ?? [];

        this.solicitudesFiltradas = [...this.solicitudes];

        this.totalItems = resp.total;
        this.totalPages = resp.totalPages;

        // ================================
        // 2. AJUSTE AUTOMÁTICO DE PÁGINA
        // ================================
        if (this.page > this.totalPages && this.totalPages > 0) {
          this.page = this.totalPages;
          this.cargarTramitesPorEstado(estado); //  recargar con página válida
          return;
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error al listar trámites:', err.message);
        this.loading = false;
      },
    });
  }

  cargarTramitesAprobadas(): void {
    this.loading = true;

    const filtros: any = {
      page: this.page,
      limit: this.limit,
      rol: this.rol,
      search: this.search,
      estado: "aprobado",
      tipo: this.tipo,
      fecha_inicio: this.fecha_inicio,
      fecha_fin: this.fecha_fin
    };
  }

  aplicarFiltros() {
    const buscar = (this.filtroSearch || '').toLowerCase().trim();
    const tipo = this.filtroTipo;
    // const estado = this.filtroEstado;

    this.solicitudesFiltradas = this.solicitudes.filter(item => {

      const matchTexto =
        !buscar ||
        (item.numero_expediente || '').toLowerCase().includes(buscar) ||
        (item.solicitante || '').toLowerCase().includes(buscar) ||
        (item.correo || '').toLowerCase().includes(buscar) ||
        (item.tipo || '').toLowerCase().includes(buscar);

      const matchTipo =
        !tipo || item.tipo === tipo;

      return matchTexto && matchTipo;
    });


    // const matchTexto = (item: any) => {
    //   if (!buscar) return true;
    //   const ne = (item.numero_expediente || '').toString().toLowerCase();
    //   const solicitante = (item.solicitante || '').toLowerCase();
    //   const correo = (item.correo || '').toLowerCase();
    //   const tipoIt = (item.tipo || '').toLowerCase();
    //   const estadoIt = (item.estado || '').toLowerCase();

    //   return ne.includes(buscar) ||
    //     solicitante.includes(buscar) ||
    //     correo.includes(buscar) ||
    //     tipoIt.includes(buscar) ||
    //     estadoIt.includes(buscar);
    // };

    // const aplicarAFiltrar = (lista: any[]) =>
    //   (lista || []).filter(item =>
    //     (!tipo || item.tipo === tipo) &&
    //     // (!estado || item.estado === estado) &&
    //     matchTexto(item)
    //   );

    // // Filtrar cada lista (originales vienen de cargarTramites)
    // this.solicitudesPendientesFiltradas = aplicarAFiltrar(this.solicitudes);
    // // this.solicitudesAprobadasFiltradas = aplicarAFiltrar(this.solicitudesAprobadas);
    // // this.solicitudesRechazadasFiltradas = aplicarAFiltrar(this.solicitudesRechazadas);

    // // opcional: actualizar la lista global si la usas en algún lugar
    // this.solicitudesFiltradas = [
    //   ...this.solicitudesPendientesFiltradas,
    //   // ...this.solicitudesAprobadasFiltradas,
    //   // ...this.solicitudesRechazadasFiltradas
    // ];

  }

  abrirModalEstado(tramite: any) {
    this.tramiteSeleccionado = tramite;
    this.tipoModal = 'estado';
  }

  abrirModal(solicitud: any) {
    this.tramiteSeleccionado = solicitud;
    this.tipoModal = 'estado';
  }

  cerrarModal() {
    this.tipoModal = null;
    this.mostrarModal = false;

    this.tramiteSeleccionado = null;
    this.tramiteDetalle = null;

  }

  verDetalle(tramite: any) {

    console.log("TRAMITE: ", tramite);

    this.tramiteDetalle = tramite;
    this.mostrarDetalle = true;
  }

  cerrarDetalle() {
    this.mostrarDetalle = false;
    this.tramiteSeleccionado = null;
  }

  verArchivos(item: any) {
    this.mostrarModal = true;
    this.documentosSeleccionados = item.documentos;
    // { this.router.navigate([`app/expedientes/${item.id_expediente}/documentos`]); }

  }

  aprobarSolicitud() {
    this.nuevoEstado = 'aprobada';
    this.confirmarCambioEstado();
  }

  rechazarSolicitud(motivo: string) {
    this.nuevoEstado = 'rechazada';
    this.razonRechazo = motivo;
    this.confirmarCambioEstado();
  }


  // ======================================================
  //  Cambiar estado del trámite + expediente
  // ======================================================
  confirmarCambioEstado() {
    if (!this.tramiteSeleccionado || !this.nuevoEstado) return;

    const tramite = this.tramiteSeleccionado;
    const nuevoEstadoTramite = this.nuevoEstado;

    // ================================
    // 1. Preparamos payload
    // ================================
    const payload: any = {
      estado: nuevoEstadoTramite,
      id_expediente: tramite.id_expediente,
      usuario_responsable: this.usuario?.nombre || 'Administrador del sistema',
      //razon: this.razonRechazo || null,
      observaciones: nuevoEstadoTramite === 'rechazada' ? this.razonRechazo : undefined,
      correo_solicitante: tramite.correo,
      nombre_solicitante: tramite.solicitante,
      // correo_asociado: { ... }   <-- si luego usas webhooks, aquí entra
    };

    if (nuevoEstadoTramite === 'rechazada') {
      payload.observaciones = this.razonRechazo;
    }

    // ================================
    // 2. Loading inicial
    // ================================
    Swal.fire({
      title: 'Procesando...',
      text: 'Actualizando estado del trámite',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    // ================================
    // 3. Actualizamos TRÁMITE
    // ================================
    this.tramiteService.actualizarEstado(tramite.id, payload)
      .subscribe({
        next: () => {
          // const totalAntes = this.totalItems;

          const expedienteId = tramite.id_expediente;


          if (!expedienteId) {
            Swal.fire({
              icon: 'warning',
              title: 'Actualizado con advertencia',
              text: 'El trámite fue actualizado, pero no se encontró expediente asociado.',
            });
            this.cerrarModal();
            this.cargarTramitesPorEstado();
            return;
          }

          // ================================
          // 4. Actualizamos EXPEDIENTE
          // ================================
          const nuevoEstadoExpediente =
            nuevoEstadoTramite === 'aprobada' ? 'En trámite' : 'Suspendido';

          // ================================
          // 5. ACTUALIZAR EXPEDIENTE
          // ================================

          this.expedientesService.actualizarExpediente(expedienteId, {
            estado: nuevoEstadoExpediente
          })
            .subscribe({
              next: () => {
                // ================================
                //  REAJUSTE DE PAGINACIÓN
                // ================================
                // const totalDespues = totalAntes - 1;
                // const nuevasTotalPages = Math.ceil(totalDespues / this.limit);

                // if (this.page > nuevasTotalPages) {
                //   this.page = nuevasTotalPages > 0 ? nuevasTotalPages : 1;
                // }
                // ================================
                Swal.fire({
                  icon: nuevoEstadoTramite === 'aprobada' ? 'success' : 'error',
                  title:
                    nuevoEstadoTramite === 'aprobada'
                      ? 'Solicitud aprobada'
                      : 'Solicitud rechazada',
                  html:
                    nuevoEstadoTramite === 'rechazada'
                      ? `<b>Motivo:</b><br>${this.razonRechazo}`
                      : 'Se ha procedido correctamente.',
                });

                this.cerrarModal();
                this.razonRechazo = '';



                this.cargarTramitesPorEstado();
              },

              error: (err) => {
                console.error('Error expediente:', err);

                Swal.fire({
                  icon: 'error',
                  title: 'Error al actualizar expediente',
                  text: 'El trámite fue actualizado, pero ocurrió un error con el expediente.',
                });

                this.cerrarModal();
                this.cargarTramitesPorEstado();
              }
            });
        },

        error: (err) => {
          console.error('Error trámite:', err);

          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar trámite',
            text: 'No se pudo actualizar el trámite. Intente nuevamente.',
          });
        }
      });
  }

  mostrarCampoRechazo() {
    this.nuevoEstado = 'rechazada';
  }

}
