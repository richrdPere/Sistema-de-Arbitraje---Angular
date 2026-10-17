import {
  MesaPartesTipoSolicitud,
} from './register-tramite-publico.interface';

import {
  MesaPartesEstadoExpediente,
  MesaPartesEstadoProcesal,
} from './get-tramites-paginated.interface';

// *********************************************************
// REQUEST
// *********************************************************

export interface RechazarTramiteRequest {
  /** Obligatorio; máximo 10000 caracteres. */
  observaciones: string;
}

// *********************************************************
// TRÁMITE RECHAZADO
// *********************************************************

export interface RechazarTramiteDetalle {
  id_tramite: number;
  numero_tramite: string;
  tipo_solicitud: MesaPartesTipoSolicitud;

  descripcion: string | null;
  archivo_url: string | null;

  estado: 'RECHAZADA';

  persona_id: number;
  usuario_id: number | null;
  expediente_id: number | null;
  usuario_revision_id: number;

  fecha_aprobacion: null;

  /** Fecha ISO 8601. */
  fecha_rechazo: string;

  observaciones: string;

  createdAt: string;
  updatedAt: string;
}

// *********************************************************
// EXPEDIENTE
// *********************************************************

export interface RechazarTramiteExpediente {
  id_expediente: number;
  numero_expediente: string;

  estado: MesaPartesEstadoExpediente;
  estado_procesal: MesaPartesEstadoProcesal;
}

// *********************************************************
// DATA
// *********************************************************

export interface RechazarTramiteData {
  tramite: RechazarTramiteDetalle;
  estado_anterior: 'PENDIENTE';
  expediente: RechazarTramiteExpediente | null;
}

// *********************************************************
// RESPONSE
// *********************************************************

export interface RechazarTramiteResponse {
  success: boolean;
  message: string;
  data: RechazarTramiteData;
}
