
import { ApiResponse } from 'src/app/core/models/api-response.model';
import {
  ExpedientePaginadoItem,
} from './get-expediente-paginated.interface';

// *********************************************************
// REQUEST
// *********************************************************

export interface CerrarExpedienteRequest {
  motivo: string;

  /** Fecha ISO. Si se omite, el backend utiliza la fecha actual. */
  fecha_cierre?: string;
}

// *********************************************************
// RESPONSE: DATA
// *********************************************************

export type CerrarExpedienteData =
  Omit<
    ExpedientePaginadoItem,
    'responsable' | 'estado' | 'fecha_cierre'
  > & {
    estado: 'CONCLUIDO';
    fecha_cierre: string;
  };

// *********************************************************
// RESPONSE
// *********************************************************

export type CerrarExpedienteResponse = ApiResponse<CerrarExpedienteData>;
