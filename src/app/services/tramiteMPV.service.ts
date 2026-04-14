import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

// Interface
import { TramiteMPV, TramiteMPVResponse } from '../interfaces/tramiteMPV';

// Environment
import { environment } from '@environments/environment';
import { UpdateTramitePayload } from '../interfaces/tramite-update.interface';


@Injectable({ providedIn: 'root' })
export class TramiteMPVService {
  // 1.- Enviroment
  envs = environment;

  // 2.- variables publicas
  API_BASE: string = this.envs.main_url_prueba + 'tramitesMPV';

  API_NEW_TRAMITE: string = this.API_BASE + '/crear';
  API_GET_TRAMITE_BY_NUMERO: string = this.API_BASE + '/numero-tramite';
  API_GET_NUMERO_TRAMITE: string = this.API_BASE + '/preview-numero';
  API_GET_ALL_TRAMITES: string = this.API_BASE + '/paginado';
  API_UPDATE_TRAMITE: string = this.API_BASE + '/editar/';

  constructor(private http: HttpClient) { }

  // ======= HEADER CON TOKEN =======
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
  // 1.- Registrar tramite
  // ===========================================================
  newTramite(formData: FormData): Observable<any> {
    return this.http.post<any>(this.API_NEW_TRAMITE, formData);
  }

  // ===========================================================
  // 2.- Obtener por numero
  // ===========================================================
  obtenerPorNumero(numero: string) {
    return this.http.get<any>(this.API_GET_TRAMITE_BY_NUMERO + `?numero=${encodeURIComponent(numero)}`);
  }

  // ===========================================================
  // 3.- Listar tramites
  // ===========================================================
  listarTramitesPaginated(filtros: {
    page?: number;
    limit?: number;
    search?: string;
    estado?: string;
    tipo?: string;
    rol?: string;
    id_usuario?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Observable<TramiteMPVResponse> {

    let params = new HttpParams();

    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    const headers = this.getAuthHeaders().headers;

    return this.http.get<TramiteMPVResponse>(
      this.API_GET_ALL_TRAMITES,
      { params, headers }
    );
  }

  // ===========================================================
  // 4.- Obtener Tramites aprobados
  // ===========================================================
  getTramitesAprobados() {
    const headers = this.getAuthHeaders().headers; // extrae solo los headers
    return this.http.get(this.API_GET_ALL_TRAMITES + `?estado=aprobada`, { headers });
  }

  // ===========================================================
  // 5.- Actualizar estado
  // ===========================================================
  updateEstadoTramite(id: number, payload: UpdateTramitePayload): Observable<any> {
    const headers = this.getAuthHeaders().headers;
    return this.http.put(this.API_UPDATE_TRAMITE + `${id}`, payload, { headers });
  }

  // ===========================================================
  // 6.- Actualizar estado
  // ===========================================================

  previewNumeroTramite() {
    const headers = this.getAuthHeaders().headers; // extrae solo los headers
    return this.http.get<any>(
      this.API_GET_NUMERO_TRAMITE
    );
  }
}
