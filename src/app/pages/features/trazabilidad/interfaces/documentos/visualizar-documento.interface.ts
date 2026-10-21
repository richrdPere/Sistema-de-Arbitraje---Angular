export type DocumentoDisposicion = 'inline' | 'attachment';


export interface GetDocumentoAccesoFilters {
  disposicion: DocumentoDisposicion;
}

export interface DocumentoAccesoData {
  id_documento: number;
  nombre_original: string;
  mime_type: string;
  disposicion: DocumentoDisposicion;
  url: string;
  expira_en: string;
}

export interface GetDocumentoAccesoResponse {
  success: boolean;
  message: string;
  data: DocumentoAccesoData;
}
