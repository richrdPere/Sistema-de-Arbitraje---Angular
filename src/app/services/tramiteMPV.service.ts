import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
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

  // Obtener todos los trámites con paginación
  listarTramites(pagina: number = 1, limite: number = 20, rol: string): Observable<TramiteMPVResponse> {
    const params = new HttpParams()
      .set('page', pagina)
      .set('limit', limite)
      .set('rol', rol); //  o 'secretaria', según corresponda

    const headers = this.getAuthHeaders().headers; // extrae solo los headers

    console.log(' Enviando petición GET a:', `${this.url}/listar`);
    console.log(' Parámetros:', { page: pagina, limit: limite, rol });

    return this.http.get<TramiteMPVResponse>(`${this.url}/listar`, { params, headers }).pipe(
      tap((resp) => {
        console.log(' Respuesta del backend:', resp);
      })
    );
  }

  actualizarEstado(id: number, estado: string): Observable<any> {
    const headers = this.getAuthHeaders().headers;
    return this.http.put(`${this.url}/actualizar/${id}`, { estado }, { headers });
  }
  // actualizarEstado(id: number, body: any) {
  //   return this.http.put(`${this.url}/actualizar/${id}`, body, this.getAuthHeaders());
  // }
}
