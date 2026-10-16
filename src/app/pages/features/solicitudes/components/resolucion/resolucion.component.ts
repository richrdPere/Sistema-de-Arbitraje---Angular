import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Resolucion {
  id: number;
  expediente: string;
  tipo: 'Laudo' | 'Resolución Interlocutoria' | 'Auto';
  estado: 'Borrador' | 'Firmada' | 'Notificada';
  fechaCreacion: string;
  fechaFirma?: string;
}


@Component({
  selector: 'app-resolucion',
  imports: [CommonModule, FormsModule],
  templateUrl: './resolucion.component.html',
  styles: ``
})
export class ResolucionComponent {
abrirModal() {
throw new Error('Method not implemented.');
}
  filtroEstado: string = '';


  resoluciones: Resolucion[] = [
    {
      id: 1,
      expediente: 'EXP-2024-001',
      tipo: 'Laudo',
      estado: 'Borrador',
      fechaCreacion: '2024-11-10'
    },
    {
      id: 2,
      expediente: 'EXP-2024-002',
      tipo: 'Resolución Interlocutoria',
      estado: 'Firmada',
      fechaCreacion: '2024-10-20',
      fechaFirma: '2024-10-25'
    },
    {
      id: 3,
      expediente: 'EXP-2024-003',
      tipo: 'Auto',
      estado: 'Notificada',
      fechaCreacion: '2024-09-15'
    }
  ];


  resolucionesFiltradas(): Resolucion[] {
    if (!this.filtroEstado) return this.resoluciones;
    return this.resoluciones.filter(r => r.estado === this.filtroEstado);
  }


  verResolucion(res: Resolucion) {
    alert(`Viendo resolución del expediente ${res.expediente}`);
  }


  editarResolucion(res: Resolucion) {
    alert(`Editando resolución ${res.id}`);
  }


  firmarResolucion(res: Resolucion) {
    res.estado = 'Firmada';
    res.fechaFirma = new Date().toISOString().split('T')[0];
    alert(`Resolución firmada correctamente`);
  }
}
