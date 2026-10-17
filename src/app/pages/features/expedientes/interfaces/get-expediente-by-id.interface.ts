
import { ApiResponse } from 'src/app/core/models/api-response.model';
import {
  ExpedientePaginadoItem,
  ExpedienteResponsableData,
} from './get-expediente-paginated.interface';

// *********************************************************
// RESPONSE: DATA
// *********************************************************

export interface ExpedienteDetalleData
  extends ExpedientePaginadoItem {
  creador: ExpedienteResponsableData | null;
  actualizador: ExpedienteResponsableData | null;
}

// *********************************************************
// RESPONSE
// *********************************************************

export type GetExpedienteByIdResponse = ApiResponse<ExpedienteDetalleData>;
