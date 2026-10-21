import { Injectable } from '@angular/core';
import { AuthLoginData, AuthRol, AuthUsuario, StoredAuthSession, TokenExpiration } from '../models/auth-session.model';

const AUTH_ROLES: readonly AuthRol[] = [
  'ADMIN',
  'SECRETARIA',
  'PARTICIPE',
  'ARBITRO',
  'ADJUDICADOR',
  'STAFF_INTERNO',
];

@Injectable({
  providedIn: 'root',
})
export class AuthStorageService {
  private readonly keys = {
    session: 'arbitraje.auth.session.v1',
    deviceId: 'arbitraje.web.device_id',
  } as const;

  // *********************************************************
  // 1. ACCESS TOKEN
  // *********************************************************
  getAccessToken(): string | null {
    return this.getSession()?.accessToken ?? null;
  }

  // *********************************************************
  // 2. REFRESH TOKEN
  // *********************************************************
  getRefreshToken(): string | null {
    return this.getSession()?.refreshToken ?? null;
  }

  // *********************************************************
  // 3. ROL ACTUAL
  // *********************************************************
  getRol(): AuthRol | null {
    return this.getUser()?.rol ?? null;
  }

  // Compatibilidad con componentes que esperan un arreglo.
  // La fuente de verdad sigue siendo usuario.rol.
  getRoles(): AuthRol[] {
    const rol = this.getRol();

    return rol ? [rol] : [];
  }

