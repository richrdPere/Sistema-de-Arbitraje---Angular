import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { JwtHelperService } from "@auth0/angular-jwt";

// Environment
import { environment } from '@environments/environment';
import { AdminUser } from '../interfaces/adminUser';


@Injectable({
  providedIn: 'root'
})
export class AdminService {

  // 1.- Enviroment
  envs = environment;

  // 2.- variables publicas
  private url: string = this.envs.main_url;

  constructor(private _http: HttpClient) { }


  // ===========================================================
  // 1.- Login Admin
  // ===========================================================
  login_Admin(data: {}): Observable<any> {

    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(this.url + 'admin/login_admin', data, { headers: headers });
  }

  // ===========================================================
  // 2.- Obtener token
  // ===========================================================
  getToken() {
    return localStorage.getItem('token');
  }


  // ===========================================================
  // 3.- isAuthenticated
  // ===========================================================
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

  // ===========================================================
  // 4.- logout
  // ===========================================================
  logout(): void {
    // localStorage.removeItem('token');
    // localStorage.removeItem('uid');
    // localStorage.removeItem('role');

    // También puedes limpiar todo si prefieres:
    localStorage.clear();
  }

  // ===========================================================
  // 5.- Get Admin User
  // ===========================================================
  getUsuario(): AdminUser | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) as AdminUser : null;
  }

  // getName(): string {
  //   return localStorage.getItem('firstName') || '';
  // }

  // getEmail(): string {
  //   return localStorage.getItem('email') || '';
  // }

  // getAvatar(): string {
  //   return localStorage.getItem('avatar') || '';
  // }

}
