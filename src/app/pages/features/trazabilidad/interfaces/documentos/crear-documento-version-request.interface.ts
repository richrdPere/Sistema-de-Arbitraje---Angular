import { DocumentoData } from "./subir-documento.interface";

export interface CrearDocumentoVersionRequest {
  titulo?: string;
  descripcion?: string | null;
}



export interface CrearDocumentoVersionResponse {
  success: boolean;
  message: string;

  data: {
    documento: DocumentoData;
  };
}
