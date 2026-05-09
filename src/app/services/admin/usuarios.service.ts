import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Environment
import { environment } from '@environments/environment';

// Interfaces
import { CreateUsuarioRequest, UsuarioDetalleResponse } from 'src/app/interfaces/usuario.interface';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  // 1.- Environment
  envs = environment;

  // 2.- variables publicas
  private API_BASE: string = this.envs.main_url_prueba + 'usuarios';

  API_NEW_USUARIO: string = this.API_BASE + '/crear';
  API_GET_USUARIO_PAGINATED: string = this.API_BASE + '/paginado';
  API_GET_USUARIO_BY_ID: string = this.API_BASE + '/detalle/';
  API_UPDATE_USUARIO: string = this.API_BASE + '/editar/';
  API_DELETE_USUARIO: string = this.API_BASE + '/eliminar/';
  API_CHANGE_STATE_USUARIO: string = this.API_BASE + '/estado/';

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

  // ===========================================================
  // 1.- Nuevo usuario
  // ===========================================================
  newUsuario(data: any): Observable<UsuarioDetalleResponse> {
    return this.http.post<UsuarioDetalleResponse>(this.API_NEW_USUARIO, data, this.getAuthHeaders());
  }

  // ===========================================================
  // 2.- Listar usuarios + paginado
  // ===========================================================
  getUsuariosPaginated(filters: {
    page?: number;
    limit?: number;
    rol?: string;
    search?: string;
    estado?: number;
  }): Observable<any> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    const headers = this.getAuthHeaders().headers;

    return this.http.get<any>(
      this.API_GET_USUARIO_PAGINATED,
      { params, headers, }
    );
  }

  // ===========================================================
  // 3.- Obtener usuario por ID
  // ===========================================================
  getUsuarioById(id: number) {
    return this.http.get<UsuarioDetalleResponse>(`${this.API_GET_USUARIO_BY_ID}${id}`, this.getAuthHeaders());
  }


  // ===========================================================
  // 4.- Actualizar usuario
  // ===========================================================
  updateUsuario(id: number, data: Partial<CreateUsuarioRequest>): Observable<any> {
    return this.http.put(`${this.API_UPDATE_USUARIO}${id}`, data, this.getAuthHeaders());
  }

  // ===========================================================
  // 5.- Eliminar usuario
  // ===========================================================
  eliminarUsuario(id: number) {
    return this.http.delete(`${this.API_DELETE_USUARIO}${id}`, this.getAuthHeaders());
  }

  // ===========================================================
  // 6.- Cambiar estado de usuario
  // ===========================================================
  changeStateUsuario(id: number, estado: boolean): Observable<any> {
    return this.http.patch(`${this.API_CHANGE_STATE_USUARIO}${id}`, { estado }, this.getAuthHeaders());
  }
}
