import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

// Pipes
import { SepararPalabrasPipe } from 'src/app/pipes/separar-palabras.pipe';

@Component({
  selector: 'app-arbitraje.component',
  standalone: true,
  imports: [CommonModule, SepararPalabrasPipe, RouterModule],
  templateUrl: './arbitraje.component.html',
})
export class ArbitrajeComponent {
  private baseUrl = 'https://firmalegalordonezterrazas.com'

  // En tu component.ts
  filteredEntries: [string, string][] = [];

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
    requisitosArbitros: 'https://firmalegalordonezterrazas.com/ARBITRAJE/REQUISITOS PARA INCORPORARTE A LA NÓMINA DE ÁRBITROS DEL CENTRO DE ARBITRAJE - FIRMA LEGAL ORDOÑEZ 1.01.pdf',
    reglamentoProcesal: 'https://firmalegalordonezterrazas.com/ARBITRAJE/REGLAMENTO%20PROCESAL%20DE%20ARBITRAJE%20DEL%20CENTRO%20DE%20ARBITRAJE%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ.pdf',
    reglamentoCostosArbitraje: 'https://firmalegalordonezterrazas.com/ARBITRAJE/REGLAMENTO%20DE%20COSTOS%20ADMINISTRATIVOS%2C%20HONORARIOS%20DE%20%C3%81RBITROS%20Y%20DEVOLUCI%C3%93N%20DE%20HONORARIOS%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ%20-%20CHAMBI.pdf',
    reglamentoConfirmacionArbitros: 'https://firmalegalordonezterrazas.com/ARBITRAJE/REGLAMENTO%20DE%20CONFIRMACI%C3%93N%20DE%20%C3%81RBITROS%20DEL%20CENTRO%20DE%20ARBITRAJE%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ%20-%20CHAMBI.pdf',
    estatutoArbitraje: 'https://firmalegalordonezterrazas.com/ARBITRAJE/ESTATUTO%20-%20centro%20de%20arbitraje%20-%20firma%20legal.pdf',
    clausulaArbitral: 'https://firmalegalordonezterrazas.com/ARBITRAJE/CL%C3%81USULA%20ARBITRAL%20PARA%20INSERTAR%20EN%20LOS%20CONTRATOS%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ.pdf'
  };

  // // Archivos de JPRD
  // jprdFiles = {
  //   requisitosAdjudicadores: 'https://firmalegalordonezterrazas.com/JPRD/REQUISITOS%20PARA%20INCORPORARTE%20A%20LA%20N%C3%93MINA%20DE%20ADJUDICADORES%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ.pdf',
  //   reglamentoInterno: 'https://firmalegalordonezterrazas.com/JPRD/REGLAMENTO%20INTERNO%20DEL%20CENTRO.pdf',
  //   reglamentoJunta: 'https://firmalegalordonezterrazas.com/JPRD/REGLAMENTO%20DE%20JUNTA%20DE%20RESOLUCI%C3%93N%20DE%20DISPUTAS%20DEL%20CENTRO%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ.pdf',
  //   reglamentoCostos: 'https://firmalegalordonezterrazas.com/JPRD/Reglamento%20de%20costos-JPRD%20-%20firma%20legal%20ordo%C3%B1ez.pdf',
  //   reglamentoConfirmacion: 'https://firmalegalordonezterrazas.com/JPRD/Reglamento%20de%20confirmacion%20de%20adjudicadores.pdf',
  //   estatuto: 'https://firmalegalordonezterrazas.com/JPRD/ESTATUTO%20DEL%20CENTRO.pdf',
  //   codigoEtica: 'https://firmalegalordonezterrazas.com/JPRD/CODIGO-DE-ETICA-JRD.pdf',
  //   clausulaModelo: 'https://firmalegalordonezterrazas.com/JPRD/CL%C3%81USULA%20MODELO%20DE%20JUNTA%20DE%20PREVENCI%C3%93N%20Y%20RESOLUCI%C3%93N%20DE%20DISPUTAS%20DEL%20CENTRO.pdf'
  // };

  // // Gestion de archivos
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

  // // Arbitrajes Files
  // ArbitrajeFiles = {
  //   requisitosArbitros: `${this.baseUrl}/ARBITRAJE/REQUISITOS%20PARA%20INCORPORARTE%20A%20LA%20N%C3%93MINA%20DE%20%C3%81RBITROS%20DEL%20CENTRO%20DE%20ARBITRAJE%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ.pdf`,
  //   reglamentoProcesal: `${this.baseUrl}/ARBITRAJE/REGLAMENTO%20PROCESAL%20DE%20ARBITRAJE%20DEL%20CENTRO%20DE%20ARBITRAJE%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ.pdf`,
  //   // reglamentoInternoArbitraje: `${this.baseUrl}/ARBITRAJE/REGLAMENTO%20INTERNO%20DEL%20CENTRO%20DE%20ARBITRAJE%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ.pdf`,
  //   // reglamentoEtica: `${this.baseUrl}/ARBITRAJE/REGLAMENTO%20DEL%20CODIGO%20DE%20ETICA%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ.pdf`,
  //   reglamentoCostosArbitraje: `${this.baseUrl}/ARBITRAJE/REGLAMENTO%20DE%20COSTOS%20ADMINISTRATIVOS%2C%20HONORARIOS%20DE%20%C3%81RBITROS%20Y%20DEVOLUCI%C3%93N%20DE%20HONORARIOS%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ%20-%20CHAMBI.pdf`,
  //   reglamentoConfirmacionArbitros: `${this.baseUrl}/ARBITRAJE/REGLAMENTO%20DE%20CONFIRMACI%C3%93N%20DE%20%C3%81RBITROS%20DEL%20CENTRO%20DE%20ARBITRAJE%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ%20-%20CHAMBI.pdf`,
  //   estatutoArbitraje: `${this.baseUrl}/ARBITRAJE/ESTATUTO%20-%20centro%20de%20arbitraje%20-%20firma%20legal.pdf`,
  //   clausulaArbitral: `${this.baseUrl}/ARBITRAJE/CL%C3%81USULA%20ARBITRAL%20PARA%20INSERTAR%20EN%20LOS%20CONTRATOS%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ.pdf`
  // }
  // Convertir objetos en arrays clave-valor
  get arbitrajeEntries() {
    return Object.entries(this.arbitrajeFiles);
  }

  // get jprdEntries() {
  //   return Object.entries(this.jprdFiles);
  // }

  // get JPRDFilesEntries() {
  //   return Object.entries(this.JPRDFiles);
  // }

  get arbitrajeFilesEntries() {
    return Object.entries(this.arbitrajeFiles);
  }


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

}
