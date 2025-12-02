import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Environment
import { environment } from '@environments/environment';


// Interfaces opcionales (si deseas usarlas)
export interface ICrearDesignacionRequest {
  expediente_id: number;
  usuario_responsable: string;
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
  private baseUrl: string = this.envs.main_url_prueba + 'designacion/'; // Cambiar a la URL real

  constructor(private http: HttpClient) { }

  // -------------------------------------------------------
  // ✨ 1. Crear designación
  // -------------------------------------------------------
  crearDesignacion(body: ICrearDesignacionRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}designar`, body);
  }

  // -------------------------------------------------------
  // ✨ 2. Asignar árbitros
  // -------------------------------------------------------
  asignarArbitros(id: number, body: IAsignarArbitrosRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}designar/${id}/asignar-arbitros`, body);
  }

  // -------------------------------------------------------
  // ✨ 3. Listar designaciones con filtros + paginado
  // -------------------------------------------------------
  listarDesignaciones(params?: {
    page?: number;
    limit?: number;
    estado?: string;
    expediente_id?: number;
    adjudicador_id?: number;
  }): Observable<IListarDesignacionesResponse> {

    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value);
        }
      });
    }

    return this.http.get<IListarDesignacionesResponse>(`${this.baseUrl}designaciones`, { params: httpParams });
  }

  // -------------------------------------------------------
  // ✨ 4. Ver detalle
  // -------------------------------------------------------
  verDesignacion(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  // -------------------------------------------------------
  // ✨ 5. Actualizar metadatos (estado, tipo, etc)
  // -------------------------------------------------------
  actualizarDesignacion(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, payload);
  }

  // -------------------------------------------------------
  // ✨ 6. Eliminar designación
  // -------------------------------------------------------
  eliminarDesignacion(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
