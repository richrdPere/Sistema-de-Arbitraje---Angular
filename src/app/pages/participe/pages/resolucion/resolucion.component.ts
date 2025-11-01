
import { DatePipe } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-resolucion.component',
  imports: [DatePipe],
  templateUrl: './resolucion.component.html',
})
export class ResolucionComponent implements OnInit {

  resoluciones: any[] = [];
  resolucionesFiltradas: any[] = [];
  loading: boolean = false;
  searchTerm: string = '';

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.cargarResoluciones();
  }

  //  Simula consulta de resoluciones
  cargarResoluciones(): void {
    this.loading = true;

    this.resoluciones = [
      {
        id_resolucion: 1,
        numero_resolucion: '001-2025/JPRD',
        titulo: 'Resolución de Designación',
        descripcion: 'Se designa árbitro principal para el expediente 008-2025/DESIGNACIÓN.',
        fecha_emision: '2025-10-29T00:00:00.000Z',
        estado: 'Emitida',
        documento_pdf: 'resolucion_designacion_001.pdf'
      },
      {
        id_resolucion: 2,
        numero_resolucion: '002-2025/JPRD',
        titulo: 'Resolución de Ampliación de Plazo',
        descripcion: 'Se amplía el plazo para presentación de pruebas documentales.',
        fecha_emision: '2025-11-05T00:00:00.000Z',
        estado: 'Pendiente',
        documento_pdf: 'resolucion_ampliacion_002.pdf'
      },
      {
        id_resolucion: 3,
        numero_resolucion: '003-2025/JPRD',
        titulo: 'Resolución de Archivo',
        descripcion: 'El expediente se archiva por desistimiento de las partes.',
        fecha_emision: '2025-11-10T00:00:00.000Z',
        estado: 'Archivada',
        documento_pdf: 'resolucion_archivo_003.pdf'
      }
    ];

    this.resolucionesFiltradas = [...this.resoluciones];
    this.loading = false;
    // setTimeout(() => {

    // }, 1000);
  }

  //  Filtra por cualquier texto (número, título, estado, etc.)
  filtrarResoluciones(): void {
    const term = this.searchTerm.toLowerCase();

    this.resolucionesFiltradas = this.resoluciones.filter(res =>
      res.numero_resolucion.toLowerCase().includes(term) ||
      res.titulo.toLowerCase().includes(term) ||
      res.descripcion.toLowerCase().includes(term) ||
      res.estado.toLowerCase().includes(term)
    );
  }

  //  Simula ver documento PDF
  verDocumento(resolucion: any): void {
    alert(`Abriendo documento: ${resolucion.documento_pdf}`);
  }

}
