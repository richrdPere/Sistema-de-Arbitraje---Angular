import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';


// Environment
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {


  // 1.- Environment
  envs = environment;


  // 2.- variables publicas
  private url: string = this.envs.main_url_prueba + 'usuarios';

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

  /**
   * Obtener árbitros
   */
  getArbitros(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.url}/arbitros`, this.getAuthHeaders())
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener secretarias
   */
  getSecretarias(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.url}/secretarias`, this.getAuthHeaders())
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener participes
   */
  getParticipes(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.url}/participes`, this.getAuthHeaders())
      .pipe(catchError(this.handleError));
  }

  /**
   * Crear usuario
   */
  crearUsuario(data: any): Observable<any> {
    // const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${this.url}/nuevo`, data, this.getAuthHeaders());
  }


  // // Obtener árbitros
  // getArbitros(): Observable<any[]> {
  //   let headers = new HttpHeaders().set('Content-Type', 'application/json');

  //   return this.http.get<any[]>(`${this.url}/arbitros`, { headers: headers });
  // }

  // // Obtener secretarias
  // getSecretarias(): Observable<any[]> {
  //   let headers = new HttpHeaders().set('Content-Type', 'application/json');
  //   return this.http.get<any[]>(`${this.url}/secretarias`, { headers: headers });
  // }

  // // Obtener participes
  // getParticipes(): Observable<any[]> {
  //   let headers = new HttpHeaders().set('Content-Type', 'application/json');
  //   return this.http.get<any[]>(`${this.url}/participes`, { headers: headers });
  // }
}