  // *********************************************************
  // 4. SESIÓN LOCAL
  // *********************************************************
  getSession(): StoredAuthSession | null {
    const storage = this.getStorage();

    if (!storage) {
      return null;
    }

    const value = storage.getItem(this.keys.session);

    if (!value) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(value);

      if (!this.isStoredSession(parsed)) {
        this.clearSession();
        return null;
      }

      return parsed;
    } catch {
      this.clearSession();
      return null;
    }
  }

  // *********************************************************
  // 5. USUARIO
  // *********************************************************
  getUser(): AuthUsuario | null {
    return this.getSession()?.usuario ?? null;
  }

  // *********************************************************
  // 6. EXPIRACIONES
  // *********************************************************
  getExpiresIn(): TokenExpiration | null {
    return this.getSession()?.expiresAt ?? null;
  }

  // *********************************************************
  // 7. GUARDAR LOGIN
  // Recibe response.data.
  // *********************************************************
  saveLogin(data: AuthLoginData): void {
    if (
      data.token_type !== 'Bearer' ||
      !Number.isFinite(data.expires_in) ||
      data.expires_in <= 0
    ) {
      throw new Error(
        'La respuesta de autenticación es inválida.',
      );
    }

    const refreshExpiration = Date.parse(
      data.refresh_expires_at,
    );

    const accessExpiration =
      Date.now() + data.expires_in * 1000;

    if (
      !Number.isFinite(refreshExpiration) ||
      !Number.isFinite(accessExpiration)
    ) {
      throw new Error(
        'Las fechas de autenticación son inválidas.',
      );
    }

    const session: StoredAuthSession = {
      version: 1,

      accessToken: data.access_token,
      refreshToken: data.refresh_token,

      expiresAt: {
        accessTokenExpiresAt:
          new Date(accessExpiration).toISOString(),

        refreshTokenExpiresAt:
          new Date(refreshExpiration).toISOString(),
      },

      usuario: {
        ...data.usuario,

        password_reset_required:
          data.password_reset_required,
      },
    };

    if (!this.isStoredSession(session)) {
      throw new Error(
        'Los datos de la sesión son inválidos.',
      );
    }

    this.requireStorage().setItem(
      this.keys.session,
      JSON.stringify(session),
    );
  }

  // *********************************************************
  // 8. GUARDAR RENOVACIÓN
  // Refresh devuelve la misma estructura que login.
  // *********************************************************
  saveTokens(data: AuthLoginData): void {
    this.saveLogin(data);
  }

  // *********************************************************
  // 9. ACTUALIZAR USUARIO DESDE /auth/me
  // *********************************************************
  saveUser(usuario: AuthUsuario): void {
    const session = this.getSession();

    if (!session) {
      return;
    }

    // Evitar mezclar el perfil de otra cuenta
    // con las credenciales almacenadas.
    if (
      usuario.id_usuario !==
      session.usuario.id_usuario
    ) {
      throw new Error(
        'El usuario no corresponde a la sesión actual.',
      );
    }

    const updatedSession: StoredAuthSession = {
      ...session,
      usuario,
    };

    if (!this.isStoredSession(updatedSession)) {
      throw new Error(
        'Los datos del usuario son inválidos.',
      );
    }

    this.requireStorage().setItem(
      this.keys.session,
      JSON.stringify(updatedSession),
    );
  }

  // *********************************************************
  // 10. OBTENER O CREAR IDENTIFICADOR DEL NAVEGADOR
  // *********************************************************
  getOrCreateDeviceId(): string {
    const storage = this.requireStorage();

    const existing = storage
      .getItem(this.keys.deviceId)
      ?.trim();

    if (existing) {
      return existing;
    }

    const uuid =
      typeof crypto !== 'undefined' &&
        typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : this.createFallbackUuid();

    const deviceId = `web-${uuid}`;

    storage.setItem(
      this.keys.deviceId,
      deviceId,
    );

    return deviceId;
  }

  // *********************************************************
  // 11. COMPROBAR SESIÓN RECUPERABLE
  // El access token puede estar vencido y renovarse.
  // *********************************************************
  hasSession(): boolean {
    const session = this.getSession();

    if (!session) {
      return false;
    }

    return (
      Date.parse(
        session.expiresAt.refreshTokenExpiresAt,
      ) > Date.now()
    );
  }

  // *********************************************************
  // 12. COMPROBAR EXPIRACIÓN DEL ACCESS TOKEN
  // *********************************************************
  isAccessTokenExpired(
    margenSegundos = 30,
  ): boolean {
    const session = this.getSession();

    if (!session) {
      return true;
    }

    return (
      Date.parse(
        session.expiresAt.accessTokenExpiresAt,
      ) <= Date.now() + margenSegundos * 1000
    );
  }

  // *********************************************************
  // 13. CAMBIO OBLIGATORIO DE CONTRASEÑA
  // *********************************************************
  requiresPasswordChange(): boolean {
    return (
      this.getUser()?.password_reset_required ??
      false
    );
  }

  // *********************************************************
  // 14. LIMPIAR SESIÓN
  // Conserva el identificador del navegador y el tema.
  // *********************************************************
  clearSession(): void {
    this.getStorage()?.removeItem(
      this.keys.session,
    );
  }

  // *********************************************************
  // MÉTODOS PRIVADOS
  // *********************************************************
  private getStorage(): Storage | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage;
  }

  private requireStorage(): Storage {
    const storage = this.getStorage();

    if (!storage) {
      throw new Error(
        'El almacenamiento del navegador no está disponible.',
      );
    }

    return storage;
  }

  private isRecord(
    value: unknown,
  ): value is Record<string, unknown> {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    );
  }

  private isStoredSession(
    value: unknown,
  ): value is StoredAuthSession {
    if (!this.isRecord(value)) {
      return false;
    }

    const expiresAt = value['expiresAt'];
    const usuario = value['usuario'];

    if (
      value['version'] !== 1 ||
      typeof value['accessToken'] !== 'string' ||
      !value['accessToken'].trim() ||
      typeof value['refreshToken'] !== 'string' ||
      !/^[a-f0-9]{64}$/.test(value['refreshToken']) ||
      !this.isRecord(expiresAt) ||
      !this.isRecord(usuario)
    ) {
      return false;
    }

    const accessExpiration =
      expiresAt['accessTokenExpiresAt'];

    const refreshExpiration =
      expiresAt['refreshTokenExpiresAt'];

    const persona = usuario['persona'];

    return (
      typeof accessExpiration === 'string' &&
      Number.isFinite(Date.parse(accessExpiration)) &&

      typeof refreshExpiration === 'string' &&
      Number.isFinite(Date.parse(refreshExpiration)) &&

      typeof usuario['id_usuario'] === 'number' &&
      Number.isSafeInteger(usuario['id_usuario']) &&
      usuario['id_usuario'] > 0 &&

      typeof usuario['rol'] === 'string' &&
      AUTH_ROLES.includes(usuario['rol'] as AuthRol) &&

      typeof usuario['correo'] === 'string' &&
      typeof usuario['password_reset_required'] === 'boolean' &&

      this.isRecord(persona) &&
      typeof persona['id_persona'] === 'number' &&
      persona['id_persona'] === usuario['persona_id']
    );
  }

  private createFallbackUuid(): string {
    // Solo identifica al navegador.
    // No se utiliza como credencial de autenticación.
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
      .replace(/[xy]/g, (character) => {
        const randomValue =
          Math.floor(Math.random() * 16);

        const value =
          character === 'x'
            ? randomValue
            : (randomValue & 0x3) | 0x8;

        return value.toString(16);
      });
  }
}
