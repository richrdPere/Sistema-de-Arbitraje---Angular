import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { JwtHelperService } from "@auth0/angular-jwt";

// Environment
import { environment } from '@environments/environment';

// Interface
import { LoginResponse, UsuarioSecretaria } from '../interfaces/users/secretariaUser';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // 1.- Environment
  envs = environment;

  // 2.- variables publicas
  private url: string = this.envs.main_url_prueba; // ⚙️ Cambia a tu dominio en producción

  private currentUserSubject = new BehaviorSubject<LoginResponse['usuario'] | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  // 3.- inicializar
  constructor(private _http: HttpClient) {
    // Restaurar sesión si ya existe en localStorage
    const savedUser = localStorage.getItem('usuario');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  // ===========================================================
  // 1.- Login Admin
  // ===========================================================
  login(correo: string, password: string): Observable<LoginResponse> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    console.log("Correo: ", correo);
    console.log("Contraseña: ", password);

    return this._http.post<LoginResponse>(`${this.url}auth/login`, { correo, password }, { headers: headers })
      .pipe(
        tap((res) => {
          // Guardar token y usuario en localStorage
          localStorage.setItem('token', res.token);
          localStorage.setItem('usuario', JSON.stringify(res.usuario));
          this.currentUserSubject.next(res.usuario);
        })
      );
  }

  // ===========================================================
  // 2.- Registrar
  // ===========================================================
  register(data: any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');


    return this._http.post(`${this.url}auth/registro`, data, { headers: headers });
  }

  // ===========================================================
  // 3.- Obtener token
  // ===========================================================
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ===========================================================
  // 4.- Obtener usuario
  // ===========================================================
  getUser(): UsuarioSecretaria | null {
    return this.currentUserSubject.value;
  }

  // ===========================================================
  // 4.- Cerrar sesión
  // ===========================================================
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.currentUserSubject.next(null);
  }

  // ✅ VERIFICAR SI HAY SESIÓN
  public isAuthenticated(allowRoles: string[]): boolean {

    const token = localStorage.getItem('token');

    if (!token) return false;


    const helper = new JwtHelperService();
    try {
      // Verificar si el token es válido
      const isExpired = helper.isTokenExpired(token);
      if (isExpired) return false;

      // Decodificar el token
      const decodedToken = helper.decodeToken(token);
      if (!decodedToken || !decodedToken.role) return false;

      // Verificar si el rol está permitido
      return allowRoles.includes(decodedToken.role);

    } catch (error) {
      console.error('Error al validar token JWT:', error);
      return false;
    }
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    // Valida si el token existe y no ha expirado
    return !!token;
  }

  // isAuthenticated(): boolean {
  //   return !!this.getToken();
  // }
}
