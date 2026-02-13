import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Service
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';
import { DocumentoService } from 'src/app/services/documento.service';

@Component({
  selector: 'app-documentos',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './documentos.component.html',
  styles: ``
})
export class DocumentosComponent {

  idExpediente!: number;
  documentos: any[] = [];
  loading = true;

  mostrarModal = false;

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
    this.idExpediente = Number(this.route.snapshot.paramMap.get('id'));

    this.cargarDocumentos();
  }

  cargarDocumentos() {
    this.expedienteService.listarDocumentos(this.idExpediente).subscribe({
      next: (data) => {
        this.documentos = data;

        console.log("DOCUMENTOS: ", this.documentos)
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

  volver() {
    this.router.navigate(['/app/trazabilidad']);
  }

  verDocumento(doc: any) {
    if (!doc?.url_s3) {
      console.warn("No existe un archivo en este registro");
      return;
    }

    const url = doc.url_s3; // debe ser un link válido (https://...)
    window.open(url, "_blank");
  }

}
