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
  API_ANULAR_EXPEDIENTE: string = this.API_BASE + '/anular/';
  API_ARCHIVAR_EXPEDIENTE: string = this.API_BASE + '/archivar/';
  API_ELIMINAR_EXPEDIENTE: string = this.API_BASE + '/eliminar/';

  // Documentos
  API_NUEVO_DOCUMENTO: string = this.API_BASE + '/nuevo_doc/';
  API_LISTAR_DOCUMENTO: string = this.API_BASE + '/lista_doc/';


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


  // - Header file
  private getAuthHeadersFile(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');

    let headers = new HttpHeaders();

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

  // ===========================================================
  // 2.- Listar expedientes + paginado
  // ===========================================================
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

  // ===========================================================
  // 3.- Obtener expediente por ID
  // ===========================================================
  getExpedienteById(id: number): Observable<any> {
    return this.http.get(`${this.API_GET_EXPEDIENTE_BY_ID}${id}`, this.getAuthHeaders());
  }

  // ===========================================================
  // 4.- Actualizar expediente
  // ===========================================================
  updateExpediente(id: number, data: any): Observable<any> {
    return this.http.put(`${this.API_UPDATE_EXPEDIENTE}${id}`, data, this.getAuthHeaders());
  }

  // ===========================================================
  // 5.- Eliminar expediente
  // ===========================================================
  deleteExpediente(id: number): Observable<any> {
    return this.http.delete(`${this.API_DELETE_EXPEDIENTE}${id}`, this.getAuthHeaders());
  }

  // ===========================================================
  // 6.- BUSCAR EXPEDIENTE
  // ===========================================================
  buscarExpedientes(query: string): Observable<any> {
    return this.http.get(`${this.API_BASE}/buscar?query=${query}`, this.getAuthHeaders());
  }

  // ===========================================================
  // 7.- OBTENER EXPEDIENTE POR NÚMERO
  // ===========================================================
  obtenerExpedientePorNumero(numero: string): Observable<any> {
    return this.http.get(`${this.API_BASE}/numero/${numero}`, this.getAuthHeaders());
  }

  // ===========================================================
  // 8.- ANULAR EXPEDIENTE
  // ===========================================================
  anularExpediente(id: number): Observable<any> {
    return this.http.patch(`${this.API_ANULAR_EXPEDIENTE}${id}`, this.getAuthHeaders());
  }

  // ===========================================================
  // 9.- ARCHIVAR EXPEDIENTE
  // ===========================================================
  archivarExpediente(id: number): Observable<any> {
    return this.http.patch(`${this.API_ARCHIVAR_EXPEDIENTE}${id}`, this.getAuthHeaders());
  }

  // ===========================================================
  // 10.- ELIMINAR EXPEDIENTE
  // ===========================================================
  eliminarExpediente(id: number): Observable<any> {
    return this.http.delete(`${this.API_ELIMINAR_EXPEDIENTE}${id}`, this.getAuthHeaders());
  }


  // *****************************************************
  // 9.- DOCUMENTOS
  // *****************************************************
  subirDocumento(id: number, data: FormData): Observable<any> {
    return this.http.post(
      `${this.API_NUEVO_DOCUMENTO}${id}`,
      data,
      this.getAuthHeadersFile()
    );
  }

  listarDocumentos(id: number, params: any): Observable<any> {

    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.get(
      `${this.API_LISTAR_DOCUMENTO}${id}`,
      {
        params: httpParams,
        headers: this.getAuthHeaders().headers
      }
    );
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
  // 10.- HISTORIAL
  // *****************************************************
  obtenerHistorial(idExpediente: number): Observable<any> {
    return this.http.get(`${this.API_BASE}/${idExpediente}/historial`, this.getAuthHeaders());
  }


  // ===========================================================
  // 11.- TRAZABILIDAD
  // ===========================================================
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





}
