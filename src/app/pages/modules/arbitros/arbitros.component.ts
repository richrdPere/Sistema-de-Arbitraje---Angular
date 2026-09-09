import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Directives
import { UppercaseDirective } from '../../shared/directives/uppercase.directive';

// Services
import { ArbitrosService } from 'src/app/services/admin/arbitros.service';
import Swal from 'sweetalert2';
import { Arbitro } from 'src/app/interfaces/usuario.interface';

// Components
import { ArbitrosFormComponent } from './arbitros-form/arbitros-form.component';

@Component({
  selector: 'app-arbitros',
  imports: [CommonModule, DatePipe, FormsModule, UppercaseDirective, ArbitrosFormComponent],
  templateUrl: './arbitros.component.html',
  styles: ``
})
export class ArbitrosComponent implements OnInit {

  // Arbitros
  arbitros: any = [DatePipe, FormsModule, CommonModule, UppercaseDirective];
  arbitro_id: number | null = null;
  isLoading = false;

  modoEdicion = false;
  mostrarModal = false;
  mostrarModalInfo = false;
  arbitroSeleccionado: any | null = null;

  searchTimeout: any;

  // Search
  nombreBusqueda: string = '';
  dniBusqueda: string = '';

  // Paginación
  page = 1;
  limit = 5;
  totalItems = 0;
  totalPages = 0;
  currentPage = 1;

  pageSizeOptions = [5, 10, 20, 50];


  constructor(private arbitrosService: ArbitrosService
  ) { }


  ngOnInit(): void {
    this.getArbitrosPaginated();
  }

  // Methods

  // - Arbitros paginated
  getArbitrosPaginated() {
    this.isLoading = true;

    this.arbitrosService.getArbitrosPaginated({
      page: this.page,
      limit: this.limit,
      search: this.nombreBusqueda?.trim() || undefined,
      disponible: this.dniBusqueda ? (this.dniBusqueda === 'true' ? 'true' : 'false') : undefined
    }
    ).subscribe({
      next: (res) => {

        this.arbitros = res.data;
        this.totalItems = res.total;
        this.currentPage = res.page;

        this.totalPages = res.totalPages

        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // - Buscador
  onSearchChange() {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      this.page = 1;
      this.getArbitrosPaginated();
    }, 300);
  }

  // - Eliminar arbitro
  eliminarArbitro(arbitro: any) {
    Swal.fire({
      title: '¿Eliminar arbitro?',
      text: `Se eliminará el arbitro ${arbitro.usuario.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {

      if (result.isConfirmed) {

        this.arbitrosService.deleteArbitro(arbitro.id)
          .subscribe({
            next: (resp) => {

              Swal.fire({
                icon: 'success',
                title: 'Arbitro eliminado',
                text: resp.message,
                timer: 2000,
                showConfirmButton: false
              });

              this.getArbitrosPaginated();
            },
            error: (err) => {

              console.error(err);

              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el arbitro'
              });

            }
          });

      }

    });
  }

  // - Editar arbitro
  editarArbitro(arbitro: any) {
    this.modoEdicion = true;
    this.arbitroSeleccionado = { ...arbitro };
    this.mostrarModal = true;
  }

  // - Ver arbitro
  verArbitro(arbitro: Arbitro) {
    this.arbitro_id = arbitro.id_arbitro;
    this.mostrarModalInfo = true;
  }


  // Helpers methods
  onPageSizeChange() {
    this.currentPage = 1; // vuelve a la primera página
  }

  onFiltroChange() {
    this.page = 1;
    this.getArbitrosPaginated();
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPages) return;
    this.page = nuevaPagina;
    this.getArbitrosPaginated();
  }

  cambiarLimite() {
    this.limit = Number(this.limit);
    this.page = 1;
    this.getArbitrosPaginated();
  }

  soloNumeros(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  // - Modales
  abrirModal() {
    this.modoEdicion = false;
    this.arbitroSeleccionado = null;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.modoEdicion = false;
    this.arbitroSeleccionado = null;
  }

  cerrarModalInfo() {
    this.mostrarModalInfo = false;
    this.arbitro_id = null;
  }
}
