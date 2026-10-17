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

export interface AprobarTramiteRequest {
  /** Opcional; máximo 10000 caracteres. */
  observaciones?: string | null;
}

// *********************************************************
// TRÁMITE APROBADO
// *********************************************************

export interface AprobarTramiteDetalle {
  id_tramite: number;
  numero_tramite: string;
  tipo_solicitud: MesaPartesTipoSolicitud;

  descripcion: string | null;
  archivo_url: string | null;

  estado: 'APROBADA';

  persona_id: number;
  usuario_id: number | null;
  expediente_id: number | null;
  usuario_revision_id: number;

  /** Fecha ISO 8601. */
  fecha_aprobacion: string;

  fecha_rechazo: null;
  observaciones: string | null;

  createdAt: string;
  updatedAt: string;
}

// *********************************************************
// EXPEDIENTE
// *********************************************************

export interface AprobarTramiteExpediente {
  id_expediente: number;
  numero_expediente: string;

  estado: MesaPartesEstadoExpediente;
  estado_procesal: MesaPartesEstadoProcesal;
}

// *********************************************************
// DATA
// *********************************************************

export interface AprobarTramiteData {
  tramite: AprobarTramiteDetalle;
  estado_anterior: 'PENDIENTE';
  expediente: AprobarTramiteExpediente | null;
}

// *********************************************************
// RESPONSE
// *********************************************************

export interface AprobarTramiteResponse {
  success: boolean;
  message: string;
  data: AprobarTramiteData;
}
