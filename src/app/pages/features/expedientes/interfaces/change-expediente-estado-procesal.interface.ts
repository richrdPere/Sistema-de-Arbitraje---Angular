
import { ApiResponse } from 'src/app/core/models/api-response.model';
import {
  ExpedienteEstadoProcesal,
} from './create-expediente.interface';

import {
  ExpedientePaginadoItem,
} from './get-expediente-paginated.interface';

// *********************************************************
// REQUEST
// *********************************************************

export interface ChangeExpedienteEstadoProcesalRequest {
  estado_procesal: ExpedienteEstadoProcesal;
  motivo?: string | null;
}

// *********************************************************
// RESPONSE: DATA
// No incluye relaciones.
// *********************************************************

export type ChangeExpedienteEstadoProcesalData =
  Omit<ExpedientePaginadoItem, 'responsable'>;

// *********************************************************
// RESPONSE
// *********************************************************

export type ChangeExpedienteEstadoProcesalResponse =
  ApiResponse<ChangeExpedienteEstadoProcesalData>;
