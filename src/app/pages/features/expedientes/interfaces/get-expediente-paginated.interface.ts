// Ajusta la ruta según tu proyecto.

import { ApiResponse } from 'src/app/core/models/api-response.model';
import {
  ExpedienteTipo,
  ExpedienteOrigen,
  ExpedienteEstado,
  ExpedienteEstadoProcesal,
} from './create-expediente.interface';

// *********************************************************
// TIPOS DE ORDENAMIENTO
// *********************************************************

export type ExpedientesSortBy =
  | 'id_expediente'
  | 'numero_expediente'
  | 'codigo'
  | 'titulo'
  | 'tipo'
  | 'origen'
  | 'estado'
  | 'estado_procesal'
  | 'fecha_inicio'
  | 'fecha_laudo'
  | 'fecha_resolucion'
  | 'fecha_cierre'
  | 'createdAt'
  | 'updatedAt';

export type ExpedientesSortOrder = 'ASC' | 'DESC';

// *********************************************************
// FILTROS
// *********************************************************

export interface ExpedientesPaginadosFilters {
  page?: number;
  limit?: number;
  search?: string;

  estado?: ExpedienteEstado;
  estado_procesal?: ExpedienteEstadoProcesal;
  tipo?: ExpedienteTipo;
  origen?: ExpedienteOrigen;

  usuario_responsable_id?: number;

  /** Rango aplicado a createdAt. */
  fecha_desde?: string;
  fecha_hasta?: string;

  /** Mes entre 1 y 12. Requiere anio. */
  mes?: number;
  anio?: number;

  sort_by?: ExpedientesSortBy;
  sort_order?: ExpedientesSortOrder;
}

// *********************************************************
// RESPONSABLE
// *********************************************************

export interface ExpedienteResponsableData {
  id_usuario: number;
  correo: string;
}

// *********************************************************
// ITEM DEL LISTADO
// *********************************************************

export interface ExpedientePaginadoItem {
  id_expediente: number;
  numero_expediente: string;
  codigo: string;
  titulo: string;
  descripcion: string | null;

  tipo: ExpedienteTipo;
  origen: ExpedienteOrigen;
  estado: ExpedienteEstado;
  estado_procesal: ExpedienteEstadoProcesal;

  fecha_inicio: string | null;
  fecha_laudo: string | null;
  fecha_resolucion: string | null;
  fecha_cierre: string | null;

  usuario_responsable_id: number | null;
  created_by: number | null;
  updated_by: number | null;

  createdAt: string;
  updatedAt: string;

  responsable: ExpedienteResponsableData | null;
}

// *********************************************************
// PAGINACIÓN
// *********************************************************

export interface ExpedientesPaginacion {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// *********************************************************
// RESPONSE: DATA
// *********************************************************

export interface ExpedientesPaginadosData {
  items: ExpedientePaginadoItem[];
  paginacion: ExpedientesPaginacion;
}

// *********************************************************
// RESPONSE
// *********************************************************

export type ExpedientesPaginadosResponse = ApiResponse<ExpedientesPaginadosData>;
