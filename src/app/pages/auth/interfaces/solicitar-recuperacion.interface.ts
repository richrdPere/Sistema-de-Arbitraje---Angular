// *********************************************************
// REQUEST
// *********************************************************
export interface SolicitarRecuperacionRequest {
  correo: string;
}

// *********************************************************
// RESPONSE
// *********************************************************
export interface SolicitarRecuperacionResponse {
  success: boolean;
  message: string;
  data: null;
}
