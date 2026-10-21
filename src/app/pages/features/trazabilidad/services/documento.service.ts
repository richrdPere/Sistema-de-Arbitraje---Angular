
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
import { ActualizarDocumentoMetadatosRequest, ActualizarDocumentoMetadatosResponse, CambiarDocumentoEstadoRequest, CambiarDocumentoEstadoResponse, CrearDocumentoVersionRequest, CrearDocumentoVersionResponse, GetDocumentoAccesoFilters, GetDocumentoAccesoResponse, GetDocumentosByExpedienteFilters, GetDocumentosByExpedienteResponse, GetDocumentosByTramiteFilters, GetDocumentosByTramiteResponse, GetDocumentosPaginatedFilters, GetDocumentosPaginatedResponse, SubirDocumentoRequest, SubirDocumentoResponse } from '../interfaces/documentos';

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {
  // *********************************************************
  // ENDPOINTS
  // *********************************************************
  private readonly API_BASE: string = environment.main_url + 'documentos';

  private readonly API_SUBIR_DOCUMENTO = this.API_BASE + '/create';
  private readonly API_GET_DOCUMENTOS_PAGINATED = this.API_BASE + '/paginado';
  private readonly API_GET_DOCUMENTOS_BY_EXPEDIENTE = this.API_BASE + '/expediente/';
  private readonly API_GET_DOCUMENTOS_BY_TRAMITE = this.API_BASE + '/tramite/';
  private readonly API_CREAR_DOCUMENTO_VERSION = this.API_BASE + '/';
  private readonly API_ACTUALIZAR_DOCUMENTO_METADATOS = this.API_BASE + '/update/';
  private readonly API_CAMBIAR_DOCUMENTO_ESTADO = this.API_BASE + '/';
  private readonly API_GET_DOCUMENTO_ACCESO = this.API_BASE + '/';

  constructor(
    private readonly http: HttpClient,
    private readonly authStorage: AuthStorageService
  ) { }

  // *********************************************************
  // 1. SUBIR DOCUMENTO
  // *********************************************************
  subirDocumento(
    request: SubirDocumentoRequest,
    archivo: File,
  ): Observable<SubirDocumentoResponse> {
    const headers = HttpServiceHelper.getMultipartHeaders({
      token: this.authStorage.getAccessToken(),
    });

    const formData = new FormData();

    formData.append(
      'titulo',
      request.titulo.trim(),
    );

    if (request.descripcion != null) {
      formData.append(
        'descripcion',
        request.descripcion.trim(),
      );
    }

    formData.append(
      'tipo_documento',
      request.tipo_documento,
    );

    formData.append(
      'expediente_id',
      String(request.expediente_id),
    );

    formData.append(
      'archivo',
      archivo,
      archivo.name,
    );

    return this.http
      .post<SubirDocumentoResponse>(
        this.API_SUBIR_DOCUMENTO,
        formData,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo subir el documento.',
          ),
        ),
      );
  }

  // *********************************************************
  // 2. OBTENER DOCUMENTOS PAGINADOS
  // *********************************************************
  getDocumentosPaginated(
    filters: GetDocumentosPaginatedFilters = {},
  ): Observable<GetDocumentosPaginatedResponse> {
    const headers = this.getJsonHeaders();
    const params = HttpServiceHelper.buildParams(filters);

    return this.http
      .get<GetDocumentosPaginatedResponse>(
        this.API_GET_DOCUMENTOS_PAGINATED,
        { headers, params },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudieron obtener los documentos.',
          ),
        ),
      );
  }

  // *********************************************************
  // 3. OBTENER DOCUMENTOS POR EXPEDIENTE
  // *********************************************************
  getDocumentosByExpediente(
    idExpediente: number,
    filters: GetDocumentosByExpedienteFilters = {},
  ): Observable<GetDocumentosByExpedienteResponse> {
    const headers = this.getJsonHeaders();
    const params = HttpServiceHelper.buildParams(filters);

    return this.http
      .get<GetDocumentosByExpedienteResponse>(
        `${this.API_GET_DOCUMENTOS_BY_EXPEDIENTE}${encodeURIComponent(String(idExpediente))}`,
        { headers, params },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudieron obtener los documentos del expediente.',
          ),
        ),
      );
  }

  // *********************************************************
  // 4. OBTENER DOCUMENTOS POR TRÁMITE
  // *********************************************************
  getDocumentosByTramite(
    idTramite: number,
    filters: GetDocumentosByTramiteFilters = {},
  ): Observable<GetDocumentosByTramiteResponse> {
    const headers = this.getJsonHeaders();
    const params = HttpServiceHelper.buildParams(filters);

    return this.http
      .get<GetDocumentosByTramiteResponse>(
        `${this.API_GET_DOCUMENTOS_BY_TRAMITE}${encodeURIComponent(String(idTramite))}`,
        { headers, params },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudieron obtener los documentos del trámite.',
          ),
        ),
      );
  }

  // *********************************************************
  // 5. CREAR NUEVA VERSIÓN DEL DOCUMENTO
  // *********************************************************
  crearDocumentoVersion(
    idDocumento: number,
    request: CrearDocumentoVersionRequest,
    archivo: File,
  ): Observable<CrearDocumentoVersionResponse> {
    const headers = HttpServiceHelper.getMultipartHeaders({
      token: this.authStorage.getAccessToken(),
    });

    const formData = new FormData();

    if (request.titulo !== undefined) {
      formData.append(
        'titulo',
        request.titulo.trim(),
      );
    }

    if (request.descripcion !== undefined) {
      // Una cadena vacía permite solicitar limpiar la descripción,
      // si el validador del backend la normaliza como null.
      formData.append(
        'descripcion',
        request.descripcion?.trim() ?? '',
      );
    }

    formData.append(
      'archivo',
      archivo,
      archivo.name,
    );

    return this.http
      .post<CrearDocumentoVersionResponse>(
        `${this.API_CREAR_DOCUMENTO_VERSION}${encodeURIComponent(String(idDocumento))}/versiones`,
        formData,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo crear la nueva versión del documento.',
          ),
        ),
      );
  }

  // *********************************************************
  // 6. ACTUALIZAR METADATOS DEL DOCUMENTO
  // *********************************************************
  updateDocumentoMetadatos(
    idDocumento: number,
    request: ActualizarDocumentoMetadatosRequest,
  ): Observable<ActualizarDocumentoMetadatosResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .patch<ActualizarDocumentoMetadatosResponse>(
        `${this.API_ACTUALIZAR_DOCUMENTO_METADATOS}${encodeURIComponent(String(idDocumento))}`,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudieron actualizar los metadatos del documento.',
          ),
        ),
      );
  }

  // *********************************************************
  // 7. CAMBIAR ESTADO DEL DOCUMENTO
  // *********************************************************
  cambiarDocumentoEstado(
    idDocumento: number,
    request: CambiarDocumentoEstadoRequest,
  ): Observable<CambiarDocumentoEstadoResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .patch<CambiarDocumentoEstadoResponse>(
        `${this.API_CAMBIAR_DOCUMENTO_ESTADO}${encodeURIComponent(String(idDocumento))}/estado`,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo cambiar el estado del documento.',
          ),
        ),
      );
  }

  // *********************************************************
  // 8. OBTENER ACCESO TEMPORAL AL DOCUMENTO
  // *********************************************************
  getDocumentoAcceso(
    idDocumento: number,
    filters: GetDocumentoAccesoFilters = {
      disposicion: 'inline',
    },
  ): Observable<GetDocumentoAccesoResponse> {
    const headers = this.getJsonHeaders();
    const params = HttpServiceHelper.buildParams(filters);

    return this.http
      .get<GetDocumentoAccesoResponse>(
        `${this.API_GET_DOCUMENTO_ACCESO}${encodeURIComponent(String(idDocumento))}/acceso`,
        { headers, params },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo obtener el acceso temporal al documento.',
          ),
        ),
      );
  }

  // *********************************************************
  // 9. OBTENER ACCESO TEMPORAL PARA DESCARGAR DOCUMENTO
  // *********************************************************

  getDocumentoDescarga(
    idDocumento: number,
  ): Observable<GetDocumentoAccesoResponse> {
    return this.getDocumentoAcceso(
      idDocumento,
      { disposicion: 'attachment' },
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

}

// import { Injectable } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Observable } from 'rxjs';


// // Environment
// import { environment } from 'src/environments/environment';


// @Injectable({
//   providedIn: 'root',
// })
// export class DocumentoService {

//   // 1.- Environment
//   envs = environment;

//   // 2.- variables publicas
//   private url: string = this.envs.main_url_prueba + 'documentos';

//   constructor(private http: HttpClient) { }


//   // =====================================================
//   // 1. ELIMINAR DOCUMENTO POR ID
//   // =====================================================
//   eliminarDocumento(id: number): Observable<any> {
//     return this.http.delete<any>(`${this.url}/${id}`);
//   }
// }
