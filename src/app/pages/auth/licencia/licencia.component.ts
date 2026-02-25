import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Pipes
import { SepararPalabrasPipe } from 'src/app/pipes/separar-palabras.pipe';

@Component({
  selector: 'app-licencia.component',
  imports: [CommonModule, SepararPalabrasPipe, RouterModule, FormsModule],
  templateUrl: './licencia.component.html',
})
export class LicenciaComponent {

  private baseUrl = 'https://firmalegalordonezterrazas.com'

  filtroArbitros: string = '';
  filtroEspecialidad: string = '';
  filtroSecretarios: string = '';
  filtroSede: string = '';

  documentosFiltrados: [string, string][] = [];
  ultimaActualizacion: string = '15 de Noviembre, 2025';

  // Datos de prueba para secretarios arbitrales
  secretarios: any[] = [
    {
      id: 1,
      nombre: 'Lic. María Elena Santos Rodríguez',
      cargo: 'Secretaria Arbitral Principal',
      sede: 'Lima',
      correo: 'msantos@firmalegalordonezterrazas.com',
      experiencia: 8,
      especialidades: ['Arbitraje Comercial', 'Contrataciones Públicas', 'Derecho Civil'],
      idiomas: ['Español', 'Inglés', 'Francés'],
      disponibilidad: 'Tiempo completo',
      casosAtendidos: 45
    },
    {
      id: 2,
      nombre: 'Lic. Roberto Carlos Mendoza López',
      cargo: 'Secretario Arbitral Senior',
      sede: 'Arequipa',
      correo: 'rmendoza@firmalegalordonezterrazas.com',
      experiencia: 6,
      especialidades: ['Arbitraje de Inversión', 'Derecho Administrativo'],
      idiomas: ['Español', 'Inglés'],
      disponibilidad: 'Tiempo completo',
      casosAtendidos: 32
    },
    {
      id: 3,
      nombre: 'Lic. Ana Patricia Gutierrez Torres',
      cargo: 'Secretaria Arbitral',
      sede: 'Lima',
      correo: 'agutierrez@firmalegalordonezterrazas.com',
      experiencia: 4,
      especialidades: ['Derecho Comercial', 'Contratos Internacionales'],
      idiomas: ['Español', 'Inglés', 'Portugués'],
      disponibilidad: 'Tiempo completo',
      casosAtendidos: 28
    },
    {
      id: 4,
      nombre: 'Lic. Javier Alejandro Ruiz Paredes',
      cargo: 'Secretario Arbitral',
      sede: 'Trujillo',
      correo: 'jruiz@firmalegalordonezterrazas.com',
      experiencia: 5,
      especialidades: ['Derecho Civil', 'Arbitraje Comercial'],
      idiomas: ['Español', 'Inglés'],
      disponibilidad: 'Tiempo completo',
      casosAtendidos: 35
    },
    {
      id: 5,
      nombre: 'Lic. Sofia Alejandra Castro Díaz',
      cargo: 'Secretaria Arbitral Junior',
      sede: 'Cusco',
      correo: 'scastro@firmalegalordonezterrazas.com',
      experiencia: 2,
      especialidades: ['Derecho Administrativo', 'Procedimiento Arbitral'],
      idiomas: ['Español', 'Quechua'],
      disponibilidad: 'Tiempo completo',
      casosAtendidos: 15
    }
  ];

  secretariosFiltrados: any[] = [];
  // Datos de prueba para árbitros
  arbitros: any[] = [
    {
      id: 1,
      nombre: 'Dr. Luis Fernando Ordoñez Chambi',
      especialidadPrincipal: 'Abogado',
      experiencia: 15,
      tipo: 'Arbitraje',
      especialidades: ['Contrataciones Públicas', 'Derecho Administrativo']
    },
    // {
    //   id: 2,
    //   nombre: 'Dra. Ana María Gutierrez Paredes',
    //   especialidadPrincipal: 'Derecho Civil',
    //   experiencia: 12,
    //   tipo: 'Árbitro',
    //   especialidades: ['Derecho Contractual', 'Arbitraje Comercial']
    // },
    // {
    //   id: 3,
    //   nombre: 'Dr. Roberto Jiménez Mendoza',
    //   especialidadPrincipal: 'Contrataciones Públicas',
    //   experiencia: 18,
    //   tipo: 'Árbitro Principal',
    //   especialidades: ['Derecho Administrativo', 'Derecho Comercial']
    // },
    // {
    //   id: 4,
    //   nombre: 'Dra. Sofia Elena Torres Ruiz',
    //   especialidadPrincipal: 'Derecho Comercial',
    //   experiencia: 14,
    //   tipo: 'Árbitro',
    //   especialidades: ['Derecho Civil', 'Contrataciones Públicas']
    // }
  ];

  // Datos de prueba para adjudicadores
  adjudicadores: any[] = [
    {
      id: 5,
      nombre: 'Julio Ricardo de Olarte Mendivil',
      especialidadPrincipal: 'Ing. Civil',
      experiencia: 'mas de 10',
      tipo: 'Adjudicador',
      especialidades: ['Contrataciones Públicas', 'Derecho Administrativo']
    },
    // {
    //   id: 6,
    //   nombre: 'Dra. Patricia Isabel Moreno Vargas',
    //   especialidadPrincipal: 'Derecho Administrativo',
    //   experiencia: 13,
    //   tipo: 'Adjudicador',
    //   especialidades: ['Contrataciones Públicas', 'Derecho Comercial']
    // }
  ];

  arbitrosFiltrados: any[] = [];

  ngOnInit() {
    this.arbitrosFiltrados = [...this.arbitros];

    this.secretariosFiltrados = [...this.secretarios];
  }

