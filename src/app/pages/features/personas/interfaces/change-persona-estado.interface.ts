// *********************************************************
// REQUEST
// *********************************************************

export interface ChangePersonaEstadoRequest {
  estado: boolean;
}

// *********************************************************
// DATA
// *********************************************************

export interface ChangePersonaEstadoData {
  id_persona: number;
  estado_anterior: boolean;
  estado: boolean;
  actualizado: boolean;
}

// *********************************************************
// RESPONSE
// *********************************************************

export interface ChangePersonaEstadoResponse {
  success: boolean;
  message: string;
  data: ChangePersonaEstadoData;
}
