import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, defer, finalize, shareReplay, tap, throwError } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

// Environment
import { environment } from '@environments/environment';

// Services
import { AuthStorageService } from 'src/app/core/auth/auth-storage.service';

// Helpers
import { HttpServiceHelper } from 'src/app/core/auth/http-service.helper';

// Interfaces
import { ChangePasswordRequest, ChangePasswordResponse, ConfirmarCuentaRequest, ConfirmarCuentaResponse, GetPerfilResponse, ListarSesionesResponse, LoginRequest, LoginResponse, LogoutAllResponse, LogoutResponse, ReenviarVerificacionRequest, ReenviarVerificacionResponse, RefreshSesionRequest, RefreshSesionResponse, RegisterUsuarioRequest, RegisterUsuarioResponse, ResetPasswordRequest, ResetPasswordResponse, RevocarSesionResponse, SolicitarRecuperacionRequest, SolicitarRecuperacionResponse } from '../interfaces';
import { AuthRol, AuthUsuario } from 'src/app/core/models/auth-session.model';
import { AuthJwtPayload } from 'src/app/core/models/auth-jwt-payload.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // =========================================================
  // DEPENDENCIAS
  // =========================================================
  private readonly http = inject(HttpClient);
  private readonly authStorage = inject(AuthStorageService);
  private readonly jwtHelper = new JwtHelperService();

  private refreshEnCurso$: Observable<RefreshSesionResponse> | null = null;
  // =========================================================
  // ENDPOINTS
  // main_url debe apuntar a la base del backend sin /auth.
  // =========================================================
  private readonly API_BASE: string = environment.main_url + 'auth';

  private readonly API_LOGIN = this.API_BASE + '/login';
  private readonly API_REGISTER = this.API_BASE + '/register';
  private readonly API_REENVIAR_VERIFICACION = this.API_BASE + '/reenviar-verificacion';
  private readonly API_CONFIRMAR_CUENTA = this.API_BASE + '/confirmar-cuenta';
  private readonly API_ME = this.API_BASE + '/me';
  private readonly API_SESIONES = this.API_BASE + '/sesiones';
  private readonly API_REFRESH = this.API_BASE + '/refresh';
  private readonly API_CHANGE_PASSWORD = this.API_BASE + '/change-password';
  private readonly API_SOLICITAR_RECUPERACION = this.API_BASE + '/solicitar-recuperacion';
  private readonly API_RESET_PASSWORD = this.API_BASE + '/reset-password';
  private readonly API_DELETE_SESIONES = this.API_BASE + '/sesiones/';
  private readonly API_LOGOUT = this.API_BASE + '/logout';
  private readonly API_LOGOUT_ALL = this.API_BASE + '/logout-all';


  // =========================================================
  // ESTADO DEL USUARIO
  // =========================================================
  private readonly currentUserSubject = new BehaviorSubject<AuthUsuario | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.restoreSession();
  }

  // *********************************************************
  // 1. LOGIN
  // *********************************************************
  login(request: LoginRequest): Observable<LoginResponse> {

    const headers = this.getJsonHeaders();

    return this.http
      .post<LoginResponse>(
        this.API_LOGIN,
        request,
        { headers },
      )
      .pipe(
        tap((response) => {
          this.processLoginResponse(response);
        }),

        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo iniciar sesión.',
          ),
        ),
      );
  }

  // *********************************************************
  // 2. REGISTRAR USUARIO
  // *********************************************************
  createUser(
    request: RegisterUsuarioRequest,
  ): Observable<RegisterUsuarioResponse> {
    // Solicitud pública: no adjuntar access token.
    const headers = this.getJsonHeaders();

    return this.http
      .post<RegisterUsuarioResponse>(
        this.API_REGISTER,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo registrar el usuario.',
          ),
        ),
      );
  }

  // *********************************************************
  // 3. REENVIAR VERIFICACIÓN DE CORREO
  // *********************************************************
  reenviarVerificacion(
    request: ReenviarVerificacionRequest,
  ): Observable<ReenviarVerificacionResponse> {
    // Solicitud pública: no adjuntar access token.
    const headers = this.getJsonHeaders();

    return this.http
      .post<ReenviarVerificacionResponse>(
        this.API_REENVIAR_VERIFICACION,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo solicitar el reenvío de verificación.',
          ),
        ),
      );
  }

  // *********************************************************
  // 4. CONFIRMAR CUENTA
  // *********************************************************
  confirmarCuenta(
    request: ConfirmarCuentaRequest,
  ): Observable<ConfirmarCuentaResponse> {
    // Solicitud pública: no adjuntar access token.
    const headers = this.getJsonHeaders();

    return this.http
      .post<ConfirmarCuentaResponse>(
        this.API_CONFIRMAR_CUENTA,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo confirmar la cuenta.',
          ),
        ),
      );
  }

  // *********************************************************
  // 5. OBTENER PERFIL
  // *********************************************************
  getPerfil(): Observable<GetPerfilResponse> {
    // Solicitud protegida: adjuntar access token.
    const headers = this.getJsonHeaders(true);

    return this.http.get<GetPerfilResponse>(
      this.API_ME,
      { headers },
    )
      .pipe(
        tap((response) => {
          if (
            response?.success !== true ||
            !response.data
          ) {
            throw new Error(
              'La respuesta del perfil es inválida.',
            );
          }

          // Actualizar el usuario conservando los tokens.
          this.authStorage.saveUser(
            response.data,
          );

          // Notificar los cambios a los componentes.
          this.currentUserSubject.next(
            this.authStorage.getUser(),
          );
        }),

        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo obtener el perfil.',
          ),
        ),
      );
  }

  // *********************************************************
  // 6. LISTAR SESIONES ACTIVAS
  // *********************************************************
  listarSesiones(): Observable<ListarSesionesResponse> {
    const headers = this.getJsonHeaders(true);

    return this.http
      .get<ListarSesionesResponse>(
        this.API_SESIONES,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudieron obtener las sesiones activas.',
          ),
        ),
      );
  }

  // *********************************************************
  // 7. RENOVAR SESIÓN
  // *********************************************************
  refreshSesion(): Observable<RefreshSesionResponse> {
    if (this.refreshEnCurso$) {
      return this.refreshEnCurso$;
    }

    this.refreshEnCurso$ = defer(() => {
      // Leer el token al ejecutar la petición,
      // no al construir el Observable.
      const refreshToken = this.authStorage.getRefreshToken();

      if (
        !refreshToken ||
        !this.canRefreshSession()
      ) {
        this.closeLocalSession();

        return throwError(() => ({
          message:
            'La sesión ha expirado. Inicia sesión nuevamente.',
          statusCode: 401,
          code: 'INVALID_REFRESH_TOKEN',
          error: null,
        }));
      }

      const request: RefreshSesionRequest = {
        refresh_token: refreshToken,
        dispositivo: this.authStorage.getOrCreateDeviceId(),
      };

      // No requiere access token vigente.
      const headers = this.getJsonHeaders();

      return this.http
        .post<RefreshSesionResponse>(
          this.API_REFRESH,
          request,
          { headers },
        )
        .pipe(
          tap((response) => {
            if (
              response?.success !== true ||
              !response.data
            ) {
              throw new Error(
                'La respuesta de renovación es inválida.',
              );
            }

            // No restaurar una sesión cerrada ni
            // sobrescribir otro login ocurrido mientras
            // esta petición estaba en curso.
            if (
              this.authStorage.getRefreshToken() !==
              refreshToken
            ) {
              throw new Error(
                'La sesión cambió durante la renovación.',
              );
            }

            const payload = this.decodeAccessToken(
              response.data.access_token,
            );

            if (
              !payload ||
              payload.id_usuario !==
              response.data.usuario?.id_usuario ||
              payload.exp * 1000 <= Date.now()
            ) {
              throw new Error(
                'El access token renovado es inválido o ha expirado.',
              );
            }

            // Guardar juntos los nuevos tokens,
            // expiraciones y datos del usuario.
            this.authStorage.saveTokens(
              response.data,
            );

            this.currentUserSubject.next(
              this.authStorage.getUser(),
            );
          }),

          catchError((error: unknown) => {
            // Un fallo de red no elimina la sesión.
            // Un rechazo del refresh token sí la cierra,
            // siempre que siga siendo la misma sesión.
            if (
              error instanceof HttpErrorResponse &&
              error.status === 401 &&
              this.authStorage.getRefreshToken() ===
              refreshToken
            ) {
              this.closeLocalSession();
            }

            return HttpServiceHelper.handleError(
              error,
              'No se pudo renovar la sesión.',
            );
          }),
        );
    }).pipe(
      finalize(() => {
        this.refreshEnCurso$ = null;
      }),

      // Las suscripciones concurrentes comparten
      // una única solicitud HTTP.
      shareReplay({
        bufferSize: 1,
        refCount: false,
      }),
    );

    return this.refreshEnCurso$;
  }

  // *********************************************************
  // 8. CAMBIAR CONTRASEÑA
  // *********************************************************
  changePassword(
    request: ChangePasswordRequest,
  ): Observable<ChangePasswordResponse> {
    const headers = this.getJsonHeaders(true);

    // Identifica la sesión que realiza el cambio.
    const refreshTokenInicial =
      this.authStorage.getRefreshToken();

    return this.http
      .patch<ChangePasswordResponse>(
        this.API_CHANGE_PASSWORD,
        request,
        { headers },
      )
      .pipe(
        tap((response) => {
          if (
            response?.success !== true ||
            !response.data
          ) {
            throw new Error(
              'La respuesta del cambio de contraseña es inválida.',
            );
          }

          if (
            response.data.requiere_nuevo_login &&
            this.authStorage.getRefreshToken() ===
            refreshTokenInicial
          ) {
            this.closeLocalSession();
          }
        }),

        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo cambiar la contraseña.',
          ),
        ),
      );
  }

  // *********************************************************
  // 9. SOLICITAR RECUPERACIÓN DE CONTRASEÑA
  // *********************************************************
  solicitarRecuperacion(
    request: SolicitarRecuperacionRequest,
  ): Observable<SolicitarRecuperacionResponse> {
    // Solicitud pública: no adjuntar access token.
    const headers = this.getJsonHeaders();

    return this.http
      .post<SolicitarRecuperacionResponse>(
        this.API_SOLICITAR_RECUPERACION,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo solicitar la recuperación de contraseña.',
          ),
        ),
      );
  }

  // *********************************************************
  // 10. RESTABLECER CONTRASEÑA
  // *********************************************************
  resetPassword(
    request: ResetPasswordRequest,
  ): Observable<ResetPasswordResponse> {
    // Solicitud pública: se autoriza con el token del body.
    const headers = this.getJsonHeaders();

    return this.http
      .post<ResetPasswordResponse>(
        this.API_RESET_PASSWORD,
        request,
        { headers },
      )
      .pipe(
        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo restablecer la contraseña.',
          ),
        ),
      );
  }

  // *********************************************************
  // 11. REVOCAR SESIÓN
  // *********************************************************
  revocarSesion(
    familiaId: string,
  ): Observable<RevocarSesionResponse> {
    const headers = this.getJsonHeaders(true);

    return this.http
      .delete<RevocarSesionResponse>(
        `${this.API_DELETE_SESIONES}${encodeURIComponent(familiaId)}`,
        { headers },
      )
      .pipe(
        tap((response) => {
          if (
            response?.success !== true ||
            !response.data
          ) {
            throw new Error(
              'La respuesta de revocación es inválida.',
            );
          }

          // Limpiar únicamente si la familia revocada
          // corresponde a la sesión local actual.
          const familiaActual =
            this.getCurrentSessionId();

          if (
            response.data.sesion_revocada &&
            familiaActual &&
            response.data.familia_id.toLowerCase() ===
            familiaActual.toLowerCase()
          ) {
            this.closeLocalSession();
          }
        }),

        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo revocar la sesión.',
          ),
        ),
      );
  }

  // *********************************************************
  // 12. CERRAR SESIÓN ACTUAL
  // *********************************************************
  logout(): Observable<LogoutResponse> {
    const headers = this.getJsonHeaders(true);

    return this.http
      .post<LogoutResponse>(
        this.API_LOGOUT,
        null,
        { headers },
      )
      .pipe(
        tap((response) => {
          if (
            response?.success !== true ||
            !response.data
          ) {
            throw new Error(
              'La respuesta del cierre de sesión es inválida.',
            );
          }

          // Evitar cerrar otro login realizado mientras
          // la solicitud estaba en curso.
          const familiaActual =
            this.getCurrentSessionId();

          if (
            response.data.requiere_nuevo_login &&
            familiaActual &&
            response.data.familia_id.toLowerCase() ===
            familiaActual.toLowerCase()
          ) {
            this.closeLocalSession();
          }
        }),

        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudo cerrar la sesión.',
          ),
        ),
      );
  }

  // *********************************************************
  // 13. CERRAR TODAS LAS SESIONES
  // *********************************************************
  logoutAll(): Observable<LogoutAllResponse> {
    const headers = this.getJsonHeaders(true);

    // Identifica la sesión que inició la solicitud.
    const familiaInicial =
      this.getCurrentSessionId();

    return this.http
      .post<LogoutAllResponse>(
        this.API_LOGOUT_ALL,
        null,
        { headers },
      )
      .pipe(
        tap((response) => {
          if (
            response?.success !== true ||
            !response.data
          ) {
            throw new Error(
              'La respuesta del cierre de sesiones es inválida.',
            );
          }

          // No limpiar otro login realizado mientras
          // la petición estaba en curso.
          const familiaActual =
            this.getCurrentSessionId();

          if (
            response.data.requiere_nuevo_login &&
            familiaInicial &&
            familiaActual === familiaInicial &&
            this.getCurrentUser()?.id_usuario ===
            response.data.id_usuario
          ) {
            this.closeLocalSession();
          }
        }),

        catchError((error: unknown) =>
          HttpServiceHelper.handleError(
            error,
            'No se pudieron cerrar todas las sesiones.',
          ),
        ),
      );
  }

  // *********************************************************
  // HEADERS JSON
  // *********************************************************
  private getJsonHeaders(
    autenticado = false,
  ): HttpHeaders {
    return HttpServiceHelper.getHeaders({
      token: autenticado
        ? this.authStorage.getAccessToken()
        : null,
    });
  }

  // *********************************************************
  // RESTAURAR SESIÓN LOCAL
  // *********************************************************
  private restoreSession(): void {
    const session = this.authStorage.getSession();

    if (!session) {
      this.currentUserSubject.next(null);
      return;
    }

    // La recuperación local depende de la fecha del
    // refresh token, que no es un JWT.
    if (!this.authStorage.hasSession()) {
      this.closeLocalSession();
      return;
    }

    const payload = this.decodeAccessToken(
      session.accessToken,
    );

    if (
      !payload ||
      payload.id_usuario !==
      session.usuario.id_usuario
    ) {
      this.closeLocalSession();
      return;
    }

    // Se restaura el usuario incluso si el access token
    // expiró, porque aún puede renovarse la sesión.
    // Esto no autoriza peticiones al backend.
    this.currentUserSubject.next(
      session.usuario,
    );
  }

  // *********************************************************
  // PROCESAR LOGIN
  // *********************************************************
  private processLoginResponse(
    response: LoginResponse,
  ): void {
    if (
      response?.success !== true ||
      !response.data
    ) {
      throw new Error(
        'La respuesta del login es inválida.',
      );
    }

    const data = response.data;

    const payload = this.decodeAccessToken(
      data.access_token,
    );

    if (
      !payload ||
      payload.id_usuario !==
      data.usuario?.id_usuario ||
      payload.exp * 1000 <= Date.now()
    ) {
      throw new Error(
        'El access token recibido es inválido o ha expirado.',
      );
    }

    // El storage recibe la estructura del backend.
    this.authStorage.saveLogin(data);

    this.currentUserSubject.next(
      this.authStorage.getUser(),
    );
  }

  // *********************************************************
  // DECODIFICAR ACCESS TOKEN
  // Solo inspección local: no verifica la firma.
  // *********************************************************
  decodeAccessToken(
    token?: string | null,
  ): AuthJwtPayload | null {
    const accessToken =
      token ?? this.authStorage.getAccessToken();

    if (!this.hasValidJwtStructure(accessToken)) {
      return null;
    }

    try {
      const decoded: unknown =
        this.jwtHelper.decodeToken(accessToken);

      if (!this.isAuthJwtPayload(decoded)) {
        return null;
      }

      return decoded;
    } catch {
      return null;
    }
  }

  // *********************************************************
  // CERRAR SESIÓN LOCAL
  // No revoca por sí solo la sesión del backend.
  // *********************************************************
  closeLocalSession(): void {
    try {
      this.authStorage.clearSession();
    } finally {
      this.currentUserSubject.next(null);
    }
  }

  // =========================================================
  // GETTERS
  // =========================================================
  getAccessToken(): string | null {
    return this.authStorage.getAccessToken();
  }

  getRefreshToken(): string | null {
    return this.authStorage.getRefreshToken();
  }

  // Alias para componentes existentes.
  getToken(): string | null {
    return this.getAccessToken();
  }

  getCurrentUser(): AuthUsuario | null {
    return this.currentUserSubject.value;
  }

  getCurrentRole(): AuthRol | null {
    return this.getCurrentUser()?.rol ?? null;
  }

  // Compatibilidad con componentes que esperan un arreglo.
  getCurrentRoles(): AuthRol[] {
    const rol = this.getCurrentRole();

    return rol ? [rol] : [];
  }

  getCurrentSessionId(): string | null {
    return this.decodeAccessToken()?.sid ?? null;
  }

  getOrCreateDeviceId(): string {
    return this.authStorage.getOrCreateDeviceId();
  }

  // =========================================================
  // VALIDACIONES LOCALES
  // =========================================================

  // Access token disponible y vigente según el reloj local.
  // La validez definitiva la comprueba el backend.
  isAuthenticated(): boolean {
    if (!this.authStorage.hasSession()) {
      return false;
    }

    const payload = this.decodeAccessToken();
    const usuario = this.getCurrentUser();

    return Boolean(
      payload &&
      usuario &&
      payload.id_usuario === usuario.id_usuario &&
      payload.exp * 1000 > Date.now(),
    );
  }

  // Comprueba la fecha almacenada del refresh token.
  // No intenta decodificarlo como JWT.
  canRefreshSession(): boolean {
    return this.authStorage.hasSession();
  }

  requiresPasswordChange(): boolean {
    return (
      this.getCurrentUser()
        ?.password_reset_required ?? false
    );
  }

  hasRole(requiredRole: AuthRol): boolean {
    return this.getCurrentRole() === requiredRole;
  }

  hasAnyRole(
    requiredRoles: readonly AuthRol[],
  ): boolean {
    const rol = this.getCurrentRole();

    return (
      rol !== null &&
      requiredRoles.includes(rol)
    );
  }

  // Se conserva por compatibilidad.
  // Cada usuario tiene un solo rol en este backend.
  hasAllRoles(
    requiredRoles: readonly AuthRol[],
  ): boolean {
    return requiredRoles.every(
      rol => this.hasRole(rol),
    );
  }

  // =========================================================
  // MÉTODOS PRIVADOS
  // =========================================================
  private hasValidJwtStructure(
    token: string | null,
  ): token is string {
    if (!token) {
      return false;
    }

    return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/
      .test(token);
  }

  private isAuthJwtPayload(
    value: unknown,
  ): value is AuthJwtPayload {
    if (
      typeof value !== 'object' ||
      value === null ||
      Array.isArray(value)
    ) {
      return false;
    }

    const payload = value as Record<string, unknown>;

    const roles: readonly string[] = [
      'ADMIN',
      'SECRETARIA',
      'PARTICIPE',
      'ARBITRO',
      'ADJUDICADOR',
      'STAFF_INTERNO',
    ];

    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    return (
      typeof payload['id_usuario'] === 'number' &&
      Number.isSafeInteger(payload['id_usuario']) &&
      payload['id_usuario'] > 0 &&

      payload['sub'] ===
      String(payload['id_usuario']) &&

      typeof payload['rol'] === 'string' &&
      roles.includes(payload['rol']) &&

      typeof payload['sid'] === 'string' &&
      uuidV4Regex.test(payload['sid']) &&

      typeof payload['iat'] === 'number' &&
      Number.isSafeInteger(payload['iat']) &&

      typeof payload['exp'] === 'number' &&
      Number.isSafeInteger(payload['exp']) &&
      payload['exp'] > payload['iat'] &&

      payload['iss'] === 'arbitraje-api' &&
      payload['aud'] === 'arbitraje-client' &&

      typeof payload['jti'] === 'string'
    );
  }
}

