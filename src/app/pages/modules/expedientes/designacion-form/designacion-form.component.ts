import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

// Service
import { DesignacionFormService } from 'src/app/services/designacion-participes.service';
import { DesignacionService } from '../../../../services/designacion.service';
import { ExpedientesService } from 'src/app/services/admin/expedientes.service';

// Componentes
import { StepDemandantesComponent } from "./steps/step-demandantes/step-demandantes.component";
import { StepDemandadosComponent } from "./steps/step-demandados/step-demandados.component";
import { StepArbitrosComponent } from "./steps/step-arbitros/step-arbitros.component";
import { StepConfirmacionComponent } from "./steps/step-confirmacion/step-confirmacion.component";



@Component({
  selector: 'designacion-form',
  imports: [CommonModule, StepDemandantesComponent, StepDemandadosComponent, StepArbitrosComponent, StepConfirmacionComponent],
  templateUrl: './designacion-form.component.html',
  styles: ``
})
export class DesignacionFormComponent implements OnInit, OnChanges {

  @Input() mostrarModal = false;
  @Input() expedienteId: number | null = null;

  @Output() modalCerrado = new EventEmitter<void>();
  @Output() designacionCreado = new EventEmitter<void>();

  state: any;

  constructor(
    public designacionFormService: DesignacionFormService,
    private expedienteService: ExpedientesService,
    private designacionService: DesignacionService
  ) { }

  modalWidthClass = 'max-w-4xl'; // default

  setModalWidth(size: 'sm' | 'md' | 'lg' | 'xl' | 'full') {
    const map = {
      sm: 'max-w-md',
      md: 'max-w-xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-full w-[95vw]'
    };

    this.modalWidthClass = map[size];
  }

  ngOnInit(): void {
    this.setModalWidth('xl');

    this.designacionFormService
      .getState()
      .subscribe(state => {
        this.state = state;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // VALIDAR INPUT
    console.log("EXPEDIENTE ID: ", this.expedienteId)
    if (changes['expedienteId'] && this.expedienteId) {
      console.log('EXPEDIENTE ID:',this.expedienteId);
      this.cargarParticipantes();
    }
  }

  // ==========================
  // CARGAR PARTICIPES
  // ==========================
  cargarParticipantes() {
    this.expedienteService
      .listarParticipantes(this.expedienteId!)
      .subscribe({
        next: (resp: any) => {
          console.log(
            'PARTICIPANTES:',
            resp
          );

          // - MAPEAR DEMANDANTES
          const demandantes = (resp?.demandantes || [])
            .map((d: any) => ({
              persona_id: d.persona.id,
              nombres: this.getNombrePersona(d.persona),
              apellidos: d.persona.apellidos || '',
              rol: 'DEMANDANTE'
            }));

          // - MAPEAR DEMANDADOS
          const demandados = (resp?.demandados || [])
            .map((d: any) => ({
              persona_id: d.persona.id,
              nombres: this.getNombrePersona(d.persona),
              apellidos: d.persona.apellidos || '',
              rol: 'DEMANDADO'
            }));

          // - INIT STATE
          this.designacionFormService.init(
            this.expedienteId!,
            'AD_HOC',
            demandantes,
            demandados
          );
        },

        error: (err) => {
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los participantes.'
          });
        }
      });
  }

  // ==========================
  // HELPERS METHODS
  // ==========================
  getNombrePersona(persona: any): string {
    // NATURAL
    if (persona.tipo === 'NATURAL') {
      return `${persona.nombres || ''} ${persona.apellidos || ''} `.trim();
    }

    // JURIDICA
    if (persona.tipo === 'JURIDICA') {
      return persona.razon_social || '';
    }

    // ENTIDAD
    if (
      persona.tipo === 'ENTIDAD_PUBLICA'
    ) {
      return persona.nombre_entidad || '';
    }

    return '';
  }

  // - Retrocede
  prevStep() {
    this.designacionFormService.prevStep();
  }

  // - Avanza
  nextStep() {
    try {
      this.designacionFormService.nextStep();
    } catch (error: any) {
      Swal.fire({
        icon: 'warning',
        title: 'Validación',
        text: error.message
      });
    }
  }

  // - Ir al step
  irAlPaso(step: number) {
    this.designacionFormService.goToStep(step);
  }

  // ==========================
  // FINALIZAR
  // ==========================
  guardarDesignacion() {

    const payload =
      this.designacionFormService.buildPayload();

    console.log(payload);

    Swal.fire({
      title: 'Creando designación...',
      allowOutsideClick: false,

      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.designacionService
      .newDesignacion(payload)
      .subscribe({

        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Designación creada'
          });
          this.designacionFormService.reset();
        },

        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              err?.error?.message ||
              'Error al crear designación'
          });
        }
      });
  }

  // - Validador
  puedeIrAlPaso(step: number): boolean {

    // // MODO EDICIÓN: TODO LIBRE
    // if (this.modoEdicion) return true;

    // const persona = this.expedienteFormService.getPersona();
    // const expediente = this.expedienteFormService.getExpediente();

    // // STEP 1 → siempre permitido
    // if (step === 1) return true;

    // // STEP 2 → validar persona
    // if (step === 2) {
    //   return !!(persona?.tipo && persona?.email);
    // }

    // // STEP 3 → validar expediente
    // if (step === 3) {
    //   return !!(
    //     persona?.tipo &&
    //     expediente?.titulo &&
    //     expediente?.codigo &&
    //     expediente?.tipo
    //   );
    // }

    return false;
  }


  // - Cerrar el modal
  cerrarModal(): void {
    this.mostrarModal = false;
    this.modalCerrado.emit();
    this.designacionFormService.reset();

    // this.designacionCreado = null; //  MUY IMPORTANTE
  }
}
