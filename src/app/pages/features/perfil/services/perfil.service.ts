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
import { GetMiPerfilResponse, UpdateMiPerfilRequest, UpdateMiPerfilResponse, UploadFotoPerfilResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  // *********************************************************
  // ENDPOINTS
  // *********************************************************
  private readonly API_BASE: string = environment.main_url + 'perfil';

  constructor(
    private readonly http: HttpClient,
    private readonly authStorage: AuthStorageService
  ) { }


  // *********************************************************
  // 1. OBTENER MI PERFIL
  // *********************************************************
  obtenerPerfil(): Observable<GetMiPerfilResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .get<GetMiPerfilResponse>(this.API_BASE, { headers })
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo obtener el perfil.',
          ),
        ),
      );
  }

  // *********************************************************
  // 2. ACTUALIZAR MI PERFIL
  // *********************************************************
  actualizarPerfil(
    request: UpdateMiPerfilRequest,
  ): Observable<UpdateMiPerfilResponse> {
    const headers = this.getJsonHeaders();

    return this.http
      .put<UpdateMiPerfilResponse>(this.API_BASE, request, { headers })
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo actualizar el perfil.',
          ),
        ),
      );
  }

  // *********************************************************
  // 3. SUBIR FOTO DE PERFIL
  // *********************************************************
  subirFotoPerfil(foto: File): Observable<UploadFotoPerfilResponse> {
    const formData = new FormData();
    formData.append('foto', foto);

    const headers = HttpServiceHelper.getMultipartHeaders({
      token: this.authStorage.getAccessToken(),
    });

    return this.http
      .post<UploadFotoPerfilResponse>(
        `${this.API_BASE}/foto`,
        formData,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo actualizar la foto de perfil.',
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
