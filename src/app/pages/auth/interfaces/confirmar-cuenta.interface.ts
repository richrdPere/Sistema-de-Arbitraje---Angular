// *********************************************************
// REQUEST
// *********************************************************
export interface ConfirmarCuentaRequest {
  token: string;
}

// *********************************************************
// DATA
// *********************************************************
export interface ConfirmarCuentaData {
  correo_verificado: boolean;
}

// *********************************************************
// RESPONSE
// *********************************************************
export interface ConfirmarCuentaResponse {
  success: boolean;
  message: string;
  data: ConfirmarCuentaData;
}
