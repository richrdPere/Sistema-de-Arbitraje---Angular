
import { ApiResponse } from 'src/app/core/models/api-response.model';
import {
  ExpedienteEstado,
} from './create-expediente.interface';

import {
  ExpedientePaginadoItem,
} from './get-expediente-paginated.interface';

// *********************************************************
// REQUEST
// *********************************************************

export interface ChangeExpedienteEstadoRequest {
  estado: ExpedienteEstado;
  motivo: string;
}

// *********************************************************
// RESPONSE: DATA
// No incluye relaciones.
// *********************************************************

export type ChangeExpedienteEstadoData =
  Omit<ExpedientePaginadoItem, 'responsable'>;

// *********************************************************
// RESPONSE
// *********************************************************

export type ChangeExpedienteEstadoResponse = ApiResponse<ChangeExpedienteEstadoData>;
