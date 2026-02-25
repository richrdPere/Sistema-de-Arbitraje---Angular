import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Service
import { DesignacionService } from 'src/app/services/designacion.service';

@Component({
  selector: 'app-designaciones',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './designaciones.component.html',
  styles: ``
})
export class DesignacionesComponent implements OnInit {
  designaciones: any[] = [];
  total = 0;
  pagina_actual = 1;
  por_pagina = 20;
  total_paginas = 0;


  // filtros
  filtroEstado: string = '';
  filtroExpediente: string = '';
  filtroAdjudicador: string = '';

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

    if (this.filtroEstado) params.estado = this.filtroEstado;
    if (this.filtroExpediente) params.expediente_id = this.filtroExpediente;
    if (this.filtroAdjudicador) params.adjudicador_id = this.filtroAdjudicador;

    this.designacionService.listarDesignaciones(params).subscribe({
      next: (resp) => {
        this.designaciones = resp.designaciones;

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

  aplicarFiltros() {
    this.cargarDesignaciones(1);
  }

  limpiarFiltros() {
    this.filtroEstado = '';
    this.filtroExpediente = '';
    this.filtroAdjudicador = '';
    this.cargarDesignaciones(1);
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > this.total_paginas) return;
    this.cargarDesignaciones(nuevaPagina);
  }
}
