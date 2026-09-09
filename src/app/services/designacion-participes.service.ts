import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Participante {
  persona_id: number;
  nombres?: string;
  apellidos?: string;
  rol: 'DEMANDANTE' | 'DEMANDADO' | 'ARBITRO';
}

export interface ArbitroSeleccionado {
  arbitro_id: number;

  cargo: string;
  especialidad?: string;
  numero_colegiatura?: string;

  disponible: boolean;

  persona: {
    id: number;
    nombres: string;
    apellidos: string;
    dni: string;
    telefono?: string;
    email?: string;
  };

  rol:
  | 'ARBITRO_UNICO'
  | 'PRESIDENTE'
  | 'COARBITRO'
  | 'SUPLENTE';

  designado_por:
  | 'DEMANDANTE'
  | 'DEMANDADO'
  | 'INSTITUCION'
  | 'ALEATORIO';
}

export interface ArbitrosConfig {
  tipo: 'ARBITRO_UNICO' | 'TRIBUNAL';
  lista: ArbitroSeleccionado[];
}

export interface DesignacionState {
  expedienteId: number | null;

  tipoArbitraje:
  | 'EMERGENCIA'
  | 'AD_HOC'
  | 'TRIBUNAL';

  metodoDesignacion:
  | 'DIRECTA'
  | 'ALEATORIA'
  | 'INSTITUCIONAL';

  adjudicador_id?: number;
  observaciones?: string;
  demandantes: Participante[];
  demandados: Participante[];
  arbitros: ArbitrosConfig;
  step: number;
}



@Injectable({
  providedIn: 'root'
})
export class DesignacionFormService {

  private initialState: DesignacionState = {
    expedienteId: null,
    tipoArbitraje: 'AD_HOC',
    metodoDesignacion: 'DIRECTA',
    adjudicador_id: undefined,
    observaciones: '',
    demandantes: [],
    demandados: [],
    arbitros: {
      tipo: 'ARBITRO_UNICO',
      lista: []
    },
    step: 1
  };

  private state$ = new BehaviorSubject<DesignacionState>(this.initialState);

  // =============================
  // GET STATE
  // =============================
  getState() {
    return this.state$.asObservable();
  }

  get current() {
    return this.state$.value;
  }

  // =============================
  // INIT
  // =============================
  init(
    expedienteId: number,
    tipo: DesignacionState['tipoArbitraje'],
    demandantes: Participante[] = [],
    demandados: Participante[] = []
  ) {
    this.state$.next({
      expedienteId,
      tipoArbitraje: tipo,
      metodoDesignacion: 'DIRECTA',
      adjudicador_id: undefined,
      observaciones: '',
      demandantes: [...demandantes],
      demandados: [...demandados],
      arbitros: {
        tipo: 'ARBITRO_UNICO',
        lista: []
      },
      step: 1
    });
  }

  // =============================
  // SET METODO DESIGNACION
  // =============================
  setMetodoDesignacion(
    metodo:
      | 'DIRECTA'
      | 'ALEATORIA'
      | 'INSTITUCIONAL'
  ) {
    this.state$.next({
      ...this.current,
      metodoDesignacion: metodo
    });
  }

  // =============================
  // SET OBSERVACIONES
  // =============================
  setObservaciones(observaciones: string) {
    this.state$.next({
      ...this.current,
      observaciones
    });
  }

  // =============================
  // STEP CONTROL
  // =============================
  nextStep() {
    const state = this.current;
    this.validateStep(state.step);

    this.state$.next({
      ...state,
      step: state.step + 1
    });
  }

  prevStep() {
    const state = this.current;
    this.state$.next({
      ...state,
      step: state.step - 1
    });
  }

  goToStep(step: number) {
    this.state$.next({
      ...this.current,
      step
    });
  }

  // =============================
  // DEMANDANTES
  // =============================
  addDemandante(p: Participante) {
    const state = this.current;
    const existe = state.demandantes.some(x => x.persona_id === p.persona_id);

    if (existe) return;

    this.state$.next({
      ...state,
      demandantes: [
        ...state.demandantes,
        { ...p, rol: 'DEMANDANTE' }
      ]
    });
  }

  removeDemandante(index: number) {
    const state = this.current;
    this.state$.next({
      ...state,
      demandantes: state.demandantes.filter(
        (_, i) => i !== index
      )
    });
  }

  // =============================
  // DEMANDADOS
  // =============================
  addDemandado(p: Participante) {
    const state = this.current;
    const existe = state.demandados.some(x => x.persona_id === p.persona_id);

    if (existe) return;

    this.state$.next({
      ...state,
      demandados: [...state.demandados, { ...p, rol: 'DEMANDADO' }]
    });
  }

  removeDemandado(index: number) {
    const state = this.current;
    this.state$.next({
      ...state,
      demandados: state.demandados.filter(
        (_, i) => i !== index
      )
    });
  }

  // =============================
  // ARBITROS
  // =============================
  setTipoArbitros(
    tipo: 'ARBITRO_UNICO' | 'TRIBUNAL',
    limpiarLista = true
  ) {
    const state = this.current;
    this.state$.next({
      ...state,
      arbitros: {
        tipo,
        lista: limpiarLista
          ? []
          : state.arbitros.lista
      }
    });
  }

  addArbitro(a: ArbitroSeleccionado) {
    const state = this.current;

    this.state$.next({
      ...state,
      arbitros: {
        ...state.arbitros,
        lista: [
          ...state.arbitros.lista,
          a
        ]
      }
    });
  }

  removeArbitro(index: number) {
    const state = this.current;
    this.state$.next({
      ...state,

      arbitros: {
        ...state.arbitros,

        lista: state.arbitros.lista.filter(
          (_, i) => i !== index
        )
      }
    });
  }

  // =============================
  // VALIDACIONES
  // =============================
  private validateStep(step: number) {
    const state = this.current;

    if (step === 1 && state.demandantes.length === 0) {
      throw new Error('Debe agregar al menos un demandante');
    }

    if (step === 2 && state.demandados.length === 0) {
      throw new Error('Debe agregar al menos un demandado');
    }

    if (step === 3) {
      const tipo = state.tipoArbitraje;
      const total = state.arbitros.lista.length;

      if (tipo === 'EMERGENCIA' && total !== 1) {
        throw new Error('Arbitraje de emergencia requiere 1 árbitro');
      }

      if (tipo === 'TRIBUNAL' && total !== 3) {
        throw new Error('Tribunal requiere 3 árbitros');
      }

      if (tipo === 'AD_HOC' && ![1, 3].includes(total)) {
        throw new Error('Ad Hoc requiere 1 o 3 árbitros');
      }
    }
  }

  // =============================
  // PAYLOAD FINAL
  // =============================
  buildPayload() {
    const state = this.current;

    return {
      expediente_id: state.expedienteId,
      tipo_tribunal: state.arbitros.tipo,
      metodo_designacion: state.metodoDesignacion,
      adjudicador_id: state.adjudicador_id,
      observaciones: state.observaciones,
      demandantes: state.demandantes.map(d => ({
        persona_id: d.persona_id
      })),
      demandados: state.demandados.map(d => ({
        persona_id: d.persona_id
      })),
      arbitros: state.arbitros.lista.map(a => ({
        arbitro_id: a.arbitro_id,
        rol: a.rol,
        designado_por: a.designado_por
      }))
    };
  }

  // =============================
  // RESET
  // =============================
  reset() {
    this.state$.next({
      ...this.initialState,

      arbitros: {
        ...this.initialState.arbitros,
        lista: []
      },

      demandantes: [],

      demandados: []
    });
  }
}
