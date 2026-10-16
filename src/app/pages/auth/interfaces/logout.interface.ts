// *********************************************************
// DATA
// *********************************************************
export interface LogoutData {
  id_usuario: number;
  familia_id: string;
  tokens_revocados: number;
  requiere_nuevo_login: boolean;
}

// *********************************************************
// RESPONSE
// *********************************************************
export interface LogoutResponse {
  success: boolean;
  message: string;
  data: LogoutData;
}
