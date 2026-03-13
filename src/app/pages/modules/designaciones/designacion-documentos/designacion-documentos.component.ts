import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

// Interface
import { Documento } from '../../solicitudes/solicitud-docs/solicitud-docs.component';

@Component({
  selector: 'designacion-documentos',
  imports: [CommonModule, DatePipe],
  templateUrl: './designacion-documentos.component.html',
  styles: ``
})
export class DesignacionDocumentosComponent {

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
