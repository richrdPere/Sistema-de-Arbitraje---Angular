// *********************************************************
// REQUEST
// *********************************************************
export interface ChangeEstadoUsuarioRequest {
  estado: boolean;
}

// *********************************************************
// DATA
// *********************************************************
export interface ChangeEstadoUsuarioData {
  id_usuario: number;
  estado_anterior: boolean;
  estado: boolean;
  tokens_revocados: number;
}

// *********************************************************
// RESPONSE
// *********************************************************
export interface ChangeEstadoUsuarioResponse {
  success: boolean;
  message: string;
  data: ChangeEstadoUsuarioData;
}
