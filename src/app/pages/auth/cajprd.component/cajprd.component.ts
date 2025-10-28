import { TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-cajprd.component',
  imports: [TitleCasePipe],
  templateUrl: './cajprd.component.html',
})
export class CajprdComponent {


  private baseUrl = 'https://firmalegalordonezterrazas.com'


  // Gestion de archivos
  JPRDFiles = {
    requisitosAdjudicadores: `${this.baseUrl}/JPRD/REQUISITOS%20PARA%20INCORPORARTE%20A%20LA%20N%C3%93MINA%20DE%20ADJUDICADORES%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ.pdf`,
    reglamentoInterno: `${this.baseUrl}/JPRD/REGLAMENTO%20INTERNO%20DEL%20CENTRO.pdf`,
    reglamentoJunta: `${this.baseUrl}/JPRD/REGLAMENTO%20DE%20JUNTA%20DE%20RESOLUCI%C3%93N%20DE%20DISPUTAS%20DEL%20CENTRO%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ.pdf`,
    reglamentoCostos: `${this.baseUrl}/JPRD/Reglamento%20de%20costos-JPRD%20-%20firma%20legal%20ordo%C3%B1ez.pdf`,
    reglamentoConfirmacion: `${this.baseUrl}/JPRD/Reglamento%20de%20confirmacion%20de%20adjudicadores.pdf`,
    estatuto: `${this.baseUrl}/JPRD/ESTATUTO%20DEL%20CENTRO.pdf`,
    codigoEtica: `${this.baseUrl}/JPRD/CODIGO-DE-ETICA-JRD.pdf`,
    clausulaModelo: `${this.baseUrl}/JPRD/CL%C3%81USULA%20MODELO%20DE%20JUNTA%20DE%20PREVENCI%C3%93N%20Y%20RESOLUCI%C3%93N%20DE%20DISPUTAS%20DEL%20CENTRO.pdf`
  }

  get JPRDFilesEntries() {
    return Object.entries(this.JPRDFiles);
  }

}
