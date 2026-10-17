
import { ApiResponse } from 'src/app/core/models/api-response.model';
import { ExpedientePaginadoItem } from './get-expediente-paginated.interface';

// *********************************************************
// REQUEST
// *********************************************************

export interface AsignarExpedienteResponsableRequest {
  /** ID del usuario; null para retirar al responsable. */
  usuario_responsable_id: number | null;
  motivo?: string | null;
}

// *********************************************************
// RESPONSE: DATA
// No incluye relaciones.
// *********************************************************

export type AsignarExpedienteResponsableData = Omit<ExpedientePaginadoItem, 'responsable'>;

// *********************************************************
// RESPONSE
// *********************************************************

export type AsignarExpedienteResponsableResponse = ApiResponse<AsignarExpedienteResponsableData>;
