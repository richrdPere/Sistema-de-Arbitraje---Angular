import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { JwtHelperService } from "@auth0/angular-jwt";

// Interface
import { TramiteMPV } from '../interfaces/tramiteMPV';

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
    return this.http.get<TramiteMPV>(`${this.url}/estado/${numero}`);
  }

  // listar(params?: any) {
  //   const httpParams = new HttpParams({ fromObject: params || {} });
  //   return this.http.get(`${this.url}/listar`, { params: httpParams }, );
  // }
  listarTramites() {
    return this.http.get<{ count: number, rows: any[] }>(`${this.url}/listar`, this.getAuthHeaders());
  }

  actualizarEstado(id: number, body: any) {
    return this.http.put(`${this.url}/actualizar/${id}`, body, this.getAuthHeaders());
  }
}
