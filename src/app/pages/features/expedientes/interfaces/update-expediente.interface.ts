
import { ApiResponse } from 'src/app/core/models/api-response.model';
import { ExpedienteTipo } from './create-expediente.interface';

import { ExpedientePaginadoItem } from './get-expediente-paginated.interface';

// *********************************************************
// REQUEST: CAMPOS EDITABLES
// *********************************************************

export interface UpdateExpedienteDatosRequest {
  codigo?: string;
  titulo?: string;
  descripcion?: string | null;
  tipo?: ExpedienteTipo;

  fecha_inicio?: string | null;
  fecha_laudo?: string | null;
  fecha_resolucion?: string | null;
}

// *********************************************************
// REQUEST
// *********************************************************

export interface UpdateExpedienteRequest {
  expediente: UpdateExpedienteDatosRequest;
}

// *********************************************************
// RESPONSE: EXPEDIENTE
// La actualización no devuelve relaciones.
// *********************************************************

export type UpdateExpedienteDatosData =
  Omit<ExpedientePaginadoItem, 'responsable'>;

// *********************************************************
// RESPONSE: DATA
// *********************************************************

export interface UpdateExpedienteData {
  modificado: boolean;
  expediente: UpdateExpedienteDatosData;
}

// *********************************************************
// RESPONSE
// *********************************************************

export type UpdateExpedienteResponse = ApiResponse<UpdateExpedienteData>;
