import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';


// Environment
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExpedientesService {

  // 1.- Environment
  envs = environment;

  // 2.- variables publicas
  API_BASE: string = this.envs.main_url_prueba + 'expedientes';

  API_NEW_EXPEDIENTE: string = this.API_BASE + '/crear';
  API_GET_EXPEDIENTE_PAGINATED: string = this.API_BASE + '/paginado';
  API_GET_EXPEDIENTE_BY_ID: string = this.API_BASE + '/detalle/';
  API_UPDATE_EXPEDIENTE: string = this.API_BASE + '/editar/';
  API_DELETE_EXPEDIENTE: string = this.API_BASE + '/eliminar/';

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
  // 1.- Registrar expediente
  // ===========================================================
  newExpediente(data: any): Observable<any> {
    return this.http.post(this.API_NEW_EXPEDIENTE, data, this.getAuthHeaders());
  }

  // ===========================
  // 2.- Listar expedientes + paginado
  // ===========================
  getExpedientesPaginated(filters: {
    page?: number;
    limit?: number;
    nro_expediente?: string;
    mes?: number;
    anio?: number;
  }): Observable<any> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    const headers = this.getAuthHeaders().headers;

    return this.http.get<any>(this.API_GET_EXPEDIENTE_PAGINATED, { params, headers, });
  }

  // ===========================
  // 3.- Obtener expediente por ID
  // ===========================
  getExpedienteById(id: number): Observable<any> {
    return this.http.get(`${this.API_GET_EXPEDIENTE_BY_ID}${id}`, this.getAuthHeaders());
  }

  // ===========================
  // 4.- Actualizar expediente
  // ===========================
  updateExpediente(id: number, data: any): Observable<any> {
    return this.http.put(`${this.API_UPDATE_EXPEDIENTE}${id}`, data, this.getAuthHeaders());
  }

  // ===========================
  // 5.- Eliminar expediente
  // ===========================
  deleteExpediente(id: number): Observable<any> {
    return this.http.delete(`${this.API_DELETE_EXPEDIENTE}${id}`, this.getAuthHeaders());
  }

  // ===========================
  // 6.- BUSCAR EXPEDIENTE
  // ===========================
  buscarExpedientes(query: string): Observable<any> {
    return this.http.get(`${this.API_BASE}/buscar?query=${query}`, this.getAuthHeaders());
  }

  // ===========================
  // 7.- OBTENER EXPEDIENTE POR NÚMERO
  // ===========================
  obtenerExpedientePorNumero(numero: string): Observable<any> {
    return this.http.get(`${this.API_BASE}/numero/${numero}`, this.getAuthHeaders());
  }





  // *****************************************************
  //  8.- PARTICIPES
  // *****************************************************
  asignarParticipesYDesignacion(expediente_id: number, payload: any) {
    return this.http.post(`${this.API_BASE}/${expediente_id}/designacion`, payload, this.getAuthHeaders());
  }

  agregarParticipante(idExpediente: number, data: any): Observable<any> {
    return this.http.post(`${this.API_BASE}/${idExpediente}/participes`, data, this.getAuthHeaders());
  }

  listarParticipantes(idExpediente: number): Observable<any> {
    return this.http.get(`${this.API_BASE}/${idExpediente}/participes`, this.getAuthHeaders());
  }


  // *****************************************************
  // 9.- DOCUMENTOS
  // *****************************************************
  subirDocumento(idExpediente: number, data: any): Observable<any> {
    const token = localStorage.getItem('token'); // o donde guardes tu JWT

    return this.http.post(
      `${this.API_BASE}/${idExpediente}/documentos`,
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
    return this.http.get(`${this.API_BASE}/${idExpediente}/documentos`, this.getAuthHeaders());
  }

  // *****************************************************
  // 10.- HISTORIAL
  // *****************************************************
  obtenerHistorial(idExpediente: number): Observable<any> {
    return this.http.get(`${this.API_BASE}/${idExpediente}/historial`, this.getAuthHeaders());
  }


  // ===========================
  // 11.- TRAZABILIDAD
  // ===========================
  obtenerTrazabilidad(id: number): Observable<any> {
    return this.http.get(
      `${this.API_BASE}/${id}/trazabilidad`,
      this.getAuthHeaders()
    );
  }

  obtenerPartesYResumen(id: number): Observable<any> {
    return this.http.get(
      `${this.API_BASE}/${id}/partes-resumen`,
      this.getAuthHeaders()
    );
  }


  anularExpediente(id: number): Observable<any> {
    return this.http.patch(
      `${this.API_BASE}/${id}/anular`,
      this.getAuthHeaders()
    );
  }


}
