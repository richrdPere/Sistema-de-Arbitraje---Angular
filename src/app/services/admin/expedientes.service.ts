import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Expediente {
  id: string;
  numeroExpediente: string;
  participantes: number;
  fechaInicio: string;
  estado: string;
  docs: number;
  actualizacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpedientesService {

  private apiUrl = 'http://localhost:4000/api/expedientes'; // tu endpoint Node/Express

  constructor(private http: HttpClient) {}

  getExpedientes(): Observable<Expediente[]> {
    return this.http.get<Expediente[]>(this.apiUrl);
  }
}