  get totalSecretarios(): number {
    return this.secretarios.length;
  }

  get totalArbitros(): number {
    return this.arbitros.length;
  }

  get totalAdjudicadores(): number {
    return this.adjudicadores.length;
  }

  filtrarSecretarios() {
    this.secretariosFiltrados = this.secretarios.filter(secretario => {
      const coincideNombre = secretario.nombre.toLowerCase().includes(this.filtroSecretarios.toLowerCase());
      const coincideSede = !this.filtroSede ||
        secretario.sede.toLowerCase().includes(this.filtroSede.toLowerCase());

      return coincideNombre && coincideSede;
    });
  }

  verHojaVidaSecretario(id: number) {
    // Navegar a la hoja de vida del secretario

    // this.router.navigate(['/hoja-vida-secretario', id]);
  }

  contactarSecretario(secretario: any) {
    // Abrir modal o redirigir para contacto

    // this.abrirModalContacto(secretario);
  }

  filtrarArbitros() {
    this.arbitrosFiltrados = this.arbitros.filter(arbitro => {
      const coincideNombre = arbitro.nombre.toLowerCase().includes(this.filtroArbitros.toLowerCase());
      const coincideEspecialidad = !this.filtroEspecialidad ||
        arbitro.especialidades.includes(this.filtroEspecialidad) ||
        arbitro.especialidadPrincipal.toLowerCase().includes(this.filtroEspecialidad.toLowerCase());

      return coincideNombre && coincideEspecialidad;
    });
  }

  verHojaVida(id: number) {
    // Navegar a la hoja de vida del profesional

    // this.router.navigate(['/hoja-vida', id]);
  }


  // NUEVO: Método para documentos varios
  getOtrosDocumentos() {
    return {
      vigenciaPoder: `${this.baseUrl}/otros%20documentos/Vigencia%20de%20poder.pdf`,
      licenciaFuncionamiento: `${this.baseUrl}/otros%20documentos/licencia%20de%20funcionamiento.jpg`,
      inscripcionRRPP: `${this.baseUrl}/otros%20documentos/INSCRIPCION_A_RRPP[1].pdf`,
      fichaRUC: `${this.baseUrl}/otros%20documentos/FICHA_RUC.pdf`,
      // cirSunat1: `${this.baseUrl}/otros%20documentos/CIR-SUNAT.jpg`,
      // cirSunat2: `${this.baseUrl}/otros%20documentos/CIR-SUNAT2.jpg`,
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

  filtrarDocumentos(termino: string) {
    if (!termino) {
      this.documentosFiltrados = [...this.otrosDocumentosEntries];
      return;
    }

    const term = termino.toLowerCase();
    this.documentosFiltrados = this.otrosDocumentosEntries.filter(([nombreArchivo]) =>
      nombreArchivo.toLowerCase().includes(term)
    );
  }

  filtrarPorCategoria(categoria: string) {
    if (!categoria) {
      this.documentosFiltrados = [...this.otrosDocumentosEntries];
      return;
    }

    this.documentosFiltrados = this.otrosDocumentosEntries.filter(([nombreArchivo]) =>
      this.getDocumentCategory(nombreArchivo) === categoria
    );
  }

  getDocumentColor(nombreArchivo: string): string {
    const categoria = this.getDocumentCategory(nombreArchivo);
    switch (categoria) {
      case 'licencia': return 'bg-success';
      case 'registro': return 'bg-warning';
      case 'legal': return 'bg-error';
      case 'operacion': return 'bg-info';
      default: return 'bg-gray-500';
    }
  }

  getDocumentCategory(nombreArchivo: string): string {
    const nombre = nombreArchivo.toLowerCase();
    if (nombre.includes('licencia') || nombre.includes('autorizacion')) return 'licencia';
    if (nombre.includes('registro') || nombre.includes('sunat')) return 'registro';
    if (nombre.includes('estatuto') || nombre.includes('acuerdo')) return 'legal';
    if (nombre.includes('certificado') || nombre.includes('antecedentes')) return 'operacion';
    return '';
  }

  getCategoryLabel(categoria: string): string {
    const labels: { [key: string]: string } = {
      'licencia': 'Licencia y Permisos',
      'registro': 'Registro Público',
      'legal': 'Documento Legal',
      'operacion': 'Operación Institucional'
    };
    return labels[categoria] || 'Documento';
  }

  getCategoryBadgeColor(categoria: string): string {
    const colors: { [key: string]: string } = {
      'licencia': 'badge-success',
      'registro': 'badge-warning',
      'legal': 'badge-error',
      'operacion': 'badge-info'
    };
    return colors[categoria] || 'badge-gray-500';
  }

  getFileType(fileUrl: string): string {
    if (fileUrl.toLowerCase().endsWith('.pdf')) return 'PDF Document';
    if (fileUrl.toLowerCase().endsWith('.docx')) return 'Word Document';
    if (fileUrl.toLowerCase().endsWith('.doc')) return 'Word Document';
    return 'Archivo';
  }

  getFileSize(file: [string, string]): string {
    // En una implementación real, esto vendría del backend
    const sizes = ['~250 KB', '~180 KB', '~350 KB', '~150 KB', '~420 KB', '~560 KB', '~120 KB'];
    const randomIndex = Math.abs(this.hashCode(file[0])) % sizes.length;
    return sizes[randomIndex];
  }

  getDocumentDate(nombreArchivo: string): string {
    // Extraer fecha del nombre del archivo o usar fecha por defecto
    const yearMatch = nombreArchivo.match(/(20\d{2})/);
    const year = yearMatch ? yearMatch[1] : '2025';
    return `Vigente ${year}`;
  }

  // Función auxiliar para generar un hash simple
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

}
