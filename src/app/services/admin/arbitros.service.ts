import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Auth
import { AuthService } from '../auth.service';

// Environment
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArbitrosService {

  private http = inject(HttpClient);
  private authService = inject(AuthService);


  // 1.- Environment
  envs = environment;

  // 2.- variables publicas
  private baseUrl: string = this.envs.main_url_prueba + 'arbitros';


  // ======================================
  // Obtener headers con token
  // ======================================
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken() || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ======================================
  // 1. Listar árbitros
  // ======================================
  getArbitros(): Observable<any> {
    return this.http.get<any>(this.baseUrl, {
      headers: this.getHeaders()
    });
  }

  // ======================================
  // 2. Obtener arbitro por ID
  // ======================================
  getArbitroById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // ======================================
  // 3. Crear árbitro
  // ======================================
  crearArbitro(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, data, {
      headers: this.getHeaders()
    });
  }

  // ======================================
  // 4. Actualizar árbitro
  // ======================================
  actualizarArbitro(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  // ======================================
  // 5. Eliminar árbitro
  // ======================================
  eliminarArbitro(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
