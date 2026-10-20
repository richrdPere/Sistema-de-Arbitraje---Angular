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
import { ChangePersonaEstadoRequest, ChangePersonaEstadoResponse, CreatePersonaRequest, CreatePersonaResponse, FindPersonaFilters, FindPersonaResponse, GetPersonaByIdResponse, PersonasPaginatedFilters, PersonasPaginatedResponse, PersonasSelectorFilters, PersonasSelectorResponse, UpdatePersonaRequest, UpdatePersonaResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {

  // *********************************************************
  // ENDPOINTS
  // *********************************************************
  private readonly API_BASE: string = environment.main_url + 'personas';

  private readonly API_CREATE_PERSONA = this.API_BASE + '/create';
  private readonly API_FIND_PERSONA = this.API_BASE + '/buscar';
  private readonly API_PERSONAS_PAGINADAS = this.API_BASE + '/paginado';
  private readonly API_PERSONAS_SELECTOR = this.API_BASE + '/selector';
  private readonly API_GET_PERSONA_BY_ID = this.API_BASE + '/view/';
  private readonly API_UPDATE_PERSONA = this.API_BASE + '/update/';
  private readonly API_CHANGE_PERSONA_ESTADO = this.API_BASE + '/';

  constructor(
    private readonly http: HttpClient,
    private readonly authStorage: AuthStorageService
  ) { }


  // *********************************************************
  // 1. CREAR PERSONA
  // *********************************************************
  createPersona(
    request: CreatePersonaRequest,
  ): Observable<CreatePersonaResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .post<CreatePersonaResponse>(
        this.API_CREATE_PERSONA,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo registrar la persona.',
          ),
        ),
      );
  }

  // *********************************************************
  // 2. BUSCAR PERSONA POR DNI O RUC — PÚBLICO
  // *********************************************************
  findPersona(
    filters: FindPersonaFilters,
  ): Observable<FindPersonaResponse> {
    // const params = filters.dni !== undefined
    //   ? HttpServiceHelper.buildParams(filters)
    //   : HttpServiceHelper.buildParams(filters);

    const params = HttpServiceHelper.buildParams(filters);

    return this.http
      .get<FindPersonaResponse>(
        this.API_FIND_PERSONA,
        { params },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo buscar la persona.',
          ),
        ),
      );
  }

  // *********************************************************
  // 3. LISTAR PERSONAS PAGINADAS
  // *********************************************************
  getPersonasPaginated(
    filters: PersonasPaginatedFilters = {},
  ): Observable<PersonasPaginatedResponse> {
    const headers = this.getJsonHeaders();
    const params = HttpServiceHelper.buildParams(filters);

    return this.http
      .get<PersonasPaginatedResponse>(
        this.API_PERSONAS_PAGINADAS,
        { headers, params },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudieron obtener las personas.',
          ),
        ),
      );
  }

  // *********************************************************
  // 4. BUSCAR PERSONAS PARA SELECTOR — PÚBLICO
  // *********************************************************
  getPersonasSelector(
    filters: PersonasSelectorFilters,
  ): Observable<PersonasSelectorResponse> {
    const params = HttpServiceHelper.buildParams(filters);

    return this.http
      .get<PersonasSelectorResponse>(
        this.API_PERSONAS_SELECTOR,
        { params },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudieron buscar las personas.',
          ),
        ),
      );
  }

  // *********************************************************
  // 5. OBTENER PERSONA POR ID
  // *********************************************************
  getPersonaById(
    idPersona: number,
  ): Observable<GetPersonaByIdResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .get<GetPersonaByIdResponse>(
        `${this.API_GET_PERSONA_BY_ID}${encodeURIComponent(String(idPersona))}`,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo obtener la persona.',
          ),
        ),
      );
  }

  // *********************************************************
  // 6. ACTUALIZAR PERSONA
  // *********************************************************
  updatePersona(
    idPersona: number,
    request: UpdatePersonaRequest,
  ): Observable<UpdatePersonaResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .patch<UpdatePersonaResponse>(
        `${this.API_UPDATE_PERSONA}${encodeURIComponent(String(idPersona))}`,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo actualizar la persona.',
          ),
        ),
      );
  }

  // *********************************************************
  // 7. CAMBIAR ESTADO DE PERSONA
  // *********************************************************
  changePersonaEstado(
    idPersona: number,
    request: ChangePersonaEstadoRequest,
  ): Observable<ChangePersonaEstadoResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .patch<ChangePersonaEstadoResponse>(
        `${this.API_CHANGE_PERSONA_ESTADO}${encodeURIComponent(String(idPersona))}/estado`,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo cambiar el estado de la persona.',
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
