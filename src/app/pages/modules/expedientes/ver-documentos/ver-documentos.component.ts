import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubirDocumentosComponent } from "./subir-documentos/subir-documentos.component";
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

// Service
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';
import { DocumentoService } from 'src/app/services/documento.service';


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
  numeroExpediente: string | null = null;

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
    private documentoService: DocumentoService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));

      if (!id) return;

      this.idExpediente = id;

      this.cargarDatosExpediente();
      this.cargarDocumentos();
    });
  }

  cargarDatosExpediente() {
    this.expedienteService.obtenerExpedientePorId(this.idExpediente)
      .subscribe({
        next: (exp) => {

          console.log("exp:", exp);
          console.log("numero:", exp.numero_expediente);

          this.numeroExpediente = exp.numero_expediente;
        },
        error: () => {
          this.numeroExpediente = 'No disponible';
        }
      });
  }

  cargarDocumentos() {
    this.expedienteService.listarDocumentos(this.idExpediente).subscribe({
      next: (data) => {
        this.documentos = data;
        this.loading = false;
      },
      error: (err) => {
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
    Swal.fire({
      title: '¿Eliminar documento?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
    }).then(result => {
      if (result.isConfirmed) {
        this.documentoService.eliminarDocumento(id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Documento eliminado correctamente' });
            this.cargarDocumentos();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error al eliminar documento',
              text: err.error?.message || 'Error inesperado',
            });
          },
        });
      }
    });
  }

  verDocumento(doc: any) {
    if (!doc?.url_s3) {

      return;
    }

    const url = doc.url_s3; // debe ser un link válido (https://...)
    window.open(url, "_blank");
  }
}
