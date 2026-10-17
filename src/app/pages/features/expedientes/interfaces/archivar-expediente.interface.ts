
import { ApiResponse } from 'src/app/core/models/api-response.model';
import {
  ExpedientePaginadoItem,
} from './get-expediente-paginated.interface';

// *********************************************************
// REQUEST
// *********************************************************

export interface ArchivarExpedienteRequest {
  motivo: string;
}

// *********************************************************
// RESPONSE: DATA
// No incluye relaciones.
// *********************************************************

export type ArchivarExpedienteData =
  Omit<ExpedientePaginadoItem, 'responsable' | 'estado'> & {
    estado: 'ARCHIVADO';
  };

// *********************************************************
// RESPONSE
// *********************************************************

export type ArchivarExpedienteResponse = ApiResponse<ArchivarExpedienteData>;
