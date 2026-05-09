import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Environment
import { environment } from '@environments/environment';
import { UsuarioSecretaria } from '../interfaces/users/secretariaUser';


// Interfaces opcionales (si deseas usarlas)
export interface ICrearDesignacionRequest {
  expediente_id: number;
  usuario_responsable: UsuarioSecretaria;
  adjudicador_id: number;
  tipo_designacion: 'individual' | 'tribunal' | 'aleatoria';
  arbitro_ids?: number[];
  cantidad?: number; // para aleatoria
}

export interface IAsignarArbitrosRequest {
  arbitro_ids: number[];
}

export interface IListarDesignacionesResponse {
  total: number;
  pagina_actual: number;
  por_pagina: number;
  total_paginas: number;
  designaciones: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DesignacionService {

  // 1.- Environment
  envs = environment;

  // 2.- variables publicas
  API_BASE: string = this.envs.main_url_prueba + 'designaciones';

  API_NEW_DESIGNACION: string = this.API_BASE + '/crear';
  API_ASIGNAR_ARBITROS: string = this.API_BASE + '/arbitros/';
  API_GET_DESIGNACIONES_PAGINATED: string = this.API_BASE + '/paginado';
  API_GET_DESIGNACION_BY_ID: string = this.API_BASE + '/detalle/';
  API_UPDATE_DESIGNACION: string = this.API_BASE + '/editar/';
  API_DELETE_DESIGNACION: string = this.API_BASE + '/eliminar/';
  API_ACEPTAR_DESIGNACION: string = this.API_BASE + '/aceptar/';
  API_RECHAZAR_DESIGNACION: string = this.API_BASE + '/rechazar/';
  API_GET_DESIGNACION_BY_EXPEDIENTE: string = this.API_BASE + '/expediente/';

  constructor(private http: HttpClient) { }

  // ======= HEADER CON TOKEN =======

  // - Auth Headers
  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token'); // o sessionStorage según tu login
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return { headers };
  }

  // ===========================================================
  // 1.- Registrar designacion
  // ===========================================================
  newDesignacion(body: any): Observable<any> {
    return this.http.post(this.API_NEW_DESIGNACION, body, this.getAuthHeaders());
  }

  // ===========================================================
  // 2. Asignar árbitros
  // ===========================================================
  asignarArbitros(id: number, body: IAsignarArbitrosRequest): Observable<any> {
    return this.http.put(`${this.API_ASIGNAR_ARBITROS}${id}`, body, this.getAuthHeaders());
  }

  // ===========================================================
  // 3. Listar designaciones con filtros + paginado
  // ===========================================================
  getDesignacionesPaginated(filters: {
    page?: number;
    limit?: number;
    estado?: string;
    expediente_id?: number;
    adjudicador_id?: number;
  }): Observable<IListarDesignacionesResponse> {

    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    const headers = this.getAuthHeaders().headers;

    return this.http.get<any>(this.API_GET_DESIGNACIONES_PAGINATED, { params, headers, });
  }

  // ===========================================================
  // 4. Ver detalle de una designaicon
  // ===========================================================
  getDesignacionById(id: number): Observable<any> {
    return this.http.get(`${this.API_GET_DESIGNACION_BY_ID}${id}`, this.getAuthHeaders());
  }

  // ===========================================================
  // 5. Actualizar metadatos (estado, tipo, etc)
  // ===========================================================
  updateDesignacion(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.API_UPDATE_DESIGNACION}${id}`, payload, this.getAuthHeaders());
  }

  // ===========================================================
  // 6. Eliminar designación
  // ===========================================================
  eliminarDesignacion(id: number): Observable<any> {
    return this.http.delete(`${this.API_DELETE_DESIGNACION}${id}`, this.getAuthHeaders());
  }

  // ===========================================================
  // 7. Desginacion por expediente
  // ===========================================================
  getDesignacionPorExpediente(expedienteId: number) {
    return this.http.get(`${this.API_GET_DESIGNACION_BY_EXPEDIENTE}${expedienteId}`, this.getAuthHeaders());
  }

  // ===========================================================
  // 8.- Aceptar designacion
  // ===========================================================
  aceptarDesignacion(id: number): Observable<any> {
    return this.http.patch(`${this.API_ACEPTAR_DESIGNACION}${id}`, this.getAuthHeaders());
  }

  // ===========================================================
  // 9.- Rechazar designacion
  // ===========================================================
  rechazarDesignacion(id: number): Observable<any> {
    return this.http.patch(`${this.API_RECHAZAR_DESIGNACION}${id}`, this.getAuthHeaders());
  }
}
