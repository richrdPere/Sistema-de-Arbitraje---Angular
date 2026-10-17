import {
  ChangeExpedienteEstadoRequest,
  ChangeExpedienteEstadoResponse,
} from './change-expediente-estado.interface';

// *********************************************************
// REQUEST
// *********************************************************

export interface ReanudarExpedienteRequest
  extends ChangeExpedienteEstadoRequest {
  estado: 'EN_TRAMITE';
}

// *********************************************************
// RESPONSE
// *********************************************************

export type ReanudarExpedienteResponse =
  ChangeExpedienteEstadoResponse;
