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

@Component({
  selector: 'app-solicitudes',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SolicitudDetailComponent],
  templateUrl: './solicitudes.component.html',
  styles: ``
})
export class SolicitudesComponent implements OnInit {


  // Variables
  fb = inject(FormBuilder);
  formUtils = FormUtils;

  solicitudes: any[] = [];
  solicitudesAprobadas: any[] = [];
  solicitudesRechazadas: any[] = [];

  // Nuevo campo para razón o comentario
  razonRechazo: string = '';

  loading = true;

  usuario: any = null;
  rol: string = '';

  mostrarDetalle = false;
  tramiteSeleccionado: any = null;
  tramiteDetalle: any = null;



  // Filtros
  search = '';
  estado = '';
  tipo = '';
  fecha_inicio = '';
  fecha_fin = '';
  filtroSearch: string = '';
  filtroTipo: string = '';
  filtroEstado: string = '';

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
    this.cargarTramites();
  }

  cambiarLimite() {
    this.limit = Number(this.limit);
    this.page = 1;
    this.cargarTramites();
  }

  // ya las tienes, pero añade:
  solicitudesFiltradas: any[] = [];             // opcional global
  solicitudesPendientesFiltradas: any[] = [];   // PARA TAB PENDIENTES
  solicitudesAprobadasFiltradas: any[] = [];    // PARA TAB APROBADAS
  solicitudesRechazadasFiltradas: any[] = [];   // PARA TAB RECHAZADAS

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
    this.cargarTramites();
  }

  // ======================================================
  //  Cargar trámites usando el nuevo service con filtros
  // ======================================================
  cargarTramites(): void {
    console.log('PAGE:', this.page, 'LIMIT:', this.limit);
    this.loading = true;

    const filtros: any = {
      page: this.page,
      limit: this.limit,
      rol: this.rol,
      search: this.search,
      estado: this.estado,
      tipo: this.tipo,
      fecha_inicio: this.fecha_inicio,
      fecha_fin: this.fecha_fin
    };

    // Si es usuario, debe enviarse el id_usuario
    if (this.rol === 'usuario') {
      filtros.id_usuario = this.usuario.id_usuario;
    }

    this.tramiteService.listarTramites(filtros).subscribe({
      next: (resp) => {

        console.log('Respuesta trámites:', resp);
        const tramites = resp.data ?? [];

        // Clasificación por estado
        this.solicitudes = tramites.filter(t => t.estado === 'pendiente');
        this.solicitudesAprobadas = tramites.filter(t => t.estado === 'aprobada');
        this.solicitudesRechazadas = tramites.filter(t => t.estado === 'rechazada');


        // Paginación
        // this.page = resp.page;
        this.totalPages = resp.totalPages;
        this.totalItems = resp.total;

        this.loading = false;
      },
      error: (err) => {
        console.error('Error al listar trámites:', err.message);
        this.loading = false;
      },
    });
  }

  aplicarFiltros() {
    const buscar = (this.filtroSearch || '').toLowerCase().trim();
    const tipo = this.filtroTipo;
    const estado = this.filtroEstado;

    const matchTexto = (item: any) => {
      if (!buscar) return true;
      const ne = (item.numero_expediente || '').toString().toLowerCase();
      const solicitante = (item.solicitante || '').toLowerCase();
      const correo = (item.correo || '').toLowerCase();
      const tipoIt = (item.tipo || '').toLowerCase();
      const estadoIt = (item.estado || '').toLowerCase();

      return ne.includes(buscar) ||
        solicitante.includes(buscar) ||
        correo.includes(buscar) ||
        tipoIt.includes(buscar) ||
        estadoIt.includes(buscar);
    };

    const aplicarAFiltrar = (lista: any[]) =>
      (lista || []).filter(item =>
        (!tipo || item.tipo === tipo) &&
        (!estado || item.estado === estado) &&
        matchTexto(item)
      );

    // Filtrar cada lista (originales vienen de cargarTramites)
    this.solicitudesPendientesFiltradas = aplicarAFiltrar(this.solicitudes);
    this.solicitudesAprobadasFiltradas = aplicarAFiltrar(this.solicitudesAprobadas);
    this.solicitudesRechazadasFiltradas = aplicarAFiltrar(this.solicitudesRechazadas);

    // opcional: actualizar la lista global si la usas en algún lugar
    this.solicitudesFiltradas = [
      ...this.solicitudesPendientesFiltradas,
      ...this.solicitudesAprobadasFiltradas,
      ...this.solicitudesRechazadasFiltradas
    ];

  }

  abrirModal(solicitud: any) {
    this.tramiteSeleccionado = solicitud;
    this.nuevoEstado = '';
    this.razonRechazo = '';
    // this.modalVisible = true;
    // this.razonRechazo = ''; // limpiar cada vez que se abra el modal
  }

  cerrarModal() {
    this.tipoModal = null;
    // this.modalVisible = false;
    this.tramiteSeleccionado = null;
    this.tramiteDetalle = null;
    // this.nuevoEstado = '';
    // this.razonRechazo = '';
  }

  verDetalle(tramite: any) {

    this.tramiteDetalle = tramite;
    // this.mostrarDetalle = true;
    this.tipoModal = 'detalle';
  }

  cerrarDetalle() {
    this.mostrarDetalle = false;
    this.tramiteSeleccionado = null;
  }

  verArchivo(item: any) {
    if (!item?.documento) {
      console.warn("No existe un archivo en este registro");
      return;
    }

    const url = item.documento; // debe ser un link válido (https://...)
    window.open(url, "_blank");
  }

  aprobarSolicitud(item: any) {
    console.log("Aprobar solicitud:", item);
    // Lógica para aprobar solicitud
  }



  // siguientePagina(): void {
  //   if (this.paginaActual < this.totalPaginas) {
  //     this.cargarTramites(this.paginaActual + 1);
  //   }
  // }

  // paginaAnterior(): void {
  //   if (this.paginaActual > 1) {
  //     this.cargarTramites(this.paginaActual - 1);
  //   }
  // }

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
    const payload = {
      estado: nuevoEstadoTramite,
      id_expediente: tramite.id_expediente,
      usuario_responsable: this.usuario?.nombre || 'Administrador del sistema',
      //razon: this.razonRechazo || null,
      observaciones: nuevoEstadoTramite === 'rechazada' ? this.razonRechazo : undefined,
      correo_solicitante: tramite.correo,
      nombre_solicitante: tramite.solicitante,
      // correo_asociado: { ... }   <-- si luego usas webhooks, aquí entra
    };

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
          // console.log(` Trámite ${tramite.id} actualizado a: ${nuevoEstadoTramite}`);

          const expedienteId = tramite.expediente_id;
          const nuevoEstadoExpediente =
            nuevoEstadoTramite === 'aprobada' ? 'En trámite' : 'Suspendido';

          if (!expedienteId) {
            Swal.fire({
              icon: 'warning',
              title: 'Actualizado con advertencia',
              text: 'El trámite fue actualizado, pero no se encontró expediente asociado.',
            });
            this.cerrarModal();
            this.cargarTramites();
            return;
          }

          // ================================
          // 4. Actualizamos EXPEDIENTE
          // ================================
          this.expedientesService.actualizarExpediente(expedienteId, {
            estado: nuevoEstadoExpediente
          })
            .subscribe({
              next: () => {
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
                this.cargarTramites();
                this.razonRechazo = '';
              },

              error: (err) => {
                console.error('Error expediente:', err);

                Swal.fire({
                  icon: 'error',
                  title: 'Error al actualizar expediente',
                  text: 'El trámite fue actualizado, pero ocurrió un error con el expediente.',
                });

                this.cerrarModal();
                this.cargarTramites();
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
