import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { JwtHelperService } from "@auth0/angular-jwt";

// Interface
import { TramiteMPV, TramiteMPVResponse } from '../interfaces/tramiteMPV';

// Environment
import { environment } from '@environments/environment';
import { AdminUser } from '../interfaces/adminUser';
import { UpdateTramitePayload } from '../interfaces/tramite-update.interface';


@Injectable({ providedIn: 'root' })
export class TramiteMPVService {
  // 1.- Enviroment
  envs = environment;

  // 2.- variables publicas
  private url: string = this.envs.main_url_prueba + 'tramitesMPV';

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
  registrarTramite(formData: FormData): Observable<any> {
    return this.http.post(`${this.url}/registrar`, formData);
  }


  // ===========================================================
  // 2.- Obtener por numero
  // ===========================================================
  obtenerPorNumero(numero: string) {
    // return this.http.get<TramiteMPV>(`${this.url}/estado/${numero}`);
    // return this.http.get<any>(`${this.url}/estado`, {
    //   params: { numero }
    // });
    return this.http.get<any>(`${this.url}/estado?numero=${encodeURIComponent(numero)}`);
  }

  // ===========================================================
  // 3.- Listar tramites con paginación
  // ===========================================================
  listarTramites(filtros: {
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
      `${this.url}/listar`,
      { params, headers }
    );
  }

  // listarTramites(filtros: any): Observable<TramiteMPVResponse> {
  //   let params = new HttpParams();

  //   Object.keys(filtros).forEach(key => {
  //     if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
  //       params = params.set(key, filtros[key]);
  //     }
  //   });

  //   const headers = this.getAuthHeaders().headers;

  //   return this.http.get<TramiteMPVResponse>(`${this.url}/listar`, { params, headers });
  // }

  // ===========================================================
  // 4.- Obtener Tramites aprobados
  // ===========================================================
  getTramitesAprobados() {
    const headers = this.getAuthHeaders().headers; // extrae solo los headers
    return this.http.get(`${this.url}/listar?estado=aprobada`, { headers });
  }

  // ===========================================================
  // 5.- Actualizar estado
  // ===========================================================
  actualizarEstado(id: number, payload: UpdateTramitePayload): Observable<any> {
    const headers = this.getAuthHeaders().headers;
    return this.http.put(`${this.url}/actualizar/${id}`, payload, { headers });
  }
}
