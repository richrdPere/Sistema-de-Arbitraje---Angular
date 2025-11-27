import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DesignacionService } from 'src/app/services/designacion.service';

// Services
// import { ExpedienteService } from 'src/app/services/expediente.service';
// import { ParticipesService } from 'src/app/services/participes.service';
// import { ArbitroService } from 'src/app/services/arbitro.service';
// import { DesignacionService } from 'src/app/services/designacion.service';

@Component({
  selector: 'app-gestionar-participes',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gestionar-participes.component.html',
})
export class GestionarParticipésComponent implements OnInit {


  expedienteId!: number;
  expediente: any = null;
  participes: any[] = [];

  // Designación actual
  designacionActual: any = null;

  // Tipos de designación
  tiposDesignacion = [
    { value: 'individual', label: 'Árbitro único' },
    { value: 'tribunal', label: 'Tribunal arbitral (3 árbitros)' },
    { value: 'aleatoria', label: 'Designación aleatoria' },
  ];

  tipoSeleccionado: string = '';
  arbitrosDisponibles: any[] = [];

  // Árbitros seleccionados
  arbitroUnico: number | null = null;
  arbitroDemandante: number | null = null;
  arbitroDemandado: number | null = null;
  arbitroInstitucion: number | null = null;

  loading = false;
  mensaje: string = '';

  constructor(
    // private expedienteService: ExpedienteService,
    // private participesService: ParticipesService,
    // private arbitroService: ArbitroService,
    private designacionService: DesignacionService
  ) { }

  ngOnInit() {
    this.expedienteId = Number(localStorage.getItem('expediente_actual'));
    this.cargarDatosIniciales();
  }

  /** ============================
   *  Cargar expediente + participes
   *  ============================ */
  cargarDatosIniciales() {
    this.loading = true;

    // Cargar expediente
    this.expedienteService.getExpedienteById(this.expedienteId).subscribe({
      next: (resp) => {
        this.expediente = resp.expediente;
      }
    });

    // Cargar participes (demandante / demandado)
    this.participesService.listarPorExpediente(this.expedienteId).subscribe({
      next: (resp) => {
        this.participes = resp.participes;
      }
    });

    // Cargar árbitros disponibles
    this.arbitroService.listarArbitros().subscribe({
      next: (resp) => {
        this.arbitrosDisponibles = resp.arbitros;
      }
    });

    // Cargar designación actual si ya existe
    this.designacionService.getPorExpediente(this.expedienteId).subscribe({
      next: (resp) => {
        this.designacionActual = resp.designacion ?? null;

        if (this.designacionActual) {
          this.tipoSeleccionado = this.designacionActual.tipo_designacion;
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  /** ============================
   *  Enviar designación al backend
   *  ============================ */
  guardarDesignacion() {

    const payload: any = {
      expediente_id: this.expedienteId,
      tipo_designacion: this.tipoSeleccionado,
      adjudicador_id: Number(localStorage.getItem('usuario_id')),
      arbitros: []
    };

    if (this.tipoSeleccionado === 'individual') {
      payload.arbitros.push({
        arbitro_id: this.arbitroUnico,
        rol: 'único'
      });
    }

    if (this.tipoSeleccionado === 'tribunal') {
      payload.arbitros.push(
        { arbitro_id: this.arbitroDemandante, rol: 'parte demandante' },
        { arbitro_id: this.arbitroDemandado, rol: 'parte demandada' },
        { arbitro_id: this.arbitroInstitucion, rol: 'institución' }
      );
    }

    if (this.tipoSeleccionado === 'aleatoria') {
      payload.aleatoria = true;
    }

    this.loading = true;

    // Crear nueva designación
    this.designacionService.designarArbitros(payload).subscribe({
      next: (resp) => {
        this.mensaje = "Designación registrada correctamente.";
        this.designacionActual = resp.designacion;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.mensaje = "Error al registrar la designación";
        this.loading = false;
      }
    });
  }

  /** ============================
   *  Actualizar designación
   *  ============================ */
  actualizarEstado(estado: string) {
    if (!this.designacionActual) return;

    this.loading = true;

    this.designacionService.actualizarDesignacion(
      this.designacionActual.id_designacion,
      { estado }
    ).subscribe({
      next: (resp) => {
        this.designacionActual = resp.designacion;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

}
