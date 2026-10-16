export type AuthRol =
  | 'ADMIN'
  | 'SECRETARIA'
  | 'PARTICIPE'
  | 'ARBITRO'
  | 'ADJUDICADOR'
  | 'STAFF_INTERNO';

export type AuthPersonaTipo =
  | 'NATURAL'
  | 'JURIDICA'
  | 'ENTIDAD_PUBLICA';

// *********************************************************
// PERSONA
// *********************************************************
export interface AuthPersona {
  id_persona: number;
  tipo: AuthPersonaTipo;

  nombres: string | null;
  apellidos: string | null;
  dni: string | null;
  cargo: string | null;

  ruc: string | null;
  razon_social: string | null;
  nombre_entidad: string | null;

  email: string | null;
  direccion: string | null;
  telefono: string | null;

  estado: boolean;
}

// *********************************************************
// USUARIO
// *********************************************************
export interface AuthUsuario {
  id_usuario: number;
  persona_id: number;

  correo: string;
  rol: AuthRol;
  estado: boolean;

  foto_perfil: string | null;

  correo_verificado: boolean;
  password_reset_required: boolean;
  ultimo_acceso: string | null;

  persona: AuthPersona;
}

// *********************************************************
// DATA DE LOGIN Y RENOVACIÓN
// No incluye el envoltorio success/message/data.
// *********************************************************
export interface AuthLoginData {
  token_type: 'Bearer';

  access_token: string;

  /** Duración del access token en segundos. */
  expires_in: number;

  refresh_token: string;

  /** Fecha ISO de expiración del refresh token. */
  refresh_expires_at: string;

  password_reset_required: boolean;

  usuario: AuthUsuario;
}

// *********************************************************
// EXPIRACIONES LOCALES
// *********************************************************
export interface TokenExpiration {
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

// *********************************************************
// SESIÓN ALMACENADA
// *********************************************************
export interface StoredAuthSession {
  version: 1;

  accessToken: string;
  refreshToken: string;

  expiresAt: TokenExpiration;

  usuario: AuthUsuario;
}
