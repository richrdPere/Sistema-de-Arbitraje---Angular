import { DocumentoPaginatedData, DocumentosPaginacion } from "./get-documentos-paginated.interface";

// *********************************************************
// FILTROS — DOCUMENTOS POR EXPEDIENTE
// *********************************************************
export interface GetDocumentosByExpedienteFilters {
  page?: number;
  limit?: number;
  solo_ultima_version?: boolean;
}

// *********************************************************
// RESPONSE — DOCUMENTOS POR EXPEDIENTE
// *********************************************************

export interface GetDocumentosByExpedienteResponse {
  success: boolean;
  message: string;

  data: {
    documentos: DocumentoPaginatedData[];
    paginacion: DocumentosPaginacion;
  };
}
