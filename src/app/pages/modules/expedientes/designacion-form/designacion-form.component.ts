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
  tipo_arbitraje: string = '';
  modoEdicion = false;
  designacionExistente: any = null;

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
    if (changes['expedienteId'] && this.expedienteId && changes['expedienteId'].currentValue !== changes['expedienteId'].previousValue
    ) {
      this.verificarDesignacion();
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
          const tipoArbitraje = this.mapearTipoArbitraje(resp.tipo);
          this.designacionFormService.init(
            this.expedienteId!,
            tipoArbitraje,
            demandantes,
            demandados
          );

          // - ASIGNAR TIPO ARBITRAJE
          this.tipo_arbitraje = tipoArbitraje;
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
  // VERIFICAR DESIGNACIÓN
  // ==========================
  verificarDesignacion() {
    this.designacionService
      .getDesignacionByExpediente(this.expedienteId!)
      .subscribe({
        // EXISTE DESIGNACIÓN
        next: (resp: any) => {

          console.log('DESIGNACION EXISTENTE:', resp);
          this.modoEdicion = true;
          this.designacionExistente = resp;
          this.cargarDesignacionExistente(resp);
        },

        // NO EXISTE DESIGNACIÓN
        error: (err) => {
          console.log('NO EXISTE DESIGNACION');

          // 404 = NO EXISTE
          if (err.status === 404) {
            this.modoEdicion = false;
            this.cargarParticipantes();
            return;
          }
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              'No se pudo verificar la designación.'
          });
        }
      });
  }

  // ==========================
  // CARGAR DESIGNACIÓN
  // ==========================
  cargarDesignacionExistente(resp: any) {

    // - PARTICIPANTES
    const demandantes = (resp?.participantes?.demandantes || [])
      .map((d: any) => ({
        persona_id: d.persona.id,
        nombres: this.getNombrePersona(d.persona),
        apellidos: d.persona.apellidos || '',
        rol: 'DEMANDANTE'
      }));

    const demandados = (resp?.participantes?.demandados || [])
      .map((d: any) => ({
        persona_id: d.persona.id,
        nombres: this.getNombrePersona(d.persona),
        apellidos: d.persona.apellidos || '',
        rol: 'DEMANDADO'
      }));

    // - TIPO ARBITRAJE
    const tipoArbitraje = this.mapearTipoArbitraje(resp?.expediente?.tipo);
    this.tipo_arbitraje = tipoArbitraje;

    // - INIT STATE
    this.designacionFormService.init(
      this.expedienteId!,
      tipoArbitraje,
      demandantes,
      demandados
    );

    // - CONFIGURAR TRIBUNAL
    this.designacionFormService
      .setTipoArbitros(
        resp?.designacion?.tipo_tribunal,
        false
      );

    // - MÉTODO DESIGNACIÓN
    this.designacionFormService.setMetodoDesignacion(
      resp?.designacion?.metodo_designacion
    );

    // - OBSERVACIONES
    this.designacionFormService.setObservaciones(
      resp?.designacion?.observaciones || ''
    );

    // ÁRBITROS
    const arbitros = resp?.arbitros || [];

    arbitros.forEach((a: any) => {

      const persona = a?.arbitro?.persona;
      this.designacionFormService.addArbitro({
        arbitro_id: a.arbitro_id,
        cargo: a.cargo,
        especialidad: a.especialidad,
        numero_colegiatura: a.numero_colegiatura,
        disponible: a.disponible,
        persona: {
          id: persona?.id,
          nombres: this.getNombrePersona(persona),
          apellidos: persona?.apellidos || '',
          dni: persona?.dni || '',
          telefono: persona?.telefono || '',
          email: persona?.email || ''
        },
        // nombres: this.getNombrePersona(persona),
        // apellidos: persona?.apellidos || '',
        rol: a.rol,
        designado_por: a.designado_por
      });

    });

    console.log(
      'STATE RESTAURADO:',
      this.designacionFormService.current
    );
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

    const payload = this.designacionFormService.buildPayload();

    console.log("DESIGN FORM: ", payload);

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
          // RESET FORM
          this.designacionFormService.reset();
          // EMITIR EVENTO AL PADRE
          this.designacionCreado.emit();
          // CERRAR MODAL
          this.cerrarModal();
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
    this.tipo_arbitraje = '';
    this.modoEdicion = false;
    this.designacionExistente = null;
    this.designacionFormService.reset();
    this.modalCerrado.emit();
  }

  mapearTipoArbitraje(tipo: string):
    'EMERGENCIA'
    | 'AD_HOC'
    | 'TRIBUNAL' {

    switch (tipo) {

      case 'Arbitraje de Emergencia':
        return 'EMERGENCIA';

      case 'Arbitraje Institucional':
        return 'TRIBUNAL';

      case 'Arbitraje Ad Hoc':
      default:
        return 'AD_HOC';

    }

  }
}
