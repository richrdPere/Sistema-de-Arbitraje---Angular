import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


// Service
import { DesignacionFormService } from 'src/app/services/designacion-participes.service';
import { ParticipeService } from 'src/app/services/admin/participes.service';

@Component({
  selector: 'step-demandantes',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-demandantes.component.html',
  styles: ``
})
export class StepDemandantesComponent {

  @Input() expedienteId!: number;
  @Output() nextStep = new EventEmitter<void>();

  demandantesDisponibles: any[] = [];
  loading = false;

  constructor(
    private designacionService: DesignacionFormService,
    private participeService: ParticipeService
  ) { }

  ngOnInit(): void {
    this.loadDisponibles();
  }

  // ======================================
  // LOAD DATA
  // ======================================
  loadDisponibles() {
    this.loading = true;

    this.participeService.listaParticipes().subscribe({
      next: (resp: any[]) => {
        const seleccionadosIds = this.designacionService.current.demandantes.map(d => d.persona_id);

        this.demandantesDisponibles = resp.filter(p =>
          p.rol_participe === 'Demandante' &&
          !seleccionadosIds.includes(p.persona_id)
        );

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // ======================================
  // ACTIONS
  // ======================================
  agregar(p: any) {
    const participante: any = {
      persona_id: p.persona_id,
      nombres: p.nombres,
      apellidos: p.apellidos,
      rol: 'DEMANDANTE'
    };

    this.designacionService.addDemandante(participante);
    this.loadDisponibles();
  }

  quitar(index: number) {
    this.designacionService.removeDemandante(index);
    this.loadDisponibles();
  }

  // ======================================
  // GETTERS
  // ======================================
  get seleccionados() {
    return this.designacionService.current.demandantes;
  }
}
