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
import { ChangeCorreoUsuarioRequest, ChangeCorreoUsuarioResponse, ChangeEstadoUsuarioRequest, ChangeEstadoUsuarioResponse, ChangeRolUsuarioRequest, ChangeRolUsuarioResponse, CreateUsuarioRequest, CreateUsuarioResponse, ExisteCorreoFilters, ExisteCorreoResponse, GetUsuarioByIdResponse, UpdateUsuarioRequest, UpdateUsuarioResponse, UsuariosPaginatedFilters, UsuariosPaginatedResponse, UsuariosSelectorFilters, UsuariosSelectorResponse } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  // *********************************************************
  // ENDPOINTS
  // *********************************************************
  private readonly API_BASE: string = environment.main_url + 'usuarios';

  private readonly API_CREATE_USUARIO = this.API_BASE + '/create';
  private readonly API_USUARIOS_PAGINADOS = this.API_BASE + '/paginado';
  private readonly API_USUARIOS_SELECTOR = this.API_BASE + '/selector';
  private readonly API_EXISTE_CORREO = this.API_BASE + '/existe-correo';
  private readonly API_USUARIO_VIEW = this.API_BASE + '/view/';
  private readonly API_UPDATE_USUARIO = this.API_BASE + '/update/';
  private readonly API_CHANGE_ROL_USUARIO = this.API_BASE + '/';
  private readonly API_CHANGE_CORREO_USUARIO = this.API_BASE + '/';
  private readonly API_CHANGE_ESTADO_USUARIO = this.API_BASE + '/';

  constructor(
    private readonly http: HttpClient,
    private readonly authStorage: AuthStorageService
  ) { }

  // *********************************************************
  // 1. CREAR USUARIO
  // *********************************************************
  createUsuario(
    request: CreateUsuarioRequest,
  ): Observable<CreateUsuarioResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .post<CreateUsuarioResponse>(
        this.API_CREATE_USUARIO,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo registrar el usuario.',
          ),
        ),
      );
  }

  // *********************************************************
  // 2. LISTAR USUARIOS PAGINADOS
  // *********************************************************
  getUsuariosPaginated(
    filters: UsuariosPaginatedFilters = {},
  ): Observable<UsuariosPaginatedResponse> {
    const headers = this.getJsonHeaders();
    const params = HttpServiceHelper.buildParams(filters);

    return this.http
      .get<UsuariosPaginatedResponse>(
        this.API_USUARIOS_PAGINADOS,
        { headers, params },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudieron obtener los usuarios.',
          ),
        ),
      );
  }

  // *********************************************************
  // 3. OBTENER SELECTOR DE USUARIOS
  // *********************************************************
  getUsuariosSelector(
    filters: UsuariosSelectorFilters = {},
  ): Observable<UsuariosSelectorResponse> {
    const headers = this.getJsonHeaders();
    const params = HttpServiceHelper.buildParams(filters);

    return this.http
      .get<UsuariosSelectorResponse>(
        this.API_USUARIOS_SELECTOR,
        { headers, params },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudieron obtener los usuarios del selector.',
          ),
        ),
      );
  }

  // *********************************************************
  // 4. CONSULTAR DISPONIBILIDAD DE CORREO
  // *********************************************************
  existeCorreo(
    filters: ExisteCorreoFilters,
  ): Observable<ExisteCorreoResponse> {
    const headers = this.getJsonHeaders();
    const params = HttpServiceHelper.buildParams(filters);

    return this.http
      .get<ExisteCorreoResponse>(
        this.API_EXISTE_CORREO,
        { headers, params },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo consultar la disponibilidad del correo.',
          ),
        ),
      );
  }

  // *********************************************************
  // 5. OBTENER USUARIO POR ID
  // *********************************************************
  getUsuarioById(
    idUsuario: number,
  ): Observable<GetUsuarioByIdResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .get<GetUsuarioByIdResponse>(
        `${this.API_USUARIO_VIEW}${encodeURIComponent(String(idUsuario))}`,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo obtener el usuario.',
          ),
        ),
      );
  }

  // *********************************************************
  // 6. ACTUALIZAR USUARIO
  // *********************************************************
  updateUsuario(
    idUsuario: number,
    request: UpdateUsuarioRequest,
  ): Observable<UpdateUsuarioResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .patch<UpdateUsuarioResponse>(
        `${this.API_UPDATE_USUARIO}${encodeURIComponent(String(idUsuario))}`,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo actualizar el usuario.',
          ),
        ),
      );
  }

  // *********************************************************
  // 7. CAMBIAR ROL DEL USUARIO
  // *********************************************************
  changeRolUsuario(
    idUsuario: number,
    request: ChangeRolUsuarioRequest,
  ): Observable<ChangeRolUsuarioResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .patch<ChangeRolUsuarioResponse>(
        `${this.API_CHANGE_ROL_USUARIO}${encodeURIComponent(String(idUsuario))}/rol`,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo cambiar el rol del usuario.',
          ),
        ),
      );
  }

  // *********************************************************
  // 8. CAMBIAR CORREO DE ACCESO
  // *********************************************************
  changeCorreoUsuario(
    idUsuario: number,
    request: ChangeCorreoUsuarioRequest,
  ): Observable<ChangeCorreoUsuarioResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .patch<ChangeCorreoUsuarioResponse>(
        `${this.API_CHANGE_CORREO_USUARIO}${encodeURIComponent(String(idUsuario))}/correo`,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo cambiar el correo de acceso.',
          ),
        ),
      );
  }

  // *********************************************************
  // 9. CAMBIAR ESTADO DEL USUARIO
  // *********************************************************
  changeEstadoUsuario(
    idUsuario: number,
    request: ChangeEstadoUsuarioRequest,
  ): Observable<ChangeEstadoUsuarioResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .patch<ChangeEstadoUsuarioResponse>(
        `${this.API_CHANGE_ESTADO_USUARIO}${encodeURIComponent(String(idUsuario))}/estado`,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo cambiar el estado del usuario.',
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
