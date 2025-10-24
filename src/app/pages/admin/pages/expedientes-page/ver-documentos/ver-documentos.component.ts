import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Service
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';
import { SubirDocumentoComponent } from "./subir-documento.component/subir-documento.component";

@Component({
  selector: 'app-ver-documentos',
  imports: [DatePipe, SubirDocumentoComponent],
  templateUrl: './ver-documentos.component.html',
})
export class VerDocumentosComponent implements OnInit {

  idExpediente!: number;
  documentos: any[] = [];
  loading = true;
  mensajeError = '';
  mensajeExito = '';
  mostrarModal = false;

  mostrarModalDocumento = false;
  expedienteSeleccionadoId!: number;

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

  abrirModalDocumento(id: number) {
    this.expedienteSeleccionadoId = id;
    this.mostrarModalDocumento = true;
  }

  cerrarModalDocumento() {
    this.mostrarModalDocumento = false;
  }

  volver() {
    this.router.navigate(['/admin/expedientes']);
  }
}
