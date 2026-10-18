
import { ApiResponse } from 'src/app/core/models/api-response.model';
import {  ExpedienteDetalleData} from './get-expediente-by-id.interface';

// *********************************************************
// RESPONSE
// *********************************************************

export type GetExpedienteByNumeroResponse = ApiResponse<ExpedienteDetalleData>;
