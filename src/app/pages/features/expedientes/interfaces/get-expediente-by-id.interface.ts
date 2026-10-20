import { ApiResponse } from 'src/app/core/models/api-response.model';

import {
  ExpedientePaginadoItem,
  ExpedienteResponsableData,
} from './get-expediente-paginated.interface';

// *********************************************************
// RESPONSE: DATA
// Hereda los datos generales, responsable y participes.
// Cada partícipe incluye su relación persona.
// *********************************************************

export interface ExpedienteDetalleData
  extends ExpedientePaginadoItem {
  creador: ExpedienteResponsableData | null;
  actualizador: ExpedienteResponsableData | null;
}

// *********************************************************
// RESPONSE
// *********************************************************

export type GetExpedienteByIdResponse =
  ApiResponse<ExpedienteDetalleData>;
