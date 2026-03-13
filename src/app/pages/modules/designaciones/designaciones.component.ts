import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Service
import { DesignacionService } from 'src/app/services/designacion.service';

// Components
import { DesignacionDocumentosComponent } from "./designacion-documentos/designacion-documentos.component";
import { DesignacionInfoComponent } from "./designacion-info/designacion-info.component";
import { DesignacionParticipesComponent } from "./designacion-participes/designacion-participes.component";

@Component({
  selector: 'app-designaciones',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, DesignacionDocumentosComponent, DesignacionInfoComponent, DesignacionParticipesComponent],
  templateUrl: './designaciones.component.html',
  styles: ``
})
export class DesignacionesComponent implements OnInit {


  designaciones: any[] = [];
  total = 0;
  pagina_actual = 1;
  por_pagina = 20;
  total_paginas = 0;

  searchTimeout: any;
  mostrarModal = false;
  documentosSeleccionados: any[] = [];
  mostrarDetalle = false;
  designacionSeleccionada: any = null;

  mostrarParticipe = false;
  participanteSeleccionado: any[] = [];

  // filtros
  filtroSearch = '';

  // Paginado
  page = 1;
  limit = 5;
  totalItems = 0;
  totalPages = 0;
  currentPage = 1;

  pageSizeOptions = [5, 10, 20, 50];

  loading = false;

  constructor(private designacionService: DesignacionService) { }

  ngOnInit() {
    this.cargarDesignaciones();
  }

  cargarDesignaciones(page: number = 1) {
    this.loading = true;

    const params: any = {
      page,
      limit: this.por_pagina
    };

    if (this.filtroSearch) params.search = this.filtroSearch;
    // if (this.filtroEstado) params.estado = this.filtroEstado;
    // if (this.filtroExpediente) params.expediente_id = this.filtroExpediente;
    // if (this.filtroAdjudicador) params.adjudicador_id = this.filtroAdjudicador;

    this.designacionService.listarDesignaciones(params).subscribe({
      next: (resp) => {
        this.designaciones = resp.designaciones;

        console.log('Designaciones cargadas:', this.designaciones);

        this.total = resp.total;
        this.pagina_actual = resp.pagina_actual;
        this.por_pagina = resp.por_pagina;
        this.total_paginas = resp.total_paginas;
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
      }
    });
  }

  verUsuarios(item: any) {
    this.mostrarParticipe = true;

    console.log("PARTICIPES: ", item.expediente.participes);

    this.participanteSeleccionado = item.expediente.participes;
  }
  verInfo(item: any) {
    this.mostrarDetalle = true;
    this.designacionSeleccionada = item;
  }
  verDocumentos(item: any) {
    this.mostrarModal = true;
    this.documentosSeleccionados = item.expediente.documentos;
  }

  // Helpers methods
  aplicarFiltros() {
    this.cargarDesignaciones(1);
  }

  limpiarFiltros() {
    this.filtroSearch = '';
    this.cargarDesignaciones(1);
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > this.total_paginas) return;
    this.cargarDesignaciones(nuevaPagina);
  }


  onSearchChange() {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      this.page = 1;
      this.cargarDesignaciones(this.page);
    }, 200);
  }

  cerrarModalDetalle() {
    this.mostrarDetalle = false;
    this.designacionSeleccionada = null;
  }

  cerrarModalParticipes() {
    this.mostrarParticipe = false;
    this.participanteSeleccionado = [];
  }

  cerrarModal() {

    this.mostrarModal = false;



  }
}
