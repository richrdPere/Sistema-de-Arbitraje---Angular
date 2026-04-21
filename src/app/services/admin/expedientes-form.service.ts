import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ExpedienteData {
  titulo: string;
  descripcion: string;
  tipo: string;
  codigo: string;
  fecha_inicio: string | null;
  fecha_laudo?: string | null;
  fecha_resolucion?: string | null;
}

export interface PersonaData {
  tipo: string;
  nombres: string;
  apellidos: string;
  ruc: string;
  razon_social: string;
  nombre_entidad: string;
  email: string;
  telefono: string;
  direccion: string;
  cargo: string
}

export interface FormDataExpediente {
  persona: Partial<PersonaData>;
  expediente: Partial<ExpedienteData>;
}

@Injectable({
  providedIn: 'root'
})
export class ExpedienteFormService {

  // STATE
  private formData: FormDataExpediente = {
    persona: {},
    expediente: {}
  };

  // REACTIVIDAD (UI)
  private stepSubject = new BehaviorSubject<number>(1);
  step$ = this.stepSubject.asObservable();


  private formDataSubject = new BehaviorSubject<FormDataExpediente>(this.formData);
  formData$ = this.formDataSubject.asObservable();

  private modoEdicionSubject = new BehaviorSubject<boolean>(false);
  modoEdicion$ = this.modoEdicionSubject.asObservable();

  private expedienteId: number | null = null;

  // STEP CONTROL
  setStep(step: number) {
    this.stepSubject.next(step);
  }

  getStep() {
    return this.stepSubject.value;
  }

  nextStep() {
    this.stepSubject.next(this.stepSubject.value + 1);
  }

  prevStep() {
    this.stepSubject.next(this.stepSubject.value - 1);
  }

  // SETTERS (ESTILO MPV)
  setPersona(data: Partial<PersonaData>) {
    this.formData.persona = {
      ...this.formData.persona,
      ...data
    };
    this.emitChanges();
  }

  setExpediente(data: Partial<ExpedienteData>) {
    this.formData.expediente = {
      ...this.formData.expediente,
      ...data
    };
    this.emitChanges();
  }


  // GETTERS
  getPersona() {
    return this.formData.persona;
  }

  getExpediente() {
    return this.formData.expediente;
  }

  getFormData() {
    return this.formData;
  }

  // MODO EDICIÓN
  setModoEdicion(valor: boolean, expedienteId?: number) {
    this.modoEdicionSubject.next(valor);
    if (expedienteId) {
      this.expedienteId = expedienteId;
    }
  }

  getModoEdicion() {
    return this.modoEdicionSubject.value;
  }

  getExpedienteId() {
    return this.expedienteId;
  }


  // PAYLOAD FINAL
  buildPayload() {
    return {
      persona: this.formData.persona,
      expediente: this.formData.expediente
    };
  }

  // PATCH (PARA EDICIÓN)
  setFullData(data: FormDataExpediente) {
    this.formData = data;
    this.emitChanges();
  }

  // RESET
  reset() {
    this.formData = {
      persona: {},
      expediente: {}
    };

    this.stepSubject.next(1);
    this.modoEdicionSubject.next(false);
    this.expedienteId = null;

    this.emitChanges();
  }

  // INTERNAL
  private emitChanges() {
    this.formDataSubject.next({ ...this.formData });
  }
}
