import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Service
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';
import { SubirDocumentosComponent } from "./subir-documentos/subir-documentos.component";
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-ver-documentos',
  imports: [CommonModule, FormsModule, DatePipe, SubirDocumentosComponent],
  templateUrl: './ver-documentos.component.html',
})
export class VerDocumentosComponent implements OnInit {

  idExpediente!: number;
  documentos: any[] = [];
  loading = true;
  mensajeError = '';
  mensajeExito = '';

  mostrarModal = false;
  expedienteSeleccionadoId!: number;

  // Paginado
  page = 1;
  limit = 5;
  totalItems = 0;
  totalPages = 0;
  currentPage = 1;

  pageSizeOptions = [5, 10, 20, 50];

  // Search
  search: string = '';
  rolFiltro: string = '';

  constructor(
    private route: ActivatedRoute,
    private expedienteService: ExpedientesService,
    private router: Router
  ) { }


  ngOnInit(): void {
    this.idExpediente = Number(this.route.snapshot.paramMap.get('id'));

    this.cargarDocumentos();
  }

  cargarDocumentos() {
    this.expedienteService.listarDocumentos(this.idExpediente).subscribe({
      next: (data) => {
        this.documentos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar documentos', err);
        this.loading = false;
      },
    });
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPages) return;
    this.page = nuevaPagina;
    this.cargarDocumentos();
  }

  cambiarLimite() {
    this.limit = Number(this.limit);
    this.page = 1;
    this.cargarDocumentos();
  }


  onFiltroChange() {
    throw new Error('Method not implemented.');
  }
  abrirModal() {
    this.mostrarModal = true;
    // this.expedienteSeleccionadoId = id;
    this.mostrarModal = true;
  }


  abrirModalDocumento(id: number) {
    this.expedienteSeleccionadoId = id;
    this.mostrarModal = true;
  }

  cerrarModalDocumento() {
    this.mostrarModal = false;
    this.mostrarModal = false;
  }

  volver() {
    this.router.navigate(['/app/expedientes']);
  }



  eliminarDocumento(id: any) {
    throw new Error('Method not implemented.');
  }
  verDocumento(doc: any) {
    throw new Error('Method not implemented.');
  }
}
