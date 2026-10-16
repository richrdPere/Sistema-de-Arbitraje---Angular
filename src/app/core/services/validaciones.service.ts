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
  API_BASE: string = this.envs.main_url_prueba + 'usuarios';

  API_VALIDAR_EMAIL: string = this.API_BASE + '/existe-email/';
  API_VALIDAR_DNI: string = this.API_BASE + '/existe-dni/';
  API_VALIDAR_RUC: string = this.API_BASE + '/existe-ruc/';

  constructor(private http: HttpClient) { }

  // ================================
  //  VALIDAR EMAIL
  // ================================
  validarCorreo(usuarioId?: number): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      if (!control.value) return of(null);

      return of(control.value).pipe(
        debounceTime(400),
        switchMap(correo =>
          this.http.get<boolean>(this.API_VALIDAR_EMAIL + `${correo}?usuarioId=${usuarioId ?? ''}`)
        ),
        map(existe => (existe ? { correoExistente: true } : null)),
        catchError(() => of(null))
      );
    };
  }

  // ================================
  //  VALIDAR DNI
  // ================================
  validarDni(usuarioId?: number): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      if (!control.value) return of(null);

      return of(control.value).pipe(
        debounceTime(400),
        switchMap(dni =>
          this.http.get<boolean>(this.API_VALIDAR_DNI + `${dni}?usuarioId=${usuarioId ?? ''}`
          )
        ),
        map(existe => (existe ? { dniExistente: true } : null)),
        catchError(() => of(null))
      );
    };
  }

  // ================================
  //  VALIDAR RUC
  // ================================
  validarRuc(usuarioId?: number): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      if (!control.value) return of(null);

      return of(control.value).pipe(
        debounceTime(400),
        switchMap(ruc =>
          this.http.get<boolean>(this.API_VALIDAR_RUC + `${ruc}?usuarioId=${usuarioId ?? ''}`)
        ),
        map(existe => (existe ? { rucExistente: true } : null)),
        catchError(() => of(null))
      );
    };
  }
}
