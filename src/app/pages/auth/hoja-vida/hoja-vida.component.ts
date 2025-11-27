import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hoja-vida.component',
  imports: [],
  templateUrl: './hoja-vida.component.html',
})
export class HojaVidaComponent implements OnInit {
  consejero: any;

  constructor(private router: Router) { }

  ngOnInit() {
    // Datos de prueba para un consejero
    this.consejero = {
      nombre: 'Dr. Luis Fernando Ordoñez Chambi',
      cargo: 'Presidente del Consejo Superior',
      dni: '44353475',
      periodo: '2025-2027',
      correo: 'lordonez@firmalegalordonezterrazas.com',
      telefono: '(01) 234-5678',

      formacion: {
        titulo: 'Abogado',
        universidad: 'Universidad Nacional Mayor de San Marcos',
        ano: '2005',
        posgrado: 'Maestría en Derecho Civil y Comercial',
        institucionPosgrado: 'Pontificia Universidad Católica del Perú',
        anoPosgrado: '2008'
      },

      experiencia: [
        {
          cargo: 'Socio Fundador',
          empresa: 'Firma Legal Ordoñez - Chambi - Terrazas - Herrera',
          periodo: '2015 - Presente',
          descripcion: 'Dirección de área de arbitraje y resolución de disputas'
        },
        {
          cargo: 'Árbitro Principal',
          empresa: 'Centro de Arbitraje de la Cámara de Comercio de Lima',
          periodo: '2010 - 2015',
          descripcion: 'Árbitro en controversias contractuales y comerciales'
        },
        {
          cargo: 'Asesor Legal',
          empresa: 'Ministerio de Justicia y Derechos Humanos',
          periodo: '2006 - 2010',
          descripcion: 'Asesoría en reforma procesal y métodos alternativos de solución de conflictos'
        }
      ],

      especialidades: [
        'Arbitraje Comercial',
        'Contratación Pública',
        'Derecho Civil',
        'Derecho Administrativo',
        'Resolución de Disputas',
        'Derecho Contractual'
      ],

      publicaciones: [
        {
          titulo: 'El Arbitraje en la Contratación Pública Peruana',
          descripcion: 'Análisis de la aplicación del arbitraje institucional en contratos del Estado',
          ano: '2023',
          tipo: 'Artículo'
        },
        {
          titulo: 'Manual de Procedimiento Arbitral',
          descripcion: 'Guía práctica para la administración de procedimientos arbitrales',
          ano: '2021',
          tipo: 'Libro'
        },
        {
          titulo: 'Ética y Transparencia en el Arbitraje',
          descripcion: 'Estudio sobre los principios éticos aplicables a árbitros y consejeros',
          ano: '2019',
          tipo: 'Investigación'
        }
      ],

      idiomas: [
        { idioma: 'Español', nivel: 5, nivelTexto: 'nativo' },
        { idioma: 'Inglés', nivel: 4, nivelTexto: 'avanzado' },
        { idioma: 'Portugués', nivel: 3, nivelTexto: 'intermedio' }
      ],

      informacionAdicional: {
        colegiatura: 'Colegio de Abogados de Lima - N° 12345',
        experiencia: '18',
        estadoEtico: 'Sin observaciones',
        actualizacion: '15 de Noviembre, 2025'
      }
    };
  }

  volverAlConsejo() {
    this.router.navigate(['/arbitraje']);
  }
}
