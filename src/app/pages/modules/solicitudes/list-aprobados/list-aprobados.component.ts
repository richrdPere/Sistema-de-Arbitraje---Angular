
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Service
import { TramiteMPVService } from 'src/app/services/tramiteMPV.service';
import { SolicitudDetailComponent } from "../solicitud-detail/solicitud-detail.component";
import { SolicitudDocsComponent } from "../solicitud-docs/solicitud-docs.component";

@Component({
  selector: 'list-aprobados',
  imports: [FormsModule, CommonModule, SolicitudDetailComponent, SolicitudDocsComponent],
  templateUrl: './list-aprobados.component.html',
  styles: ``
})
export class ListAprobadosComponent implements OnInit {



  solicitudesAprobadas: any[] = [];
  solicitudesFiltradas: any[] = [];
  isLoading = false;

  mostrarModal = false;
  mostrarDetalle = false;
  documentosSeleccionados: any[] = [];
  tramiteDetalle: any = null;
  tramiteSeleccionado: any = null;
  tipoModal: 'detalle' | 'estado' | null = null;

  // Filtros
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

  // lista de tipos (si no la tienes)
  tiposTramite: string[] = ['Arbitraje Ad Hoc', 'Arbitraje Institucional', 'Arbitraje de Emergencia',
    //'Recusación', 'Designación residual', 'Instalación'
  ];


  constructor(
    private tramiteService: TramiteMPVService,
  ) { }


  ngOnInit(): void {
    this.cargarTramitesAprobados();
  }

  cargarTramitesAprobados() {
    this.isLoading = true;

    const filtros: any = {
      page: this.page,
      limit: this.limit,
      search: this.filtroSearch,
      tipo: this.filtroTipo,
      estado: "aprobada",

    };

    this.tramiteService.listarTramites(filtros).subscribe({
      next: (resp) => {

        console.log('Trámites cargados:', resp);
        this.solicitudesAprobadas = resp.data ?? [];

        this.solicitudesFiltradas = [...this.solicitudesAprobadas];

        this.totalItems = resp.total;
        this.totalPages = resp.totalPages;

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al listar trámites:', err.message);
        this.isLoading = false;
      },
    });
  }


  aplicarFiltros() {
    const buscar = (this.filtroSearch || '').toLowerCase().trim();
    const tipo = this.filtroTipo;
    // const estado = this.filtroEstado;

    this.solicitudesFiltradas = this.solicitudesAprobadas.filter(item => {

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

  verArchivos(item: any) {
    this.mostrarModal = true;
    this.documentosSeleccionados = item.documentos;

  }
  verDetalle(tramite: any) {
    this.tramiteDetalle = tramite;
    this.mostrarDetalle = true;
  }


  // Helpers
  cerrarModal() {
    this.tipoModal = null;
    this.mostrarModal = false;

    this.tramiteSeleccionado = null;
    this.tramiteDetalle = null;

  }

  cerrarDetalle() {
    this.mostrarDetalle = false;
    this.tramiteSeleccionado = null;
  }

  onPageSizeChange() {
    this.currentPage = 1; // vuelve a la primera página
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPages) return;
    this.page = nuevaPagina;
    this.cargarTramitesAprobados();
  }

  cambiarLimite() {
    // this.limit = Number(this.limit);
    this.page = 1;
    this.cargarTramitesAprobados();
  }



}
