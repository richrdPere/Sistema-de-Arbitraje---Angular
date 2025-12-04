import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

// Pipes
import { SepararPalabrasPipe } from 'src/app/pipes/separar-palabras.pipe';

@Component({
  selector: 'app-cajprd.component',
  imports: [CommonModule, SepararPalabrasPipe, RouterModule],
  templateUrl: './cajprd.component.html',
})
export class CajprdComponent {


  private baseUrl = 'https://firmalegalordonezterrazas.com'
  // En tu component.ts
  filteredEntries: [string, string][] = [];

  // Convertir objetos en arrays clave-valor
  get arbitrajeEntries() {
    return Object.entries(this.arbitrajeFiles);
  }

  ngOnInit() {
    this.filteredEntries = [...this.arbitrajeEntries];
  }

  filterDocuments(searchTerm: string) {
    if (!searchTerm) {
      this.filteredEntries = [...this.arbitrajeEntries];
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredEntries = this.arbitrajeEntries.filter(([fileName]) =>
      fileName.toLowerCase().includes(term)
    );
  }

  filterByCategory(category: string) {
    if (!category) {
      this.filteredEntries = [...this.arbitrajeEntries];
      return;
    }

    this.filteredEntries = this.arbitrajeEntries.filter(([fileName]) =>
      this.getDocumentCategory(fileName) === category
    );
  }

  getFileType(fileUrl: string): string {
    if (fileUrl.toLowerCase().endsWith('.pdf')) return 'PDF';
    if (fileUrl.toLowerCase().endsWith('.docx')) return 'DOCX';
    if (fileUrl.toLowerCase().endsWith('.doc')) return 'DOC';
    return 'Archivo';
  }

  getFileSize(file: [string, string]): string {
    // Puedes implementar lógica para obtener el tamaño real del archivo
    // Por ahora devolvemos un placeholder
    return '~500 KB';
  }

  getDocumentCategory(fileName: string): string {
    const name = fileName.toLowerCase();
    if (name.includes('reglamento')) return 'reglamento';
    if (name.includes('ética') || name.includes('etica')) return 'etica';
    if (name.includes('procedimiento')) return 'procedimiento';
    if (name.includes('formato')) return 'formato';
    return '';
  }

  // Archivos de Arbitraje
  arbitrajeFiles = {
    reglamentoInternoArbitraje: 'https://firmalegalordonezterrazas.com/JPRD/REGLAMENTO INTERNO DEL CENTRO DE ARBITRAJE - FIRMA LEGAL ORDOÑEZ 3.0.pdf',
    codigoDeEtica: 'https://firmalegalordonezterrazas.com/JPRD/REGLAMENTO DEL CODIGO DE ETICA - FIRMA LEGAL ORDOÑEZ 3.0.pdf',
    procedimientoDeIncorporacionDeAdjudicadores: `${this.baseUrl}/JPRD/REQUISITOS PARA INCORPORARTE A LA NÓMINA DE ADJUDICADORES - FIRMA LEGAL ORDOÑEZ 1.0.pdf`,
    reglamentoInterno: `${this.baseUrl}/JPRD/REGLAMENTO%20INTERNO%20DEL%20CENTRO.pdf`,
    reglamentoJunta: `${this.baseUrl}/JPRD/REGLAMENTO%20DE%20JUNTA%20DE%20RESOLUCI%C3%93N%20DE%20DISPUTAS%20DEL%20CENTRO%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ.pdf`,
    reglamentoCostos: `${this.baseUrl}/JPRD/Reglamento%20de%20costos-JPRD%20-%20firma%20legal%20ordo%C3%B1ez.pdf`,
    formulaAplicableDeCostos: `${this.baseUrl}/JPRD/FORMULA APLICABLE 2.0.pdf`,
    reglamentoConfirmacion: `${this.baseUrl}/JPRD/Reglamento%20de%20confirmacion%20de%20adjudicadores.pdf`,
    estatuto: `${this.baseUrl}/JPRD/ESTATUTO%20DEL%20CENTRO.pdf`,
    codigoEtica: `${this.baseUrl}/JPRD/CODIGO-DE-ETICA-JRD.pdf`,
    clausulaModelo: `${this.baseUrl}/JPRD/CL%C3%81USULA%20MODELO%20DE%20JUNTA%20DE%20PREVENCI%C3%93N%20Y%20RESOLUCI%C3%93N%20DE%20DISPUTAS%20DEL%20CENTRO.pdf`,

  };



  // Gestion de archivos
  // JPRDFiles = {
  //   requisitosAdjudicadores: `${this.baseUrl}/JPRD/REQUISITOS%20PARA%20INCORPORARTE%20A%20LA%20N%C3%93MINA%20DE%20ADJUDICADORES%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ.pdf`,
  //   reglamentoInterno: `${this.baseUrl}/JPRD/REGLAMENTO%20INTERNO%20DEL%20CENTRO.pdf`,
  //   reglamentoJunta: `${this.baseUrl}/JPRD/REGLAMENTO%20DE%20JUNTA%20DE%20RESOLUCI%C3%93N%20DE%20DISPUTAS%20DEL%20CENTRO%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ.pdf`,
  //   reglamentoCostos: `${this.baseUrl}/JPRD/Reglamento%20de%20costos-JPRD%20-%20firma%20legal%20ordo%C3%B1ez.pdf`,
  //   reglamentoConfirmacion: `${this.baseUrl}/JPRD/Reglamento%20de%20confirmacion%20de%20adjudicadores.pdf`,
  //   estatuto: `${this.baseUrl}/JPRD/ESTATUTO%20DEL%20CENTRO.pdf`,
  //   codigoEtica: `${this.baseUrl}/JPRD/CODIGO-DE-ETICA-JRD.pdf`,
  //   clausulaModelo: `${this.baseUrl}/JPRD/CL%C3%81USULA%20MODELO%20DE%20JUNTA%20DE%20PREVENCI%C3%93N%20Y%20RESOLUCI%C3%93N%20DE%20DISPUTAS%20DEL%20CENTRO.pdf`
  // }

  // get JPRDFilesEntries() {
  //   return Object.entries(this.JPRDFiles);
  // }

}
