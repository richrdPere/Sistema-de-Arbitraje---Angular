import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Service
import { DesignacionFormService } from 'src/app/services/designacion-participes.service';

@Component({
  selector: 'step-confirmacion',
  imports: [CommonModule, FormsModule],
  templateUrl: './step-confirmacion.component.html',
  styles: ``
})
export class StepConfirmacionComponent {
  constructor(
    public designacionFormService: DesignacionFormService
  ) { }

  // ==========================================
  // HELPERS
  // ==========================================
  get tipoArbitraje() {
    return this.designacionFormService
      .current
      .tipoArbitraje;
  }

  get arbitros() {
    return this.designacionFormService
      .current
      .arbitros
      .lista;
  }

  get demandantes() {
    return this.designacionFormService
      .current
      .demandantes;
  }

  get demandados() {
    return this.designacionFormService
      .current
      .demandados;
  }

  // ==========================================
  // BADGES
  // ==========================================
  getTipoBadge(tipo: string): string {

    switch (tipo) {

      case 'EMERGENCIA':
        return 'badge-info';

      case 'TRIBUNAL':
        return 'badge-primary';

      case 'AD_HOC':
      default:
        return 'badge-accent';
    }
  }

  getRolArbitroBadge(rol: string): string {
    switch (rol) {
      case 'PRESIDENTE':
        return 'badge-primary';

      case 'ARBITRO_UNICO':
        return 'badge-secondary';

      case 'COARBITRO':
        return 'badge-accent';

      case 'SUPLENTE':
        return 'badge-warning';

      default:
        return 'badge-neutral';
    }
  }
}
