import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Service
import { DesignacionParticipesService } from 'src/app/services/designacion-participes.service';

@Component({
  selector: 'step-demandantes',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './step-demandantes.component.html',
  styles: ``
})
export class StepDemandantesComponent {

  numeroDocumento: string = '';
  personaEncontrada: any = null;
  loadingBusqueda = false;
  busquedaRealizada = false;

  demandantes: any[] = [];

  constructor(private designacionService: DesignacionParticipesService) {
    this.designacionService.getState().subscribe(state => {
      this.demandantes = state.demandantes;
    });
  }


  // =============================
  // BUSCAR PERSONA (SIMULADO / API)
  // =============================
  async buscarPersona() {
    if (!this.numeroDocumento) return;

    this.loadingBusqueda = true;
    this.busquedaRealizada = false;
    this.personaEncontrada = null;

    try {
      // 🔥 AQUÍ CONECTAS TU API REAL
      const response = await this.fakeApi(this.numeroDocumento);

      this.personaEncontrada = response;
      this.busquedaRealizada = true;

    } catch (error) {
      this.personaEncontrada = null;
      this.busquedaRealizada = true;
    }

    this.loadingBusqueda = false;
  }

  // =============================
  // AGREGAR
  // =============================
  agregarDemandante(persona: any) {
    this.designacionService.addDemandante({
      persona_id: persona.id,
      nombres: persona.nombres,
      apellidos: persona.apellidos,
      rol: 'DEMANDANTE'
    });

    this.personaEncontrada = null;
    this.numeroDocumento = '';
  }

  eliminarDemandante(index: number) {
    this.designacionService.removeDemandante(index);
  }

  abrirModalCrearPersona() {
    console.log('Abrir modal crear persona');
  }

  // =============================
  // MOCK API (SIMULACIÓN)
  // =============================
  fakeApi(doc: string): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (doc === '73081247') {
          resolve({
            id: 1,
            nombres: 'RICHARD',
            apellidos: 'PEREIRA',
            dni: doc
          });
        } else {
          reject();
        }
      }, 1000);
    });
  }
}
