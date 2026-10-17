
import { ApiResponse } from 'src/app/core/models/api-response.model';
import {
  ExpedienteEstado,
  ExpedienteEstadoProcesal,
} from './create-expediente.interface';

import {
  ExpedientesPaginacion,
  ExpedientesSortOrder,
} from './get-expediente-paginated.interface';

// *********************************************************
// TIPOS
// *********************************************************

export type ExpedienteHistorialSortBy =
  | 'id_historial'
  | 'fecha_accion'
  | 'createdAt';

// *********************************************************
// FILTROS
// *********************************************************

export interface ExpedienteHistorialFilters {
  page?: number;
  limit?: number;

  /** Ejemplos: CAMBIO_ESTADO, REGISTRO_MPV, CIERRE. */
  tipo_evento?: string;

  usuario_id?: number;

  /** Fechas ISO para filtrar fecha_accion. */
  fecha_desde?: string;
  fecha_hasta?: string;

  sort_by?: ExpedienteHistorialSortBy;
  sort_order?: ExpedientesSortOrder;
}

// *********************************************************
// USUARIO DEL EVENTO
// *********************************************************

export interface ExpedienteHistorialUsuarioData {
  id_usuario: number;
  correo: string;
}

// *********************************************************
// ITEM DEL HISTORIAL
// *********************************************************

export interface ExpedienteHistorialItem {
  id_historial: number;
  id_expediente: number;

  tipo_evento: string;
  accion: string;

  /** Texto libre o JSON serializado, según el evento. */
  detalle: string | null;

  usuario_id: number | null;

  /** Nombre del actor conservado al registrar el evento. */
  usuario_responsable: string | null;

  estado_anterior: ExpedienteEstado | null;
  estado_nuevo: ExpedienteEstado | null;

  estado_procesal_anterior: ExpedienteEstadoProcesal | null;
  estado_procesal_nuevo: ExpedienteEstadoProcesal | null;

  fecha_accion: string;
  createdAt: string;

  usuario: ExpedienteHistorialUsuarioData | null;
}

// *********************************************************
// RESPONSE: DATA
// *********************************************************

export interface ExpedienteHistorialData {
  id_expediente: number;
  items: ExpedienteHistorialItem[];
  paginacion: ExpedientesPaginacion;
}

// *********************************************************
// RESPONSE
// *********************************************************

export type GetExpedienteHistorialResponse =  ApiResponse<ExpedienteHistorialData>;
