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
import { ChangePersonalDisponibilidadRequest, ChangePersonalDisponibilidadResponse, ChangePersonalEstadoRequest, ChangePersonalEstadoResponse, CreatePersonalRequestMap, CreatePersonalResponse, GetPersonalByIdResponse, PersonalPaginadoFilters, PersonalPaginadoResponse, TipoPersonal, TipoPersonalConDisponibilidad, UpdatePersonalRequest, UpdatePersonalResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class PersonalService {

  // *********************************************************
  // ENDPOINTS
  // *********************************************************
  private readonly API_BASE: string = environment.main_url + 'personal';

  constructor(
    private readonly http: HttpClient,
    private readonly authStorage: AuthStorageService
  ) { }

  // *********************************************************
  // 1. CREAR PERSONAL
  // *********************************************************
  createPersonal<T extends TipoPersonal>(
    tipo: T,
    request: CreatePersonalRequestMap[T],
  ): Observable<CreatePersonalResponse<T>> {
    const headers = this.getJsonHeaders();

    const url =
      `${this.API_BASE}/${encodeURIComponent(tipo)}/create`;

    return this.http
      .post<CreatePersonalResponse<T>>(
        url,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo registrar el personal.',
          ),
        ),
      );
  }

  // *********************************************************
  // 2. LISTAR PERSONAL PAGINADO
  // *********************************************************
  getPersonalPaginado<T extends TipoPersonal>(
    tipo: T,
    filters: PersonalPaginadoFilters<T> = {},
  ): Observable<PersonalPaginadoResponse<T>> {
    const headers = this.getJsonHeaders();
    const params = HttpServiceHelper.buildParams(filters);

    const url =
      `${this.API_BASE}/${encodeURIComponent(tipo)}/paginado`;

    return this.http
      .get<PersonalPaginadoResponse<T>>(
        url,
        { headers, params },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo obtener el personal.',
          ),
        ),
      );
  }

  // *********************************************************
  // 3. OBTENER PERSONAL POR ID
  // *********************************************************
  getPersonalById<T extends TipoPersonal>(
    tipo: T,
    idPersonal: number,
  ): Observable<GetPersonalByIdResponse<T>> {
    const headers = this.getJsonHeaders();

    const url =
      `${this.API_BASE}/${encodeURIComponent(tipo)}` +
      `/view/${encodeURIComponent(String(idPersonal))}`;

    return this.http
      .get<GetPersonalByIdResponse<T>>(
        url,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo obtener el perfil de personal.',
          ),
        ),
      );
  }

  // *********************************************************
  // 4. ACTUALIZAR PERSONAL
  // *********************************************************
  updatePersonal<T extends TipoPersonal>(
    tipo: T,
    idPersonal: number,
    request: UpdatePersonalRequest<T>,
  ): Observable<UpdatePersonalResponse<T>> {
    const headers = this.getJsonHeaders();

    const url = `${this.API_BASE}/${encodeURIComponent(tipo)}` +
      `/update/${encodeURIComponent(String(idPersonal))}`;

    return this.http
      .patch<UpdatePersonalResponse<T>>(
        url,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo actualizar el personal.',
          ),
        ),
      );
  }

  // *********************************************************
  // 5. CAMBIAR DISPONIBILIDAD DEL PERSONAL
  // *********************************************************
  changePersonalDisponibilidad<
    T extends TipoPersonalConDisponibilidad,
  >(
    tipo: T,
    idPersonal: number,
    request: ChangePersonalDisponibilidadRequest,
  ): Observable<ChangePersonalDisponibilidadResponse<T>> {
    const headers = this.getJsonHeaders();

    const url =
      `${this.API_BASE}/${encodeURIComponent(tipo)}` +
      `/${encodeURIComponent(String(idPersonal))}/disponible`;

    return this.http
      .patch<ChangePersonalDisponibilidadResponse<T>>(
        url,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo cambiar la disponibilidad del personal.',
          ),
        ),
      );
  }

  // *********************************************************
  // 6. CAMBIAR ESTADO DEL PERSONAL
  // *********************************************************
  changePersonalEstado<T extends TipoPersonal>(
    tipo: T,
    idPersonal: number,
    request: ChangePersonalEstadoRequest,
  ): Observable<ChangePersonalEstadoResponse<T>> {
    const headers = this.getJsonHeaders();

    const url =
      `${this.API_BASE}/${encodeURIComponent(tipo)}` +
      `/${encodeURIComponent(String(idPersonal))}/estado`;

    return this.http
      .patch<ChangePersonalEstadoResponse<T>>(
        url,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo cambiar el estado del personal.',
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
