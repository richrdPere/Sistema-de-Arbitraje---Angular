import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

// Environment
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ParticipeService {

  // 1.- Environment
  envs = environment;

  // 2.- variables publicas
  private url: string = this.envs.main_url_prueba + 'participes';

  constructor(private http: HttpClient) { }

  /**
 * Devuelve las cabeceras HTTP con el token JWT si existe
 */
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



  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(error: any) {
    if (error.status === 403) {
      console.error(' Acceso prohibido: falta autorización o token inválido.');
      alert('No tienes permisos o tu sesión expiró. Por favor inicia sesión nuevamente.');
    } else if (error.status === 401) {
      console.error(' No autorizado: token no válido o expirado.');
      alert('Tu sesión ha expirado, vuelve a iniciar sesión.');
    } else {
      console.error(' Error en la solicitud:', error);
    }
    return throwError(() => error);
  }

  // Crear
  crearParticipe(data: any): Observable<any> {
    return this.http.post(`${this.url}`, data, this.getAuthHeaders());
  }

  // Listar todos
  obtenerParticipes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}`, this.getAuthHeaders()).pipe(catchError(this.handleError));
  }

  // Obtener por ID
  obtenerParticipePorId(id: number): Observable<any> {
    return this.http.get(`${this.url}/${id}`, this.getAuthHeaders()).pipe(catchError(this.handleError));
  }

  // Actualizar
  actualizarParticipe(id: number, data: any): Observable<any> {
    return this.http.put(`${this.url}/${id}`, data, this.getAuthHeaders());
  }

  // Eliminar
  eliminarParticipe(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`, this.getAuthHeaders()).pipe(catchError(this.handleError));
  }


}
