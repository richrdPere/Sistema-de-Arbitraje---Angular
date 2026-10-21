export interface CambiarDocumentoEstadoRequest {
  estado: boolean;
}

export interface CambiarDocumentoEstadoResponse {
  success: boolean;
  message: string;

  data: {
    id_documento: number;
    estado_anterior: boolean;
    estado: boolean;
    actualizado: boolean;
  };
}
