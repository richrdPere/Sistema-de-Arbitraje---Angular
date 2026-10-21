import { DocumentoPaginatedData, DocumentosPaginacion } from "./get-documentos-paginated.interface";

export interface GetDocumentosByTramiteFilters {
  page?: number;
  limit?: number;
}

export interface GetDocumentosByTramiteResponse {
  success: boolean;
  message: string;

  data: {
    documentos: DocumentoPaginatedData[];
    paginacion: DocumentosPaginacion;
  };
}
