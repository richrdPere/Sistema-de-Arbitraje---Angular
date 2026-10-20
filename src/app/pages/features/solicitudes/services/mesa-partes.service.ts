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
import { AprobarTramiteRequest, AprobarTramiteResponse, ConsultarTramiteParams, ConsultarTramiteResponse, GetTramiteByIdResponse, GetTramitesPaginatedFilters, GetTramitesPaginatedResponse, PreviewNumeroTramiteFilters, PreviewNumeroTramiteResponse, RechazarTramiteRequest, RechazarTramiteResponse, RegisterTramitePublicoRequest, RegisterTramitePublicoResponse } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class MesaPartesService {
  // *********************************************************
  // ENDPOINTS
  // *********************************************************
  private readonly API_BASE: string = environment.main_url + 'mesa-partes';

  private readonly API_REGISTER_TRAMITE_PUBLICO = this.API_BASE + '/register-publico';
  private readonly API_PREVIEW_NUMERO_TRAMITE = this.API_BASE + '/numero-preview';
  private readonly API_GET_TRAMITES_PAGINATED = this.API_BASE + '/paginado';
  private readonly API_CONSULTAR_TRAMITE = this.API_BASE + '/consultar';
  private readonly API_GET_TRAMITE_BY_ID = this.API_BASE + '/view/';
  private readonly API_APROBAR_TRAMITE = this.API_BASE + '/';
  private readonly API_RECHAZAR_TRAMITE = this.API_BASE + '/';

  constructor(
    private readonly http: HttpClient,
    private readonly authStorage: AuthStorageService
  ) { }

  // *********************************************************
  // 1. REGISTRAR TRÁMITE PÚBLICO
  // *********************************************************
  registerTramitePublico(
    request: RegisterTramitePublicoRequest,
    archivos: readonly File[] = [],
  ): Observable<RegisterTramitePublicoResponse> {
    const headers = HttpServiceHelper.getMultipartHeaders();

    const formData = new FormData();

    formData.append(
      'data',
      JSON.stringify(request),
    );

    archivos.forEach((archivo) => {
      formData.append(
        'archivos',
        archivo,
        archivo.name,
      );
    });

    return this.http
      .post<RegisterTramitePublicoResponse>(
        this.API_REGISTER_TRAMITE_PUBLICO,
        formData,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo registrar el trámite.',
          ),
        ),
      );
  }

  // *********************************************************
  // 2. PREVIEW DEL NÚMERO DE TRÁMITE
  // *********************************************************
  previewNumeroTramite(
    filters: PreviewNumeroTramiteFilters = {},
  ): Observable<PreviewNumeroTramiteResponse> {
    const headers = HttpServiceHelper.getHeaders();
    const params = HttpServiceHelper.buildParams(filters);

    return this.http
      .get<PreviewNumeroTramiteResponse>(
        this.API_PREVIEW_NUMERO_TRAMITE,
        { headers, params },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo obtener el número referencial del trámite.',
          ),
        ),
      );
  }

  // *********************************************************
  // 3. OBTENER TRÁMITES PAGINADOS
  // *********************************************************
  getTramitesPaginated(
    filters: GetTramitesPaginatedFilters = {},
  ): Observable<GetTramitesPaginatedResponse> {
    const headers = this.getJsonHeaders();
    const params = HttpServiceHelper.buildParams(filters);

    return this.http
      .get<GetTramitesPaginatedResponse>(
        this.API_GET_TRAMITES_PAGINATED,
        { headers, params },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudieron obtener los trámites.',
          ),
        ),
      );
  }

  // *********************************************************
  // 4. CONSULTAR TRÁMITE POR NÚMERO
  // *********************************************************
  consultarTramite(
    request: ConsultarTramiteParams,
  ): Observable<ConsultarTramiteResponse> {
    // const headers = this.getJsonHeaders();
    const params = HttpServiceHelper.buildParams(request);

    return this.http
      .get<ConsultarTramiteResponse>(
        this.API_CONSULTAR_TRAMITE,
        // { headers, params },
        { params },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo consultar el trámite.',
          ),
        ),
      );
  }

  // *********************************************************
  // 5. OBTENER DETALLE DEL TRÁMITE
  // *********************************************************
  getTramiteById(
    idTramite: number,
  ): Observable<GetTramiteByIdResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .get<GetTramiteByIdResponse>(
        `${this.API_GET_TRAMITE_BY_ID}${encodeURIComponent(String(idTramite))}`,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo obtener el detalle del trámite.',
          ),
        ),
      );
  }

  // *********************************************************
  // 6. APROBAR TRÁMITE
  // *********************************************************
  aprobarTramite(
    idTramite: number,
    request: AprobarTramiteRequest = {},
  ): Observable<AprobarTramiteResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .patch<AprobarTramiteResponse>(
        `${this.API_APROBAR_TRAMITE}${encodeURIComponent(String(idTramite))}/aprobar`,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo aprobar el trámite.',
          ),
        ),
      );
  }

  // *********************************************************
  // 7. RECHAZAR TRÁMITE
  // *********************************************************
  rechazarTramite(
    idTramite: number,
    request: RechazarTramiteRequest,
  ): Observable<RechazarTramiteResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .patch<RechazarTramiteResponse>(
        `${this.API_RECHAZAR_TRAMITE}${encodeURIComponent(String(idTramite))}/rechazar`,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo rechazar el trámite.',
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
}
