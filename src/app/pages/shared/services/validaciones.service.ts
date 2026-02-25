import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, switchMap } from 'rxjs/operators';

// Environment
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ValidacionesService {

  // 1.- Enviroment
  envs = environment;

  // 2.- variables publicas
  private apiUrl: string = this.envs.main_url_prueba + 'usuarios';

  constructor(private http: HttpClient) { }

  // ================================
  //  VALIDAR CORREO
  // ================================
  validarCorreo(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      if (!control.value) return of(null);

      return of(control.value).pipe(
        debounceTime(400),
        switchMap(correo =>
          this.http.get<boolean>(`${this.apiUrl}/existe-correo/${correo}`)
        ),
        map(existe => (existe ? { correoExistente: true } : null)),
        catchError(() => of(null))
      );
    };
  }

  // ================================
  //  VALIDAR DNI
  // ================================
  validarDni(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      if (!control.value) return of(null);

      return of(control.value).pipe(
        debounceTime(400),
        switchMap(dni =>
          this.http.get<boolean>(`${this.apiUrl}/existe-dni/${dni}`)
        ),
        map(existe => (existe ? { dniExistente: true } : null)),
        catchError(() => of(null))
      );
    };
  }

  // ================================
  //  VALIDAR RUC
  // ================================
  validarRuc(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      if (!control.value) return of(null);

      return of(control.value).pipe(
        debounceTime(400),
        switchMap(ruc =>
          this.http.get<boolean>(`${this.apiUrl}/existe-ruc/${ruc}`)
        ),
        map(existe => (existe ? { rucExistente: true } : null)),
        catchError(() => of(null))
      );
    };
  }
}
