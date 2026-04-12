import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TramiteMPVFormService {

  private formData: any = {
    demandante: {},
    demandado: {},
    solicitud: {},
    archivos: []
  };

  // =========================
  // SETTERS
  // =========================
  setDemandante(data: any) {
    this.formData.demandante = data;
  }

  setDemandado(data: any) {
    this.formData.demandado = data;
  }

  setSolicitud(data: any) {
    this.formData.solicitud = data;
  }

  setArchivos(files: File[]) {
    this.formData.archivos = files;
  }

  // =========================
  // GET FINAL
  // =========================
  getFormData() {
    return this.formData;
  }

  // =========================
  // RESET
  // =========================
  reset() {
    this.formData = {
      demandante: {},
      demandado: {},
      solicitud: {},
      archivos: []
    };
  }
}
