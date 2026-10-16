import { AuthRol } from './auth-session.model';

// *********************************************************
// PAYLOAD DEL ACCESS TOKEN
// *********************************************************
export interface AuthJwtPayload {
  id_usuario: number;
  rol: AuthRol;

  /** Familia de la sesión. */
  sid: string;

  /** Identificador del usuario como cadena. */
  sub: string;

  /** Fechas Unix expresadas en segundos. */
  iat: number;
  exp: number;

  aud: string;
  iss: string;
  jti: string;
}
