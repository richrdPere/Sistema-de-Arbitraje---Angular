import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces
import { ArbitroDetalleResponse, ArbitroPaginadoResponse, ArbitrosDisponiblesResponse, CreateArbitroRequest, UpdateArbitroRequest } from 'src/app/interfaces/users/arbitroUser';

// Environment
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ArbitrosService {

  // 1.- Environment
  envs = environment;

  // 2.- variables publicas
  API_BASE: string = this.envs.main_url_prueba + 'arbitros';

  API_NEW_ARBITRO: string = this.API_BASE + '/crear';
  API_GET_ALL_ARBITROS: string = this.API_BASE + '/paginado';
  API_DETALLE_ARBITRO: string = this.API_BASE + '/detalle/';
  API_UPDATE_ARBITRO: string = this.API_BASE + '/editar/';
  API_DELETE_ARBITRO: string = this.API_BASE + '/eliminar/';
  API_GET_ARBITROS_DISPONIBLES: string = this.API_BASE + '/disponibles';


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
  // 1.- Crear arbitro
  // ===========================================================
  newArbitro(data: any): Observable<any> {
    return this.http.post<any>(this.API_NEW_ARBITRO, data, this.getAuthHeaders());
  }

  // ======================================
  // 2. Obtener árbitros paginado
  // ======================================
  getArbitrosPaginated(filters: {
    page?: number;
    limit?: number;
    search?: string;
    disponible?: string;
    conAcceso?: boolean;
  }): Observable<ArbitroPaginadoResponse> {

    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    const headers = this.getAuthHeaders().headers;

    return this.http.get<ArbitroPaginadoResponse>(this.API_GET_ALL_ARBITROS, { params, headers });
  }

  // ======================================
  // 3. Obtener arbitro por ID
  // ======================================
  getArbitroById(id: number): Observable<ArbitroDetalleResponse> {
    return this.http.get<ArbitroDetalleResponse>(`${this.API_DETALLE_ARBITRO}${id}`, this.getAuthHeaders());
  }

  // ======================================
  // 4. Actualizar árbitro
  // ======================================
  updateArbitro(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.API_UPDATE_ARBITRO}${id}`, data, this.getAuthHeaders());
  }

  // ======================================
  // 5. Eliminar árbitro
  // ======================================
  deleteArbitro(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API_DELETE_ARBITRO}${id}`, this.getAuthHeaders());
  }

  // ===========================================================
  // 6.- Filtrar arbitros
  // ===========================================================
  findArbitrosDisponibles(filters: {
    dni?: string;
    nombres?: string;
    limit?: number;
  }): Observable<ArbitrosDisponiblesResponse> {

    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        value !== ''
      ) {
        params = params.set(
          key,
          value.toString()
        );
      }
    });

    const headers = this.getAuthHeaders().headers;

    return this.http.get<ArbitrosDisponiblesResponse>(this.API_GET_ARBITROS_DISPONIBLES, { params, headers }
    );
  }
}
