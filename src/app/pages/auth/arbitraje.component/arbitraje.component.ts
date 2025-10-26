import { TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-arbitraje.component',
  imports: [TitleCasePipe],
  templateUrl: './arbitraje.component.html',
})
export class ArbitrajeComponent {
  // Archivos de Arbitraje
  arbitrajeFiles = {
    requisitosArbitros: 'https://firmalegalordonezterrazas.com/ARBITRAJE/REQUISITOS%20PARA%20INCORPORARTE%20A%20LA%20N%C3%93MINA%20DE%20%C3%81RBITROS%20DEL%20CENTRO%20DE%20ARBITRAJE%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ.pdf',
    reglamentoProcesal: 'https://firmalegalordonezterrazas.com/ARBITRAJE/REGLAMENTO%20PROCESAL%20DE%20ARBITRAJE%20DEL%20CENTRO%20DE%20ARBITRAJE%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ.pdf',
    reglamentoInternoArbitraje: 'https://firmalegalordonezterrazas.com/ARBITRAJE/REGLAMENTO%20INTERNO%20DEL%20CENTRO%20DE%20ARBITRAJE%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ.pdf',
    reglamentoEtica: 'https://firmalegalordonezterrazas.com/ARBITRAJE/REGLAMENTO%20DEL%20CODIGO%20DE%20ETICA%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ.pdf',
    reglamentoCostosArbitraje: 'https://firmalegalordonezterrazas.com/ARBITRAJE/REGLAMENTO%20DE%20COSTOS%20ADMINISTRATIVOS%2C%20HONORARIOS%20DE%20%C3%81RBITROS%20Y%20DEVOLUCI%C3%93N%20DE%20HONORARIOS%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ%20-%20CHAMBI.pdf',
    reglamentoConfirmacionArbitros: 'https://firmalegalordonezterrazas.com/ARBITRAJE/REGLAMENTO%20DE%20CONFIRMACI%C3%93N%20DE%20%C3%81RBITROS%20DEL%20CENTRO%20DE%20ARBITRAJE%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ%20-%20CHAMBI.pdf',
    estatutoArbitraje: 'https://firmalegalordonezterrazas.com/ARBITRAJE/ESTATUTO%20-%20centro%20de%20arbitraje%20-%20firma%20legal.pdf',
    clausulaArbitral: 'https://firmalegalordonezterrazas.com/ARBITRAJE/CL%C3%81USULA%20ARBITRAL%20PARA%20INSERTAR%20EN%20LOS%20CONTRATOS%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ.pdf'
  };

  // Archivos de JPRD
  jprdFiles = {
    requisitosAdjudicadores: 'https://firmalegalordonezterrazas.com/JPRD/REQUISITOS%20PARA%20INCORPORARTE%20A%20LA%20N%C3%93MINA%20DE%20ADJUDICADORES%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ.pdf',
    reglamentoInterno: 'https://firmalegalordonezterrazas.com/JPRD/REGLAMENTO%20INTERNO%20DEL%20CENTRO.pdf',
    reglamentoJunta: 'https://firmalegalordonezterrazas.com/JPRD/REGLAMENTO%20DE%20JUNTA%20DE%20RESOLUCI%C3%93N%20DE%20DISPUTAS%20DEL%20CENTRO%20-%20FIRMA%20LEGAL%20ORDO%C3%91EZ.pdf',
    reglamentoCostos: 'https://firmalegalordonezterrazas.com/JPRD/Reglamento%20de%20costos-JPRD%20-%20firma%20legal%20ordo%C3%B1ez.pdf',
    reglamentoConfirmacion: 'https://firmalegalordonezterrazas.com/JPRD/Reglamento%20de%20confirmacion%20de%20adjudicadores.pdf',
    estatuto: 'https://firmalegalordonezterrazas.com/JPRD/ESTATUTO%20DEL%20CENTRO.pdf',
    codigoEtica: 'https://firmalegalordonezterrazas.com/JPRD/CODIGO-DE-ETICA-JRD.pdf',
    clausulaModelo: 'https://firmalegalordonezterrazas.com/JPRD/CL%C3%81USULA%20MODELO%20DE%20JUNTA%20DE%20PREVENCI%C3%93N%20Y%20RESOLUCI%C3%93N%20DE%20DISPUTAS%20DEL%20CENTRO.pdf'
  };

  // Convertir objetos en arrays clave-valor
  get arbitrajeEntries() {
    return Object.entries(this.arbitrajeFiles);
  }

  get jprdEntries() {
    return Object.entries(this.jprdFiles);
  }
}
