import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Audiencia {
  id: number;
  expediente: string;
  tipo: 'Instalación' | 'Única' | 'Pruebas' | 'Informe Oral';
  modalidad: 'Presencial' | 'Virtual';
  estado: 'Programada' | 'Reprogramada' | 'Realizada' | 'Suspendida';
  fecha: string;
  hora: string;
  lugar?: string;
  enlaceVirtual?: string;
}


@Component({
  selector: 'app-audiencias',
  imports: [CommonModule, FormsModule],
  templateUrl: './audiencias.component.html',
  styles: ``
})
export class AudienciasComponent {
abrirModal() {
throw new Error('Method not implemented.');
}
  filtroEstado: string = '';


  audiencias: Audiencia[] = [
    {
      id: 1,
      expediente: 'EXP-2024-001',
      tipo: 'Instalación',
      modalidad: 'Presencial',
      estado: 'Programada',
      fecha: '2024-12-05',
      hora: '10:00',
      lugar: 'Centro de Arbitraje - Sala 1'
    },
    {
      id: 2,
      expediente: 'EXP-2024-002',
      tipo: 'Única',
      modalidad: 'Virtual',
      estado: 'Realizada',
      fecha: '2024-11-15',
      hora: '15:30',
      enlaceVirtual: 'https://meet.example.com/audiencia-002'
    },
    {
      id: 3,
      expediente: 'EXP-2024-003',
      tipo: 'Pruebas',
      modalidad: 'Virtual',
      estado: 'Suspendida',
      fecha: '2024-12-01',
      hora: '09:00'
    }
  ];


  audienciasFiltradas(): Audiencia[] {
    if (!this.filtroEstado) return this.audiencias;
    return this.audiencias.filter(a => a.estado === this.filtroEstado);
  }


  verAudiencia(aud: Audiencia) {
    alert(`Audiencia del expediente ${aud.expediente}`);
  }


  reprogramarAudiencia(aud: Audiencia) {
    aud.estado = 'Reprogramada';
    alert('Audiencia marcada para reprogramación');
  }


  marcarRealizada(aud: Audiencia) {
    aud.estado = 'Realizada';
    alert('Audiencia realizada correctamente');
  }
}
