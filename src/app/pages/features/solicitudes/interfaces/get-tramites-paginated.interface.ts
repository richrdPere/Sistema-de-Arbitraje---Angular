import {
  MesaPartesTipoPersona,
  MesaPartesTipoSolicitud,
  MesaPartesEstadoTramite,
} from './register-tramite-publico.interface';

// *********************************************************
// TIPOS DE ORDENAMIENTO
// *********************************************************

export type MesaPartesSortBy =
  | 'id_tramite'
  | 'numero_tramite'
  | 'tipo_solicitud'
  | 'estado'
  | 'fecha_aprobacion'
  | 'fecha_rechazo'
  | 'createdAt'
  | 'updatedAt';

export type MesaPartesSortOrder = 'ASC' | 'DESC';

// *********************************************************
// ESTADOS DEL EXPEDIENTE
// *********************************************************

export type MesaPartesEstadoExpediente =
  | 'SUSPENDIDO'
  | 'EN_ESPERA'
  | 'EN_TRAMITE'
  | 'CONCLUIDO'
  | 'ARCHIVADO'
  | 'ANULADO';

export type MesaPartesEstadoProcesal =
  | 'Prearbitral'
  | 'Instalación'
  | 'Postulatoria'
  | 'Fijación de puntos controvertidos'
  | 'Admisión de medios probatorios'
  | 'Actuación pericial'
  | 'Actuación probatoria'
  | 'Cierre de etapa probatoria'
  | 'Alegatos'
  | 'Audiencia'
  | 'Plazo para laudar'
  | 'Plazo para resolver pedido contra Laudo Arbitral'
  | 'Concluido con Laudo Arbitral Consentido'
  | 'Concluido con pedido contra Laudo Arbitral'
  | 'Recusación de arbitro'
  | 'Recusación de adjudicador'
  | 'Reconstitución de Tribunal Arbitral'
  | 'Reconstitución de JPRD';

// *********************************************************
// FILTROS
// *********************************************************

export interface GetTramitesPaginatedFilters {
  page?: number;
  limit?: number;
  search?: string;

  estado?: MesaPartesEstadoTramite;
  tipo_solicitud?: MesaPartesTipoSolicitud;

  persona_id?: number;
  expediente_id?: number;
  usuario_revision_id?: number;

  /** Formato YYYY-MM-DD. */
  fecha_inicio?: string;

  /** Formato YYYY-MM-DD. */
  fecha_fin?: string;

  sort_by?: MesaPartesSortBy;
  sort_order?: MesaPartesSortOrder;
}

// *********************************************************
// SOLICITANTE DEL LISTADO
// *********************************************************

export interface MesaPartesSolicitanteListado {
  id_persona: number;
  tipo: MesaPartesTipoPersona;

  nombres: string | null;
  apellidos: string | null;
  dni: string | null;

  ruc: string | null;
  razon_social: string | null;
  nombre_entidad: string | null;

  email: string | null;
  telefono: string | null;
}

// *********************************************************
// EXPEDIENTE DEL LISTADO
// *********************************************************

export interface MesaPartesExpedienteListado {
  id_expediente: number;
  numero_expediente: string;
  codigo: string;

  tipo: MesaPartesTipoSolicitud;
  estado: MesaPartesEstadoExpediente;
  estado_procesal: MesaPartesEstadoProcesal;

  /** Fecha ISO 8601, cuando existe. */
  fecha_inicio: string | null;
}

// *********************************************************
// ITEM DEL LISTADO
// *********************************************************

export interface MesaPartesTramiteListado {
  id_tramite: number;
  numero_tramite: string;

  tipo_solicitud: MesaPartesTipoSolicitud;
  descripcion: string | null;
  archivo_url: string | null;

  estado: MesaPartesEstadoTramite;

  persona_id: number;
  usuario_id: number | null;
  expediente_id: number | null;
  usuario_revision_id: number | null;

  fecha_aprobacion: string | null;
  fecha_rechazo: string | null;
  observaciones: string | null;

  createdAt: string;
  updatedAt: string;

  solicitante: MesaPartesSolicitanteListado | null;
  expediente: MesaPartesExpedienteListado | null;
}

// *********************************************************
// PAGINACIÓN
// *********************************************************

export interface MesaPartesPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// *********************************************************
// DATA
// *********************************************************

export interface GetTramitesPaginatedData {
  items: MesaPartesTramiteListado[];
  pagination: MesaPartesPagination;
}

// *********************************************************
// RESPONSE
// *********************************************************

export interface GetTramitesPaginatedResponse {
  success: boolean;
  message: string;
  data: GetTramitesPaginatedData;
}
