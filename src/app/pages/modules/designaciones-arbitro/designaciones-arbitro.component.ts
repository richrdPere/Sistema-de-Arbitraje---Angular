import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Service
import { DesignacionService } from 'src/app/services/designacion.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-designaciones-arbitro',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './designaciones-arbitro.component.html',
  styles: ``
})
export class DesignacionesArbitroComponent implements OnInit {


  // Designaciones
  designaciones: any[] = [];
  total = 0;

  pagina_actual = 1;
  por_pagina = 20;
  total_paginas = 0;

  searchTimeout: any;
  mostrarModal = false;
  mostrarModalForm = false;
  modoEdicion = false;
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

  constructor(
    private designacionService: DesignacionService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.getDesignacionesPaginated();
  }

  getDesignacionesPaginated(page: number = 1) {
    this.loading = true;
    const usuario = this.authService.getUser();

    if (!usuario) {
      this.loading = false;
      console.error('No existe un usuario autenticado');
      return;
    }

    const params: any = {
      usuario_id: usuario.id,
      // page,
      // limit: this.por_pagina
    };

    if (this.filtroSearch) params.search = this.filtroSearch;

    this.designacionService.getMisDesignacion(params).subscribe({
      next: (resp) => {
        this.designaciones = resp.designaciones;

        console.log('Designaciones cargadas:', this.designaciones);

        // this.total = resp.total;
        // this.pagina_actual = resp.pagina_actual;
        // this.por_pagina = resp.por_pagina;
        // this.total_paginas = resp.total_paginas;
        // this.loading = false;
      },
      error: (e) => {
        this.loading = false;
      }
    });
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      this.page = 1;
      this.getDesignacionesPaginated(this.page);
    }, 200);
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > this.total_paginas) return;
    this.getDesignacionesPaginated(nuevaPagina);
  }

  cambiarLimite() {
    // this.limit = Number(this.limit);
    this.page = 1;
    this.getDesignacionesPaginated();
  }

  changeDesignacion(_t45: any) {
    throw new Error('Method not implemented.');
  }
  verDocumentos(_t45: any) {
    throw new Error('Method not implemented.');
  }
  verInfo(_t45: any) {
    throw new Error('Method not implemented.');
  }
}
