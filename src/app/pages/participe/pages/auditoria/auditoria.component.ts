import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auditoria.component',
  imports: [],
  templateUrl: './auditoria.component.html',
})
export class AuditoriaComponent implements OnInit {

  auditorias: any[] = [];
  nuevaAccion: string = '';
  usuarioActivo = { id: 1, nombre: 'Richard Pereira' }; // usuario simulado
  loading = false;


  constructor() { }


  ngOnInit(): void {
    this.cargarAuditorias();
  }


  //  Simula carga de acciones desde el backend
  cargarAuditorias(): void {
    this.loading = true;

    setTimeout(() => {
      this.auditorias = [
        {
          id_auditoria: 1,
          usuario: 'Richard Pereira',
          accion: 'Consultó expediente 008-2025/DESIGNACIÓN',
          fecha: '2025-10-30T10:35:00.000Z'
        },
        {
          id_auditoria: 2,
          usuario: 'Richard Pereira',
          accion: 'Descargó resolución 001-2025/JPRD',
          fecha: '2025-10-31T09:22:00.000Z'
        }
      ];
      this.loading = false;
    }, 800);
  }

  //  Registrar una nueva acción
  registrarAccion(): void {
    const accionTexto = this.nuevaAccion.trim();
    if (!accionTexto) return;

    const nueva = {
      id_auditoria: this.auditorias.length + 1,
      usuario: this.usuarioActivo.nombre,
      accion: accionTexto,
      fecha: new Date().toISOString()
    };

    this.auditorias.unshift(nueva);
    this.nuevaAccion = '';
  }

  //  Formatear la fecha
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-PE', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  }
}
