import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Laudo {
  id: number;
  expediente: string;
  tipo: 'Laudo Parcial' | 'Laudo Final';
  estado: 'Borrador' | 'Firmado' | 'Notificado' | 'Consentido';
  fechaCreacion: string;
  fechaFirma?: string;
}


@Component({
  selector: 'app-laudos',
  imports: [CommonModule, FormsModule],
  templateUrl: './laudos.component.html',
  styles: ``
})
export class LaudosComponent {
abrirModal() {
throw new Error('Method not implemented.');
}
  filtroEstado: string = '';


  laudos: Laudo[] = [
    {
      id: 1,
      expediente: 'EXP-2024-001',
      tipo: 'Laudo Parcial',
      estado: 'Borrador',
      fechaCreacion: '2024-11-01'
    },
    {
      id: 2,
      expediente: 'EXP-2024-002',
      tipo: 'Laudo Final',
      estado: 'Firmado',
      fechaCreacion: '2024-10-10',
      fechaFirma: '2024-10-15'
    },
    {
      id: 3,
      expediente: 'EXP-2024-003',
      tipo: 'Laudo Final',
      estado: 'Notificado',
      fechaCreacion: '2024-09-05'
    }
  ];


  laudosFiltrados(): Laudo[] {
    if (!this.filtroEstado) return this.laudos;
    return this.laudos.filter(l => l.estado === this.filtroEstado);
  }


  verLaudo(laudo: Laudo) {
    alert(`Viendo laudo del expediente ${laudo.expediente}`);
  }


  editarLaudo(laudo: Laudo) {
    alert(`Editando laudo ${laudo.id}`);
  }


  firmarLaudo(laudo: Laudo) {
    laudo.estado = 'Firmado';
    laudo.fechaFirma = new Date().toISOString().split('T')[0];
    alert('Laudo firmado correctamente');
  }
}
