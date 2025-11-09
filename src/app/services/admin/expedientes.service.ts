import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Environment
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExpedientesService {

  // 1.- Environment
  envs = environment;

  // 2.- variables publicas
  private url: string = this.envs.main_url_prueba + 'expedientes';

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
  // ===========================
  // 1.- CREAR EXPEDIENTE
  // ===========================
  crearExpediente(data: any): Observable<any> {
    return this.http.post(`${this.url}/`, data, this.getAuthHeaders());
  }

  // ===========================
  // 2.- LISTAR TODOS LOS EXPEDIENTES
  // ===========================
  listarExpedientes(rol: string): Observable<any> {
    const params = new HttpParams().set('rol', rol);

    const headers = this.getAuthHeaders().headers;

    return this.http.get(`${this.url}/`, { params, headers });
  }

  // getExpedientes(): Observable<Expediente[]> {
  //   return this.http.get<Expediente[]>(`${this.url}`);
  // }

  // ===========================
  // 3.- BUSCAR EXPEDIENTE
  // ===========================
  buscarExpedientes(query: string): Observable<any> {
    return this.http.get(`${this.url}/buscar?query=${query}`, this.getAuthHeaders());
  }

  // ===========================
  // 4.- OBTENER EXPEDIENTE POR ID
  // ===========================
  obtenerExpedientePorId(id: number): Observable<any> {
    return this.http.get(`${this.url}/${id}`, this.getAuthHeaders());
  }

  // ===========================
  // 5.- OBTENER EXPEDIENTE POR NÚMERO
  // ===========================
  obtenerExpedientePorNumero(numero: string): Observable<any> {
    return this.http.get(`${this.url}/numero/${numero}`, this.getAuthHeaders());
  }

  // ===========================
  // 6.- ACTUALIZAR EXPEDIENTE
  // ===========================
  actualizarExpediente(id: number, data: any): Observable<any> {
    return this.http.put(`${this.url}/${id}`, data, this.getAuthHeaders());
  }

  // ===========================
  // 7.- ELIMINAR EXPEDIENTE
  // ===========================
  eliminarExpediente(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`, this.getAuthHeaders());
  }

  // *****************************************************
  //  PARTICIPES
  // *****************************************************
  agregarParticipante(idExpediente: number, data: any): Observable<any> {
    return this.http.post(`${this.url}/${idExpediente}/participes`, data, this.getAuthHeaders());
  }

  listarParticipantes(idExpediente: number): Observable<any> {
    return this.http.get(`${this.url}/${idExpediente}/participes`, this.getAuthHeaders());
  }

  // *****************************************************
  //  DOCUMENTOS
  // *****************************************************
  subirDocumento(idExpediente: number, data: any): Observable<any> {
    const token = localStorage.getItem('token'); // o donde guardes tu JWT

    return this.http.post(
      `${this.url}/${idExpediente}/documentos`,
      data,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
        }),
      }
    );

    // return this.http.post(`${this.url}/${idExpediente}/documentos`, data, this.getAuthHeaders());
  }

  listarDocumentos(idExpediente: number): Observable<any> {
    return this.http.get(`${this.url}/${idExpediente}/documentos`, this.getAuthHeaders());
  }

  // *****************************************************
  //  HISTORIAL
  // *****************************************************
  obtenerHistorial(idExpediente: number): Observable<any> {
    return this.http.get(`${this.url}/${idExpediente}/historial`, this.getAuthHeaders());
  }
}
