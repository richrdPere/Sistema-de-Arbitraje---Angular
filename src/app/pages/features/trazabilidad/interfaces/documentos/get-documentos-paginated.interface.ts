import { DocumentoData } from "./subir-documento.interface";

// *********************************************************
// FILTROS — DOCUMENTOS PAGINADOS
// *********************************************************

export type DocumentosSortOrder = 'ASC' | 'DESC';

export interface GetDocumentosPaginatedFilters {
  page?: number;
  limit?: number;
  search?: string;

  tipo_documento?: string;
  tipo_archivo?: string;
  proveedor_almacenamiento?: string;

  expediente_id?: number;
  tramite_id?: number;
  usuario_id?: number;

  grupo_version?: string;

  estado?: boolean;
  solo_ultima_version?: boolean;

  fecha_desde?: string;
  fecha_hasta?: string;

  sort_by?: string;
  sort_order?: DocumentosSortOrder;
}

// *********************************************************
// RELACIONES — PERSONA
// *********************************************************

export interface DocumentoPersonaData {
  id_persona: number;
  tipo: string;

  nombres: string | null;
  apellidos: string | null;

  razon_social: string | null;
  nombre_entidad: string | null;
}

// *********************************************************
// RELACIONES — USUARIO
// *********************************************************

export interface DocumentoUsuarioData {
  id_usuario: number;
  correo: string;
  rol: string;

  persona: DocumentoPersonaData | null;
}

// *********************************************************
// RELACIONES — EXPEDIENTE
// *********************************************************

export interface DocumentoExpedienteData {
  id_expediente: number;
  numero_expediente: string;
  titulo: string;
  estado: string;
  estado_procesal: string;
}

// *********************************************************
// ITEM — DOCUMENTO PAGINADO
// Reutiliza tu interface DocumentoData.
// *********************************************************

export interface DocumentoPaginatedData extends DocumentoData {
  usuario: DocumentoUsuarioData | null;
  expediente: DocumentoExpedienteData | null;

  // Pendiente de tipar sus campos cuando compartas
  // una respuesta que incluya un trámite.
  tramite: Record<string, unknown> | null;
}

// *********************************************************
// PAGINACIÓN — DOCUMENTOS
// *********************************************************

export interface DocumentosPaginacion {
  total: number;
  page: number;
  limit: number;
  total_pages: number;

  has_next_page: boolean;
  has_previous_page: boolean;
}

// *********************************************************
// RESPONSE — DOCUMENTOS PAGINADOS
// *********************************************************

export interface GetDocumentosPaginatedResponse {
  success: boolean;
  message: string;

  data: {
    documentos: DocumentoPaginatedData[];
    paginacion: DocumentosPaginacion;
  };
}
