import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

// Environment
import { environment } from '@environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PersonaService {

  // 1.- Enviroment
  envs = environment;

  // 2.- variables publicas
  API_BASE: string = this.envs.main_url_prueba + 'personas';

  API_NEW_PERSONA: string = this.API_BASE + '/crear';
  API_BUSCAR_PERSONA: string = this.API_BASE + '/buscar';
  API_GET_ALL_PERSONAS: string = this.API_BASE + '/personas';
  API_UPDATE_PERSONA: string = this.API_BASE + '/editar/';
  API_DELETE_PERSONA: string = this.API_BASE + '/eliminar/';

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
  // 1.- Registrar persona
  // ===========================================================
  newPersona(data: any): Observable<any> {
    return this.http.post<any>(
      this.API_NEW_PERSONA, data, this.getAuthHeaders()
    );
  }

  // ===========================================================
  // 2.- Buscar persona (DNI / RUC)
  // ===========================================================
  searchPersona(params: { dni?: string; ruc?: string }): Observable<any> {

    let httpParams = new HttpParams();

    if (params.dni) {
      httpParams = httpParams.set('dni', params.dni);
    }

    if (params.ruc) {
      httpParams = httpParams.set('ruc', params.ruc);
    }

    return this.http.get<any>(
      this.API_BUSCAR_PERSONA,
      {
        params: httpParams,
      }
    );
  }

  // ===========================================================
  // 3.- Listar personas (con filtro opcional)
  // ===========================================================
  getPersonas(search?: string): Observable<any> {

    let httpParams = new HttpParams();

    if (search) {
      httpParams = httpParams.set('search', search);
    }

    return this.http.get<any>(
      this.API_GET_ALL_PERSONAS,
      {
        params: httpParams,
        ...this.getAuthHeaders()
      }
    );
  }

  // ===========================================================
  // 4.- Actualizar persona
  // ===========================================================
  updatePersona(id: number, data: any): Observable<any> {
    return this.http.put<any>(
      `${this.API_UPDATE_PERSONA}${id}`,
      data,
      this.getAuthHeaders()
    );
  }

  // ===========================================================
  // 5.- Eliminar persona
  // ===========================================================
  deletePersona(id: number): Observable<any> {
    return this.http.delete<any>(
      `${this.API_DELETE_PERSONA}${id}`,
      this.getAuthHeaders()
    );
  }

}
