import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Service
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';

@Component({
  selector: 'app-trazabilidad',
  imports: [CommonModule, FormsModule],
  templateUrl: './trazabilidad.component.html',
  styles: ``
})
export class TrazabilidadComponent implements OnInit {

  cargando = false;
  expedientes: any[] = [];

  filtroEstado = '';
  busqueda = '';

  // Paginado
  page = 1;
  limit = 5;
  totalItems = 0;
  totalPages = 0;
  currentPage = 1;

  pageSizeOptions = [5, 10, 20, 50];

  constructor(private expedientesService: ExpedientesService) { }

  cambiarLimite() {
    // this.limit = Number(this.limit);
    this.page = 1;
    this.listarExpedientes();
  }

  ngOnInit(): void {
    this.listarExpedientes();
  }

  listarExpedientes(): void {
    this.cargando = true;

    // this.expedientesService.listarExpedientesConTrazabilidad().subscribe({
    //   next: (resp) => {
    //     this.expedientes = resp;
    //     this.cargando = false;
    //   },
    //   error: (err) => {
    //     console.error('Error al cargar trazabilidad', err);
    //     this.cargando = false;
    //   }
    // });
  }

  get expedientesFiltrados() {
    return this.expedientes.filter(e => {
      const coincideEstado = this.filtroEstado
        ? e.estadoProcesal === this.filtroEstado
        : true;

      const coincideBusqueda = this.busqueda
        ? e.codigoExpediente.toLowerCase().includes(this.busqueda.toLowerCase())
        : true;

      return coincideEstado && coincideBusqueda;
    });
  }

  getBadgeEstado(estado: string): string {
    const map: any = {
      INICIADO: 'badge badge-neutral',
      ARBITRO_DESIGNADO: 'badge badge-info',
      ACEPTADO: 'badge badge-primary',
      INSTALADO: 'badge badge-secondary',
      EN_TRAMITE: 'badge badge-warning',
      EN_AUDIENCIA: 'badge badge-accent',
      LAUDO_EMITIDO: 'badge badge-success',
      CERRADO: 'badge badge-outline',
    };

    return map[estado] || 'badge';
  }

}
