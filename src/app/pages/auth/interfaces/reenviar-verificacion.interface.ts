// *********************************************************
// REQUEST
// *********************************************************
export interface ReenviarVerificacionRequest {
  correo: string;
}

// *********************************************************
// RESPONSE
// *********************************************************
export interface ReenviarVerificacionResponse {
  success: boolean;
  message: string;
  data: null;
}
