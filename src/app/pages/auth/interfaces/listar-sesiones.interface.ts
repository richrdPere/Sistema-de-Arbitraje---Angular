// *********************************************************
// SESIÓN ACTIVA
// *********************************************************
export interface AuthSesion {
  familia_id: string;

  dispositivo: string | null;
  ip_creacion: string | null;
  user_agent: string | null;

  /** Fecha ISO de emisión del token activo más reciente. */
  fecha_emision_token: string;

  /** Fecha ISO de expiración de la sesión. */
  fecha_expiracion: string;

  es_actual: boolean;
}

// *********************************************************
// DATA
// *********************************************************
export interface ListarSesionesData {
  total: number;
  sesiones: AuthSesion[];
}

// *********************************************************
// RESPONSE
// *********************************************************
export interface ListarSesionesResponse {
  success: boolean;
  message: string;
  data: ListarSesionesData;
}
