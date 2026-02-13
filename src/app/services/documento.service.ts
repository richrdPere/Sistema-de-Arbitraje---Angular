import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


// Environment
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root',
})
export class DocumentoService {

  // 1.- Environment
  envs = environment;

  // 2.- variables publicas
  private url: string = this.envs.main_url_prueba + 'documentos';

  constructor(private http: HttpClient) { }


  // =====================================================
  // 1. ELIMINAR DOCUMENTO POR ID
  // =====================================================
  eliminarDocumento(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`);
  }
}
