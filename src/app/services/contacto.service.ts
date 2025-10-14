// src/app/services/contacto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Environment
import { environment } from '@environments/environment';


// Modelo opcional para tipar el contacto
export interface Contacto {
  nombre: string;
  email: string;
  telefono?: string;
  asunto?: string;
  mensaje: string;
  archivos?: File[];
}

@Injectable({
  providedIn: 'root',
})
export class ContactoService {

  // 1.- Environment
  envs = environment;

  // 2.- variables publicas
  private url: string = this.envs.main_url_prueba + 'contacto'; // ⚙️ Cambia a tu dominio en producción

  constructor(private http: HttpClient) { }

  /**
   * Envía el formulario de contacto al backend, incluyendo archivos adjuntos
   */
  enviarContacto(data: Contacto): Observable<any> {
    const formData = new FormData();

    // Añadir campos del formulario
    formData.append('nombre', data.nombre);
    formData.append('email', data.email);
    formData.append('telefono', data.telefono || '');
    formData.append('asunto', data.asunto || '');
    formData.append('mensaje', data.mensaje);

    // Adjuntar los archivos, si existen
    if (data.archivos && data.archivos.length > 0) {
      data.archivos.forEach((file) => {
        formData.append('archivos', file);
      });
    }

    // Realizar la petición POST
    return this.http.post(`${this.url}`, formData);
  }
}
