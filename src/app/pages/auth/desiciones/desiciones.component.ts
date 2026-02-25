import { Component } from '@angular/core';


interface Desiciones {
  id: number;
  contratista: string;
  entidad: string;
  controversia: string;
  enlaceLaudo: string;
}


@Component({
  selector: 'app-desiciones.component',
  imports: [],
  templateUrl: './desiciones.component.html',
})
export class DesicionesComponent {

  totalLaudos = 120; // Número total (puede venir del backend)
  laudosPorPagina = 10;
  paginaActual = 1;
  desiciones: Desiciones[] = [];


  constructor() { }

  ngOnInit(): void {
    this.cargarDesicionesDePrueba();
  }

  cargarDesicionesDePrueba() {
    this.desiciones = [
      // {
      //   id: 1,
      //   contratista: '',
      //   entidad: '',
      //   controversia: '',
      //   enlaceLaudo: '',
      // },
      // {
      //   id: 2,
      //   contratista: '',
      //   entidad: '',
      //   controversia: '',
      //   enlaceLaudo: '',
      // },

      // {
      //   id: 2,
      //   contratista: 'ALQUETTE',
      //   entidad: 'MINISTERIO DE CULTURA',
      //   controversia: 'EJECUCIÓN Y CUMPLIMIENTO DE ACTA DE COMPROMISO.',
      //   enlaceLaudo: 'https://example.com/laudo2.pdf',
      // },
      // {
      //   id: 3,
      //   contratista: 'CONSORCIO GESTIÓN INTEGRAL DE SANEAMIENTO',
      //   entidad: 'GOBIERNO REGIONAL DE JUNÍN',
      //   controversia: 'PAGOS.',
      //   enlaceLaudo: 'https://example.com/laudo3.pdf',
      // },
      // {
      //   id: 4,
      //   contratista: 'OCHARAN ARANA INGENIEROS S.R.L',
      //   entidad: 'MUNICIPALIDAD DISTRITAL DE CHETILLA',
      //   controversia: 'RESOLUCIÓN DE CONTRATO.',
      //   enlaceLaudo: 'https://example.com/laudo4.pdf',
      // },
      // {
      //   id: 5,
      //   contratista: 'CONSORCIO CRV INGENIEROS',
      //   entidad: 'GOBIERNO REGIONAL DE CAJAMARCA',
      //   controversia: 'RESOLUCIÓN DE CONTRATO.',
      //   enlaceLaudo: 'https://example.com/laudo5.pdf',
      // },
      // {
      //   id: 6,
      //   contratista: 'CONSORCIO IRZA',
      //   entidad: 'GOBIERNO REGIONAL DE CAJAMARCA',
      //   controversia: 'AMPLIACIÓN DE PLAZO.',
      //   enlaceLaudo: 'https://example.com/laudo6.pdf',
      // },
      // {
      //   id: 7,
      //   contratista: 'CONSORCIO MOQUEGUA',
      //   entidad: 'FONDEPES',
      //   controversia: 'RESPONSABILIDAD CONTRACTUAL POR VICIOS OCULTOS.',
      //   enlaceLaudo: 'https://example.com/laudo7.pdf',
      // },
      // {
      //   id: 8,
      //   contratista: 'JAZANI CONSULTORA AMBIENTAL SAC',
      //   entidad: 'MUNICIPALIDAD METROPOLITANA DE LIMA',
      //   controversia: 'RESOLUCIÓN DE CONTRATO.',
      //   enlaceLaudo: 'https://example.com/laudo8.pdf',
      // },
      // {
      //   id: 9,
      //   contratista: 'CONSORCIO MADRE DE DIOS',
      //   entidad: 'GOBIERNO REGIONAL DE MADRE DE DIOS',
      //   controversia: 'RESOLUCIÓN DE CONTRATO.',
      //   enlaceLaudo: 'https://example.com/laudo9.pdf',
      // },
      // {
      //   id: 10,
      //   contratista: 'KENNY VILLALOBOS VEGA',
      //   entidad:
      //     'EMPRESA REGIONAL DE SERVICIO PÚBLICO DE ELECTRICIDAD ELECTRONORTE MEDIO S.A. - HIDRANDINA S.A.',
      //   controversia: 'RESOLUCIÓN DE CONTRATO, PENALIDAD Y OBLIGACIÓN DE PAGO.',
      //   enlaceLaudo: 'https://example.com/laudo10.pdf',
      // },
    ];


  }

  // ===========================================================
  //  Métodos auxiliares
  // ===========================================================
  irAPagina(pagina: number) {
    this.paginaActual = pagina;
    // Aquí podrías hacer la petición HTTP a tu backend:
    // this.laudoService.obtenerPorPagina(pagina).subscribe(...)
  }

  descargarDesicion(enlace: string) {
    window.open(enlace, '_blank');
  }

}
