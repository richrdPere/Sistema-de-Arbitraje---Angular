
import { ApiResponse } from 'src/app/core/models/api-response.model';
import {
  ExpedienteDetalleData,
} from './get-expediente-by-id.interface';

import {
  ExpedienteHistorialItem,
} from './get-expediente-historial.interface';

// *********************************************************
// RESUMEN
// *********************************************************

export interface ExpedienteTrazabilidadResumen {
  total_documentos: number;
  total_participes: number;
  total_tramites: number;
  total_movimientos: number;
}

// *********************************************************
// MOVIMIENTO
// No incluye la relación usuario.
// *********************************************************

export type ExpedienteTrazabilidadMovimiento =
  Omit<ExpedienteHistorialItem, 'usuario'>;

// *********************************************************
// RESPONSE: DATA
// *********************************************************

export interface ExpedienteTrazabilidadData {
  expediente: ExpedienteDetalleData;
  resumen: ExpedienteTrazabilidadResumen;

  ultimo_movimiento: ExpedienteTrazabilidadMovimiento | null;
  movimientos_recientes: ExpedienteTrazabilidadMovimiento[];
}

// *********************************************************
// RESPONSE
// *********************************************************

export type GetExpedienteTrazabilidadResponse = ApiResponse<ExpedienteTrazabilidadData>;
