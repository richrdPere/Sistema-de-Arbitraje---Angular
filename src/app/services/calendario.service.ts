import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Environment
import { environment } from 'src/environments/environment';
import { CalendarioActividad, EstadoActividad } from '../interfaces/calendario.model';

@Injectable({
  providedIn: 'root',
})
export class CalendarioService {

  // 1.- Environment
  envs = environment;

  // 2.- variables publicas
  private url: string = this.envs.main_url_prueba + 'calendario';


  constructor(private http: HttpClient) { }

  // =====================================================
  // 1. CREAR ACTIVIDAD
  // =====================================================
  crearActividad(data: CalendarioActividad): Observable<any> {
    return this.http.post<any>(this.url, data);
  }

  // =====================================================
  // 2. LISTAR ACTIVIDADES (con filtros)
  // =====================================================
  listarActividades(filtros?: {
    tipo_actividad?: string;
    estado?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Observable<CalendarioActividad[]> {

    let params = new HttpParams();

    if (filtros) {
      Object.keys(filtros).forEach((key) => {
        const value = (filtros as any)[key];
        if (value) {
          params = params.set(key, value);
        }
      });
    }

    return this.http.get<CalendarioActividad[]>(this.url, { params });
  }

  // =====================================================
  // 3. OBTENER ACTIVIDAD POR ID
  // =====================================================
  obtenerActividad(id: number): Observable<CalendarioActividad> {
    return this.http.get<CalendarioActividad>(`${this.url}/${id}`);
  }

  // =====================================================
  // 4. ACTUALIZAR ACTIVIDAD
  // =====================================================
  actualizarActividad(
    id: number,
    data: Partial<CalendarioActividad>
  ): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, data);
  }

  // =====================================================
  // 5. CAMBIAR ESTADO
  // =====================================================
  cambiarEstado(
    id: number,
    estado: EstadoActividad
  ): Observable<any> {
    return this.http.patch<any>(`${this.url}/${id}/estado`, { estado });
  }

  // =====================================================
  // 6. ELIMINAR (CANCELAR) ACTIVIDAD
  // =====================================================
  eliminarActividad(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`);
  }
}
