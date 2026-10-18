import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';

// Environment
import { environment } from 'src/environments/environment';

// Service
import { AuthStorageService } from 'src/app/core/auth/auth-storage.service';

// Helper
import { HttpServiceHelper } from 'src/app/core/auth/http-service.helper';

// Interfaces
import { AnularExpedienteRequest, AnularExpedienteResponse, ArchivarExpedienteRequest, ArchivarExpedienteResponse, AsignarExpedienteResponsableRequest, AsignarExpedienteResponsableResponse, CerrarExpedienteRequest, CerrarExpedienteResponse, ChangeExpedienteEstadoProcesalRequest, ChangeExpedienteEstadoProcesalResponse, ChangeExpedienteEstadoRequest, ChangeExpedienteEstadoResponse, CreateExpedienteRequest, CreateExpedienteResponse, ExpedienteHistorialFilters, ExpedientesPaginadosFilters, ExpedientesPaginadosResponse, GetExpedienteByIdResponse, GetExpedienteByNumeroResponse, GetExpedienteHistorialResponse, GetExpedienteTrazabilidadResponse, ReabrirExpedienteRequest, ReabrirExpedienteResponse, ReanudarExpedienteRequest, ReanudarExpedienteResponse, UpdateExpedienteRequest, UpdateExpedienteResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ExpedientesService {
  // *********************************************************
  // ENDPOINTS
  // *********************************************************
  private readonly API_BASE: string = environment.main_url + 'expedientes';

  private readonly API_CREATE_EXPEDIENTE = this.API_BASE + '/create';
  private readonly API_GET_EXPEDIENTES_PAGINADOS = this.API_BASE + '/paginado';
  private readonly API_GET_EXPEDIENTE_BY_ID = this.API_BASE + '/view/';
  private readonly API_GET_EXPEDIENTE_BY_NUMERO = this.API_BASE + '/numero/';
  private readonly API_UPDATE_EXPEDIENTE = this.API_BASE + '/update/';
  private readonly API_ASIGNAR_EXPEDIENTE_RESPONSABLE = this.API_BASE + '/';
  private readonly API_CHANGE_EXPEDIENTE_ESTADO_PROCESAL = this.API_BASE + '/';
  private readonly API_CHANGE_EXPEDIENTE_ESTADO = this.API_BASE + '/';
  private readonly API_CERRAR_EXPEDIENTE = this.API_BASE + '/';
  private readonly API_ARCHIVAR_EXPEDIENTE = this.API_BASE + '/';
  private readonly API_REABRIR_EXPEDIENTE = this.API_BASE + '/';
  private readonly API_ANULAR_EXPEDIENTE = this.API_BASE + '/';
  private readonly API_GET_EXPEDIENTE_HISTORIAL = this.API_BASE + '/';
  private readonly API_GET_EXPEDIENTE_TRAZABILIDAD = this.API_BASE + '/';

  constructor(
    private readonly http: HttpClient,
    private readonly authStorage: AuthStorageService
  ) { }

  // *********************************************************
  // 1. CREAR EXPEDIENTE MANUAL
  // *********************************************************
  createExpediente(
    request: CreateExpedienteRequest,
  ): Observable<CreateExpedienteResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .post<CreateExpedienteResponse>(
        this.API_CREATE_EXPEDIENTE,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo registrar el expediente.',
          ),
        ),
      );
  }

  // *********************************************************
  // 2. OBTENER EXPEDIENTES PAGINADOS
  // *********************************************************
  getExpedientesPaginados(
    filters: ExpedientesPaginadosFilters = {},
  ): Observable<ExpedientesPaginadosResponse> {
    const headers = this.getJsonHeaders();
    const params = HttpServiceHelper.buildParams(filters);

    return this.http
      .get<ExpedientesPaginadosResponse>(
        this.API_GET_EXPEDIENTES_PAGINADOS,
        { headers, params },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudieron obtener los expedientes.',
          ),
        ),
      );
  }

  // *********************************************************
  // 3. OBTENER EXPEDIENTE POR ID
  // *********************************************************
  getExpedienteById(
    idExpediente: number,
  ): Observable<GetExpedienteByIdResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .get<GetExpedienteByIdResponse>(
        `${this.API_GET_EXPEDIENTE_BY_ID}${encodeURIComponent(String(idExpediente))}`,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo obtener el expediente.',
          ),
        ),
      );
  }

  // *********************************************************
  // 4. OBTENER EXPEDIENTE POR NÚMERO
  // *********************************************************
  getExpedienteByNumero(
    numeroExpediente: string,
  ): Observable<GetExpedienteByNumeroResponse> {
    const headers = this.getJsonHeaders();

    const numeroCodificado = encodeURIComponent(
      numeroExpediente.trim(),
    );

    return this.http
      .get<GetExpedienteByNumeroResponse>(
        `${this.API_GET_EXPEDIENTE_BY_NUMERO}${numeroCodificado}`,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo obtener el expediente por su número.',
          ),
        ),
      );
  }

  // *********************************************************
  // 5. ACTUALIZAR DATOS GENERALES DEL EXPEDIENTE
  // *********************************************************
  updateExpediente(
    idExpediente: number,
    request: UpdateExpedienteRequest,
  ): Observable<UpdateExpedienteResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .patch<UpdateExpedienteResponse>(
        `${this.API_UPDATE_EXPEDIENTE}${encodeURIComponent(String(idExpediente))}`,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo actualizar el expediente.',
          ),
        ),
      );
  }

  // *********************************************************
  // 6. ASIGNAR O RETIRAR RESPONSABLE DEL EXPEDIENTE
  // *********************************************************
  asignarExpedienteResponsable(
    idExpediente: number,
    request: AsignarExpedienteResponsableRequest,
  ): Observable<AsignarExpedienteResponsableResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .patch<AsignarExpedienteResponsableResponse>(
        `${this.API_ASIGNAR_EXPEDIENTE_RESPONSABLE}${encodeURIComponent(String(idExpediente))}/responsable`,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo actualizar la asignación del responsable.',
          ),
        ),
      );
  }

  // *********************************************************
  // 7. CAMBIAR ESTADO PROCESAL DEL EXPEDIENTE
  // *********************************************************
  changeExpedienteEstadoProcesal(
    idExpediente: number,
    request: ChangeExpedienteEstadoProcesalRequest,
  ): Observable<ChangeExpedienteEstadoProcesalResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .patch<ChangeExpedienteEstadoProcesalResponse>(
        `${this.API_CHANGE_EXPEDIENTE_ESTADO_PROCESAL}${encodeURIComponent(String(idExpediente))}/estado-procesal`,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo actualizar el estado procesal del expediente.',
          ),
        ),
      );
  }

  // *********************************************************
  // 8. CAMBIAR ESTADO GENERAL DEL EXPEDIENTE
  // *********************************************************
  changeExpedienteEstado(
    idExpediente: number,
    request: ChangeExpedienteEstadoRequest,
  ): Observable<ChangeExpedienteEstadoResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .patch<ChangeExpedienteEstadoResponse>(
        `${this.API_CHANGE_EXPEDIENTE_ESTADO}${encodeURIComponent(String(idExpediente))}/estado`,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo actualizar el estado del expediente.',
          ),
        ),
      );
  }

  // *********************************************************
  // 9. REANUDAR EXPEDIENTE SUSPENDIDO
  // *********************************************************
  reanudarExpediente(
    idExpediente: number,
    request: ReanudarExpedienteRequest,
  ): Observable<ReanudarExpedienteResponse> {
    return this.changeExpedienteEstado(
      idExpediente,
      {
        estado: 'EN_TRAMITE',
        motivo: request.motivo,
      },
    );
  }

  // *********************************************************
  // 10. CERRAR EXPEDIENTE
  // *********************************************************
  cerrarExpediente(
    idExpediente: number,
    request: CerrarExpedienteRequest,
  ): Observable<CerrarExpedienteResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .patch<CerrarExpedienteResponse>(
        `${this.API_CERRAR_EXPEDIENTE}${encodeURIComponent(String(idExpediente))}/cerrar`,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo cerrar el expediente.',
          ),
        ),
      );
  }

  // *********************************************************
  // 11. ARCHIVAR EXPEDIENTE
  // *********************************************************
  archivarExpediente(
    idExpediente: number,
    request: ArchivarExpedienteRequest,
  ): Observable<ArchivarExpedienteResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .patch<ArchivarExpedienteResponse>(
        `${this.API_ARCHIVAR_EXPEDIENTE}${encodeURIComponent(String(idExpediente))}/archivar`,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo archivar el expediente.',
          ),
        ),
      );
  }

  // *********************************************************
  // 12. REABRIR EXPEDIENTE
  // *********************************************************
  reabrirExpediente(
    idExpediente: number,
    request: ReabrirExpedienteRequest,
  ): Observable<ReabrirExpedienteResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .patch<ReabrirExpedienteResponse>(
        `${this.API_REABRIR_EXPEDIENTE}${encodeURIComponent(String(idExpediente))}/reabrir`,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo reabrir el expediente.',
          ),
        ),
      );
  }

  // *********************************************************
  // 13. ANULAR EXPEDIENTE
  // *********************************************************
  anularExpediente(
    idExpediente: number,
    request: AnularExpedienteRequest,
  ): Observable<AnularExpedienteResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .patch<AnularExpedienteResponse>(
        `${this.API_ANULAR_EXPEDIENTE}${encodeURIComponent(String(idExpediente))}/anular`,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo anular el expediente.',
          ),
        ),
      );
  }

  // *********************************************************
  // 14. OBTENER HISTORIAL PAGINADO DEL EXPEDIENTE
  // *********************************************************
  getExpedienteHistorial(
    idExpediente: number,
    filters: ExpedienteHistorialFilters = {},
  ): Observable<GetExpedienteHistorialResponse> {
    const headers = this.getJsonHeaders();
    const params = HttpServiceHelper.buildParams(filters);

    return this.http
      .get<GetExpedienteHistorialResponse>(
        `${this.API_GET_EXPEDIENTE_HISTORIAL}${encodeURIComponent(String(idExpediente))}/historial`,
        { headers, params },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo obtener el historial del expediente.',
          ),
        ),
      );
  }

  // *********************************************************
  // 15. OBTENER TRAZABILIDAD DEL EXPEDIENTE
  // *********************************************************
  getExpedienteTrazabilidad(
    idExpediente: number,
  ): Observable<GetExpedienteTrazabilidadResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .get<GetExpedienteTrazabilidadResponse>(
        `${this.API_GET_EXPEDIENTE_TRAZABILIDAD}${encodeURIComponent(String(idExpediente))}/trazabilidad`,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo obtener la trazabilidad del expediente.',
          ),
        ),
      );
  }

  // *********************************************************
  // MÉTODOS PRIVADOS
  // *********************************************************
  private getJsonHeaders(): HttpHeaders {
    return HttpServiceHelper.getHeaders({
      token: this.authStorage.getAccessToken(),
    });
  }

  // // Documentos
  // API_NUEVO_DOCUMENTO: string = this.API_BASE + '/nuevo_doc/';
  // API_LISTAR_DOCUMENTO: string = this.API_BASE + '/lista_doc/';

  // // Participes
  // API_GET_PARTICIPES: string = this.API_BASE + '/participes/'


  // constructor(private http: HttpClient) { }

  // // ======= HEADER CON TOKEN =======

  // // - Auth Headers
  // private getAuthHeaders(): { headers: HttpHeaders } {
  //   const token = localStorage.getItem('token'); // o sessionStorage según tu login
  //   let headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //   });

  //   if (token) {
  //     headers = headers.set('Authorization', `Bearer ${token}`);
  //   }

  //   return { headers };
  // }


  // // - Header file
  // private getAuthHeadersFile(): { headers: HttpHeaders } {
  //   const token = localStorage.getItem('token');

  //   let headers = new HttpHeaders();

  //   if (token) {
  //     headers = headers.set('Authorization', `Bearer ${token}`);
  //   }

  //   return { headers };
  // }

  // // ===========================================================
  // // 1.- Registrar expediente
  // // ===========================================================
  // newExpediente(data: any): Observable<any> {
  //   return this.http.post(this.API_NEW_EXPEDIENTE, data, this.getAuthHeaders());
  // }

  // // ===========================================================
  // // 2.- Listar expedientes + paginado
  // // ===========================================================
  // getExpedientesPaginated(filters: {
  //   page?: number;
  //   limit?: number;
  //   nro_expediente?: string;
  //   mes?: number;
  //   anio?: number;
  // }): Observable<any> {
  //   let params = new HttpParams();

  //   Object.entries(filters).forEach(([key, value]) => {
  //     if (value !== null && value !== undefined && value !== '') {
  //       params = params.set(key, value.toString());
  //     }
  //   });

  //   const headers = this.getAuthHeaders().headers;

  //   return this.http.get<any>(this.API_GET_EXPEDIENTE_PAGINATED, { params, headers, });
  // }

  // // ===========================================================
  // // 3.- Obtener expediente por ID
  // // ===========================================================
  // getExpedienteById(id: number): Observable<any> {
  //   return this.http.get(`${this.API_GET_EXPEDIENTE_BY_ID}${id}`, this.getAuthHeaders());
  // }

  // // ===========================================================
  // // 4.- Actualizar expediente
  // // ===========================================================
  // updateExpediente(id: number, data: any): Observable<any> {
  //   return this.http.put(`${this.API_UPDATE_EXPEDIENTE}${id}`, data, this.getAuthHeaders());
  // }

  // // ===========================================================
  // // 5.- Eliminar expediente
  // // ===========================================================
  // deleteExpediente(id: number): Observable<any> {
  //   return this.http.delete(`${this.API_DELETE_EXPEDIENTE}${id}`, this.getAuthHeaders());
  // }

  // // ===========================================================
  // // 6.- BUSCAR EXPEDIENTE
  // // ===========================================================
  // buscarExpedientes(query: string): Observable<any> {
  //   return this.http.get(`${this.API_BASE}/buscar?query=${query}`, this.getAuthHeaders());
  // }

  // // ===========================================================
  // // 7.- OBTENER EXPEDIENTE POR NÚMERO
  // // ===========================================================
  // obtenerExpedientePorNumero(numero: string): Observable<any> {
  //   return this.http.get(`${this.API_BASE}/numero/${numero}`, this.getAuthHeaders());
  // }

  // // ===========================================================
  // // 8.- ANULAR EXPEDIENTE
  // // ===========================================================
  // anularExpediente(id: number): Observable<any> {
  //   return this.http.patch(`${this.API_ANULAR_EXPEDIENTE}${id}`, this.getAuthHeaders());
  // }

  // // ===========================================================
  // // 9.- ARCHIVAR EXPEDIENTE
  // // ===========================================================
  // archivarExpediente(id: number): Observable<any> {
  //   return this.http.patch(`${this.API_ARCHIVAR_EXPEDIENTE}${id}`, this.getAuthHeaders());
  // }

  // // ===========================================================
  // // 10.- ELIMINAR EXPEDIENTE
  // // ===========================================================
  // eliminarExpediente(id: number): Observable<any> {
  //   return this.http.delete(`${this.API_ELIMINAR_EXPEDIENTE}${id}`, this.getAuthHeaders());
  // }


  // // *****************************************************
  // // 9.- DOCUMENTOS
  // // *****************************************************
  // subirDocumento(id: number, data: FormData): Observable<any> {
  //   return this.http.post(
  //     `${this.API_NUEVO_DOCUMENTO}${id}`,
  //     data,
  //     this.getAuthHeadersFile()
  //   );
  // }

  // listarDocumentos(id: number, params: any): Observable<any> {

  //   let httpParams = new HttpParams();

  //   Object.keys(params).forEach(key => {
  //     if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
  //       httpParams = httpParams.set(key, params[key]);
  //     }
  //   });

  //   return this.http.get(
  //     `${this.API_LISTAR_DOCUMENTO}${id}`,
  //     {
  //       params: httpParams,
  //       headers: this.getAuthHeaders().headers
  //     }
  //   );
  // }



  // // *****************************************************
  // //  10.- PARTICIPES
  // // *****************************************************
  // asignarParticipesYDesignacion(expediente_id: number, payload: any) {
  //   return this.http.post(`${this.API_BASE}/${expediente_id}/designacion`, payload, this.getAuthHeaders());
  // }

  // agregarParticipante(idExpediente: number, data: any): Observable<any> {
  //   return this.http.post(`${this.API_BASE}/${idExpediente}/participes`, data, this.getAuthHeaders());
  // }

  // listarParticipantes(id: number): Observable<any> {
  //   return this.http.get(`${this.API_GET_PARTICIPES}${id}`, this.getAuthHeaders());
  // }



  // // *****************************************************
  // // 10.- HISTORIAL
  // // *****************************************************
  // obtenerHistorial(idExpediente: number): Observable<any> {
  //   return this.http.get(`${this.API_BASE}/${idExpediente}/historial`, this.getAuthHeaders());
  // }


  // // ===========================================================
  // // 11.- TRAZABILIDAD
  // // ===========================================================
  // obtenerTrazabilidad(id: number): Observable<any> {
  //   return this.http.get(
  //     `${this.API_BASE}/${id}/trazabilidad`,
  //     this.getAuthHeaders()
  //   );
  // }

  // obtenerPartesYResumen(id: number): Observable<any> {
  //   return this.http.get(
  //     `${this.API_BASE}/${id}/partes-resumen`,
  //     this.getAuthHeaders()
  //   );
  // }





}
