
import { ApiResponse } from 'src/app/core/models/api-response.model';
import {
  ExpedientePaginadoItem,
} from './get-expediente-paginated.interface';

// *********************************************************
// REQUEST
// *********************************************************

export interface ReabrirExpedienteRequest {
  motivo: string;
}

// *********************************************************
// RESPONSE: DATA
// No incluye relaciones.
// *********************************************************

export type ReabrirExpedienteData =
  Omit<
    ExpedientePaginadoItem,
    'responsable' | 'estado' | 'fecha_cierre'
  > & {
    estado: 'EN_TRAMITE';
    fecha_cierre: null;
  };

// *********************************************************
// RESPONSE
// *********************************************************

export type ReabrirExpedienteResponse = ApiResponse<ReabrirExpedienteData>;
