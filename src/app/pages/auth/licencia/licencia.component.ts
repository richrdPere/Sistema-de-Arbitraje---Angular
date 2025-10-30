import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

// Pipes
import { SepararPalabrasPipe } from 'src/app/pipes/separar-palabras.pipe';

@Component({
  selector: 'app-licencia.component',
  imports: [CommonModule, SepararPalabrasPipe, RouterModule],
  templateUrl: './licencia.component.html',
})
export class LicenciaComponent {

  private baseUrl = 'https://firmalegalordonezterrazas.com'


  // NUEVO: Método para documentos varios
  getOtrosDocumentos() {
    return {
      vigenciaPoder: `${this.baseUrl}/otros%20documentos/Vigencia%20de%20poder.pdf`,
      licenciaFuncionamiento: `${this.baseUrl}/otros%20documentos/licencia%20de%20funcionamiento.jpg`,
      inscripcionRRPP: `${this.baseUrl}/otros%20documentos/INSCRIPCION_A_RRPP[1].pdf`,
      fichaRUC: `${this.baseUrl}/otros%20documentos/FICHA_RUC.pdf`,
      cirSunat1: `${this.baseUrl}/otros%20documentos/CIR-SUNAT.jpg`,
      cirSunat2: `${this.baseUrl}/otros%20documentos/CIR-SUNAT2.jpg`,
      anotacionInscripcion: `${this.baseUrl}/otros%20documentos/anotacion%20de%20inscripcion.jpg`
    };
  }

  // NUEVO: Método para árbitros
  getArbitrosFiles() {
    return {
      cvJulioRicardo: `${this.baseUrl}/arbitros/CV%20Julio%20Ricardo%202025.pdf`,
      fotoJulioRicardo: `${this.baseUrl}/arbitros/Julio%20Ricardo.jpg`,
      fotoFernandoOrdonez: `${this.baseUrl}/arbitros/fernando%20ordonez.jpg`
    };
  }

  //  Getters para usar fácilmente en el template
  get otrosDocumentosEntries() {
    return Object.entries(this.getOtrosDocumentos());
  }

  get arbitrosEntries() {
    return Object.entries(this.getArbitrosFiles());
  }


  // Métodos utilitarios
  openFile(url: string): void {
    window.open(url, '_blank');
  }

  downloadFile(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.click();
  }

  // NUEVO: Método para obtener todos los archivos organizados
  getAllFiles() {
    return {
      otrosDocumentos: this.getOtrosDocumentos(),
      arbitros: this.getArbitrosFiles()
    };
  }

}
