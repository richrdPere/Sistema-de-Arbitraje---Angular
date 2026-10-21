import { DocumentoData } from "./subir-documento.interface";

export interface ActualizarDocumentoMetadatosRequest {
  titulo?: string;
  descripcion?: string | null;
}

export interface ActualizarDocumentoMetadatosResponse {
  success: boolean;
  message: string;

  data: {
    documento: DocumentoData;
    actualizado: boolean;
  };
}
