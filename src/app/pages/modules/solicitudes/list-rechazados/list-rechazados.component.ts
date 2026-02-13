import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Service
import { TramiteMPVService } from 'src/app/services/tramiteMPV.service';

@Component({
  selector: 'list-rechazados',
  imports: [FormsModule, CommonModule],
  templateUrl: './list-rechazados.component.html',
  styles: ``
})
export class ListRechazadosComponent implements OnInit {

  solicitudesRechazados: any[] = [];
  isLoading = false;

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
  tiposTramite: string[] = ['Arbitraje Ad Hoc', 'Arbitraje Institucional', 'Arbitraje de Emergencia', 'Recusación', 'Designación residual', 'Instalación'];


  constructor(
    private tramiteService: TramiteMPVService,
  ) { }


  ngOnInit(): void {
    this.cargarTramitesRechazados();
  }
  cargarTramitesRechazados() {
    this.isLoading = true;

    const filtros: any = {
      page: this.page,
      limit: this.limit,
      search: this.filtroSearch,
      estado: "rechazada",

    };

    this.tramiteService.listarTramites(filtros).subscribe({
      next: (resp) => {

        console.log('Trámites cargados:', resp);
        this.solicitudesRechazados = resp.data ?? [];

        // ================================
        // 1. Paginación REAL (BACKEND MANDA)
        // ================================
        this.totalItems = resp.total;
        this.totalPages = resp.totalPages;

        // ================================
        // 2. AJUSTE AUTOMÁTICO DE PÁGINA
        // ================================
        // if (this.page > this.totalPages && this.totalPages > 0) {
        //   this.page = this.totalPages;
        //   this.cargarTramitesPorEstado(); //  recargar con página válida
        //   return;
        // }

        // Clasificación por estado

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

    // // Filtrar cada lista (originales vienen de cargarTramites)
    // this.solicitudesPendientesFiltradas = aplicarAFiltrar(this.solicitudes);

    // // opcional: actualizar la lista global si la usas en algún lugar
    // this.solicitudesFiltradas = [
    //   ...this.solicitudesPendientesFiltradas,
    //   ...this.solicitudesAprobadasFiltradas,
    //   ...this.solicitudesRechazadasFiltradas
    // ];

  }


  // Helpers
  onPageSizeChange() {
    this.currentPage = 1; // vuelve a la primera página
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPages) return;
    this.page = nuevaPagina;
    this.cargarTramitesRechazados();
  }

  cambiarLimite() {
    this.limit = Number(this.limit);
    this.page = 1;
    this.cargarTramitesRechazados();
  }
}
