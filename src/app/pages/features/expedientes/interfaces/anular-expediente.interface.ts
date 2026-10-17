
import { ApiResponse } from 'src/app/core/models/api-response.model';
import { ExpedientePaginadoItem } from './get-expediente-paginated.interface';

// *********************************************************
// REQUEST
// *********************************************************

export interface AnularExpedienteRequest {
  motivo: string;
}

// *********************************************************
// RESPONSE: DATA
// No incluye relaciones.
// *********************************************************

export type AnularExpedienteData =
  Omit<ExpedientePaginadoItem, 'responsable' | 'estado'> & {
    estado: 'ANULADO';
  };

// *********************************************************
// RESPONSE
// *********************************************************

export type AnularExpedienteResponse = ApiResponse<AnularExpedienteData>;
