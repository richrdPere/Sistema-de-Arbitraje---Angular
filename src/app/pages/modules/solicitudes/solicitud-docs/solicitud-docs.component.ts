import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

export interface Documento {
  id_documento: number;
  titulo: string;
  descripcion?: string;
  tipo_documento: string;
  tipo_archivo: string;
  url_s3?: string;
  url_drive?: string;
  fecha_subida: string;
}

@Component({
  selector: 'solicitud-docs',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './solicitud-docs.component.html',
  styles: ``
})
export class SolicitudDocsComponent {

  @Input() mostrarModal = false;
  @Input() documentos: Documento[] = [];

  @Output() modalCerrado = new EventEmitter<void>();

  verDocumento(doc: Documento) {
    const url = doc.url_s3 || doc.url_drive;
    if (!url) {
      alert('El documento no tiene URL disponible');
      return;
    }
    window.open(url, '_blank');
  }

  descargarDocumento(doc: Documento) {
    const url = doc.url_s3 || doc.url_drive;
    if (!url) return;
    window.open(url, '_blank');
  }


  //  Cerrar el modal
  cerrarModal(): void {
    this.mostrarModal = false;
    this.modalCerrado.emit();
    // this.formExpediente.reset();
  }

}
