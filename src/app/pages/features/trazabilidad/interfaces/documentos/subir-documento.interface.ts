// *********************************************************
// REQUEST — SUBIR DOCUMENTO
// *********************************************************

export interface SubirDocumentoRequest {
  titulo: string;
  descripcion?: string | null;
  tipo_documento: string;
  expediente_id: number;
}

// *********************************************************
// DATA — DOCUMENTO
// *********************************************************

export interface DocumentoData {
  id_documento: number;

  titulo: string;
  descripcion: string | null;
  tipo_documento: string;

  grupo_version: string;
  version: number;

  nombre_original: string;
  tipo_archivo: string;
  mime_type: string;
  tamano_bytes: number;
  sha256: string;

  url_s3: string | null;
  proveedor_almacenamiento: string;

  // usuario_id: number;
  usuario_id: number | null;
  expediente_id: number | null;
  tramite_id: number | null;

  fecha_subida: string;
  estado: boolean;

  createdAt: string;
  updatedAt: string;
}

// *********************************************************
// RESPONSE — SUBIR DOCUMENTO
// *********************************************************

export interface SubirDocumentoResponse {
  success: boolean;
  message: string;

  data: {
    documento: DocumentoData;
  };
}
