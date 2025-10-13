import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Environment
import { environment } from '@environments/environment';

export interface Expediente {
  id_expediente?: number;
  numero_expediente: string;
  codigo: string;
  titulo: string;
  descripcion?: string;
  tipo: string;
  estado: string;
  estado_procesal: string;
  fecha_inicio?: Date;
  fecha_laudo?: Date | null;
  fecha_resolucion?: Date | null;
  fecha_cierre?: Date | null;
  cliente_id?: number;
  arbitro_id?: number;
  secretaria_id?: number;
  caso_id?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ExpedientesService {

  // 1.- Environment
  envs = environment;

  // 2.- variables publicas
  private url: string = this.envs.main_url_prueba + 'expedientes';

  constructor(private http: HttpClient) { }

  // ===========================
  //  CREAR EXPEDIENTE
  // ===========================
  createExpediente(data: Expediente): Observable<any> {
    return this.http.post(`${this.url}`, data);
  }

  // ===========================
  //  OBTENER TODOS LOS EXPEDIENTES
  // ===========================
  getExpedientes(): Observable<Expediente[]> {
    return this.http.get<Expediente[]>(`${this.url}`);
  }

  // ===========================
  //  BUSCAR EXPEDIENTE POR ID
  // ===========================
  getExpedienteById(id: number): Observable<Expediente> {
    return this.http.get<Expediente>(`${this.url}/${id}`);
  }

  // ===========================
  //  BUSCAR EXPEDIENTE POR NÚMERO
  // ===========================
  getExpedienteByNumero(numero: string): Observable<Expediente> {
    return this.http.get<Expediente>(`${this.url}/numero/${numero}`);
  }

  // ===========================
  //  FILTRAR EXPEDIENTES POR ESTADO Y/O TIPO
  // ===========================
  searchExpedientes(estado?: string, tipo?: string): Observable<Expediente[]> {
    let query = `${this.url}/buscar?`;
    if (estado) query += `estado=${estado}&`;
    if (tipo) query += `tipo=${tipo}`;
    return this.http.get<Expediente[]>(query);
  }

  // ===========================
  //  ACTUALIZAR EXPEDIENTE
  // ===========================
  updateExpediente(id: number, data: Partial<Expediente>): Observable<any> {
    return this.http.put(`${this.url}/${id}`, data);
  }

  // ===========================
  //  ELIMINAR EXPEDIENTE
  // ===========================
  deleteExpediente(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }
}
