// *********************************************************
// DATA
// *********************************************************
export interface LogoutAllData {
  id_usuario: number;
  tokens_revocados: number;
  requiere_nuevo_login: boolean;
}

// *********************************************************
// RESPONSE
// *********************************************************
export interface LogoutAllResponse {
  success: boolean;
  message: string;
  data: LogoutAllData;
}
