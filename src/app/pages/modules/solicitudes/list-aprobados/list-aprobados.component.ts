
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Service
import { TramiteMPVService } from 'src/app/services/tramiteMPV.service';

@Component({
  selector: 'list-aprobados',
  imports: [FormsModule, CommonModule],
  templateUrl: './list-aprobados.component.html',
  styles: ``
})
export class ListAprobadosComponent implements OnInit {


  solicitudesAprobadas: any[] = []
  solicitudesFiltradas: any[] = [];
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

        // IMPORTANTE
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



    // const matchTexto = (item: any) => {
    //   if (!buscar) return true;

    //   return (
    //     (item.numero_expediente || '').toLowerCase().includes(buscar) ||
    //     (item.solicitante || '').toLowerCase().includes(buscar) ||
    //     (item.correo || '').toLowerCase().includes(buscar) ||
    //     (item.tipo || '').toLowerCase().includes(buscar) ||
    //     (item.estado || '').toLowerCase().includes(buscar)
    //   );

    //   // const ne = (item.numero_expediente || '').toString().toLowerCase();
    //   // const solicitante = (item.solicitante || '').toLowerCase();
    //   // const correo = (item.correo || '').toLowerCase();
    //   // const tipoIt = (item.tipo || '').toLowerCase();
    //   // const estadoIt = (item.estado || '').toLowerCase();

    //   // return ne.includes(buscar) ||
    //   //   solicitante.includes(buscar) ||
    //   //   correo.includes(buscar) ||
    //   //   tipoIt.includes(buscar) ||
    //   //   estadoIt.includes(buscar);
    // };

    // this.solicitudesFiltradas = this.solicitudesAprobadas.filter(item =>
    //   (!tipo || item.tipo === tipo) &&
    //   matchTexto(item)
    // );


    // const aplicarAFiltrar = (lista: any[]) =>
    //   (lista || []).filter(item =>
    //     (!tipo || item.tipo === tipo) &&
    //     (!estado || item.estado === estado) &&
    //     matchTexto(item)
    //   );

  }


  // Helpers
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
