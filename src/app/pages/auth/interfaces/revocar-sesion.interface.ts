// *********************************************************
// DATA
// *********************************************************
export interface RevocarSesionData {
  familia_id: string;
  tokens_revocados: number;
  sesion_revocada: boolean;
}

// *********************************************************
// RESPONSE
// *********************************************************
export interface RevocarSesionResponse {
  success: boolean;
  message: string;
  data: RevocarSesionData;
}
