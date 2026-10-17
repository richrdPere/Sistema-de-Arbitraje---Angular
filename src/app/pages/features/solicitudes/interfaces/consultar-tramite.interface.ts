import {
  MesaPartesTipoSolicitud,
  MesaPartesEstadoTramite,
} from './register-tramite-publico.interface';

import {
  MesaPartesEstadoExpediente,
  MesaPartesEstadoProcesal,
} from './get-tramites-paginated.interface';

// *********************************************************
// PARÁMETROS DE CONSULTA
// *********************************************************

export interface ConsultarTramiteParams {
  /** Número de trámite o expediente. */
  numero: string;
}

// *********************************************************
// EXPEDIENTE
// *********************************************************

export interface ConsultarTramiteExpediente {
  id_expediente: number;
  numero_expediente: string;
  estado: MesaPartesEstadoExpediente;
  estado_procesal: MesaPartesEstadoProcesal;
}

// *********************************************************
// ITEM
// *********************************************************

export interface ConsultarTramiteItem {
  id_tramite: number;
  numero_tramite: string;
  tipo_solicitud: MesaPartesTipoSolicitud;
  estado: MesaPartesEstadoTramite;

  fecha_aprobacion: string | null;
  fecha_rechazo: string | null;
  observaciones: string | null;

  /** Fechas ISO 8601. */
  createdAt: string;
  updatedAt: string;

  expediente: ConsultarTramiteExpediente | null;
}

// *********************************************************
// DATA
// *********************************************************

export interface ConsultarTramiteData {
  items: ConsultarTramiteItem[];
}

// *********************************************************
// RESPONSE
// *********************************************************

export interface ConsultarTramiteResponse {
  success: boolean;
  message: string;
  data: ConsultarTramiteData;
}
