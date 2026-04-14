import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from 'src/app/utils/form-utils';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import Swal from 'sweetalert2';

// Service
import { TramiteMPVService } from 'src/app/services/tramiteMPV.service';
import { AuthService } from 'src/app/services/auth.service';
import { SolicitudesRefreshService } from '../../shared/services/solicitudesRefresh.service';

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

  tabActivo: 'pendiente' | 'aprobado' | 'rechazado' = 'pendiente';

  // lista de tipos (si no la tienes)
  tiposTramite: string[] = ['Arbitraje Ad Hoc', 'Arbitraje Institucional', 'Arbitraje de Emergencia'];

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
    private refreshService: SolicitudesRefreshService,
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
  // METHODS
  // ======================================================

  // - Cargar trámites
  cargarTramitesPorEstado(estado?: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'): void {
    this.loading = true;

    const filtros: any = {
      page: this.page,
      limit: this.limit,
      search: this.filtroSearch,
      tipo: this.filtroTipo,
      estado: "PENDIENTE",
    };

    // Si es usuario, debe enviarse el ID
    if (this.rol === 'usuario') {
      filtros.id_usuario = this.usuario.id;
    }

    this.tramiteService.listarTramitesPaginated(filtros).subscribe({
      next: (resp) => {
        this.solicitudes = resp.data ?? [];

        this.solicitudesFiltradas = [...this.solicitudes];

        this.totalItems = resp.total;
        this.totalPages = resp.totalPages;


        // AJUSTE AUTOMÁTICO DE PÁGINA
        if (this.page > this.totalPages && this.totalPages > 0) {
          this.page = this.totalPages;
          this.cargarTramitesPorEstado(estado); //  recargar con página válida
          return;
        }

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      },
    });
  }

  // - Aplicar filtros
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
  }

  // - Aprobar solicitud
  aprobarSolicitud() {
    this.nuevoEstado = 'APROBADA';
    this.confirmarCambioEstado();
  }

  // - Rechazar solicitud
  rechazarSolicitud(motivo: string) {
    this.nuevoEstado = 'RECHAZADA';
    this.razonRechazo = motivo;
    this.confirmarCambioEstado();
  }

  // - Cambiar estado del trámite
  confirmarCambioEstado() {
    if (!this.tramiteSeleccionado || !this.nuevoEstado) return;

    const tramite = this.tramiteSeleccionado;

    // 1. Preparamos payload
    const payload: any = {
      estado: this.nuevoEstado,
      usuario_id: this.usuario.id,
      observaciones: this.nuevoEstado === 'RECHAZADA' ? this.razonRechazo : null,
      correo_solicitante: tramite.correo,
      nombre_solicitante: tramite.solicitante,
    };

    // 2. Loading inicial
    Swal.fire({
      title: 'Procesando...',
      text: 'Actualizando estado del trámite',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    // 3. Actualizamos TRÁMITE
    this.tramiteService.updateEstadoTramite(tramite.id, payload)
      .subscribe({
        next: () => {

          Swal.fire({
            icon: 'success',
            title:
              this.nuevoEstado === 'APROBADA'
                ? 'Solicitud aprobada'
                : 'Solicitud rechazada',
            html:
              this.nuevoEstado === 'RECHAZADA'
                ? `<b>Motivo:</b><br>${this.razonRechazo}`
                : 'Se ha procesado correctamente.',
          });

          this.cerrarModal();
          this.razonRechazo = '';

          this.cargarTramitesPorEstado();
          this.refreshService.emitirActualizacion();
        },

        error: (err) => {

          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar trámite',
            text: 'No se pudo actualizar el trámite. Intente nuevamente.',
          });
        }
      });
  }

  // ======================================================
  // HELPERS METHODS
  // ======================================================

  // - Modal estado
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

  // - Modal detalle
  verDetalle(tramite: any) {
    this.tramiteDetalle = tramite;
    this.mostrarDetalle = true;
  }

  cerrarDetalle() {
    this.mostrarDetalle = false;
    this.tramiteSeleccionado = null;
  }

  // - Modal ver archivo
  verArchivos(item: any) {
    this.mostrarModal = true;
    this.documentosSeleccionados = item.documentos;
  }
}
