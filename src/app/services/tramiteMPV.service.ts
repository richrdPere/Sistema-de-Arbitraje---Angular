import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { JwtHelperService } from "@auth0/angular-jwt";

// Interface
import { TramiteMPV, TramiteMPVResponse } from '../interfaces/tramiteMPV';

// Environment
import { environment } from '@environments/environment';
import { AdminUser } from '../interfaces/adminUser';


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

  obtenerPorNumero(numero: string) {
    // return this.http.get<TramiteMPV>(`${this.url}/estado/${numero}`);
    // return this.http.get<any>(`${this.url}/estado`, {
    //   params: { numero }
    // });
    return this.http.get<any>(`${this.url}/estado?numero=${encodeURIComponent(numero)}`);
  }

  // listar(params?: any) {
  //   const httpParams = new HttpParams({ fromObject: params || {} });
  //   return this.http.get(`${this.url}/listar`, { params: httpParams }, );
  // }
  // listarTramites() {
  //   return this.http.get<{ count: number, rows: any[] }>(`${this.url}/listar`, this.getAuthHeaders());
  // }

  // Obtener todos los trámites con paginación
  listarTramites(pagina: number = 1, limite: number = 20): Observable<TramiteMPVResponse> {
    const params = new HttpParams()
      .set('pagina', pagina)
      .set('limite', limite);

    const headers = this.getAuthHeaders().headers; // extrae solo los headers

    return this.http.get<TramiteMPVResponse>(`${this.url}/listar`, { params, headers });
  }

  actualizarEstado(id: number, estado: string): Observable<any> {
    const headers = this.getAuthHeaders().headers;
    return this.http.put(`${this.url}/actualizar/${id}`, { estado }, { headers });
  }
  // actualizarEstado(id: number, body: any) {
  //   return this.http.put(`${this.url}/actualizar/${id}`, body, this.getAuthHeaders());
  // }
}
