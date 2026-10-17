import {
  MesaPartesTipoPersona,
  MesaPartesTipoSolicitud,
  MesaPartesEstadoTramite,
} from './register-tramite-publico.interface';

import {
  MesaPartesEstadoExpediente,
  MesaPartesEstadoProcesal,
} from './get-tramites-paginated.interface';

// *********************************************************
// TIPOS
// *********************************************************

export type MesaPartesRolParticipe =
  | 'DEMANDANTE'
  | 'DEMANDADO'
  | 'TERCERO';

export type MesaPartesOrigenExpediente =
  | 'MPV'
  | 'MANUAL';

export type MesaPartesTipoDocumento =
  | 'RESOLUCION'
  | 'INFORME'
  | 'LAUDO'
  | 'OFICIO'
  | 'ESCRITO'
  | 'DEMANDA'
  | 'CONTESTACION'
  | 'SOLICITUD'
  | 'ACTA'
  | 'CARTA'
  | 'APELACION'
  | 'REPOSICION'
  | 'OTROS';

// *********************************************************
// USUARIO REFERENCIADO
// El backend selecciona únicamente id_usuario.
// *********************************************************

export interface MesaPartesUsuarioReferencia {
  id_usuario: number;
}

// *********************************************************
// IDENTIDAD DE PERSONA
// *********************************************************

export interface MesaPartesPersonaIdentidad {
  id_persona: number;
  tipo: MesaPartesTipoPersona;

  nombres: string | null;
  apellidos: string | null;
  dni: string | null;

  ruc: string | null;
  razon_social: string | null;
  nombre_entidad: string | null;
}

// *********************************************************
// SOLICITANTE DEL DETALLE
// *********************************************************

export interface MesaPartesSolicitanteDetalle
  extends MesaPartesPersonaIdentidad {
  email: string | null;
  direccion: string | null;
  telefono: string | null;
  estado: boolean;
}

// *********************************************************
// PARTÍCIPE
// *********************************************************

export interface MesaPartesParticipeDetalle {
  id_participe: number;
  persona_id: number;
  expediente_id: number;

  rol_participe: MesaPartesRolParticipe;
  estado: boolean;

  createdAt: string;
  updatedAt: string;

  persona: MesaPartesPersonaIdentidad | null;
}

// *********************************************************
// HISTORIAL DEL EXPEDIENTE
// *********************************************************

export interface MesaPartesHistorialDetalle {
  id_historial: number;
  id_expediente: number;

  /** Código de evento; admite nuevos eventos del backend. */
  tipo_evento: string;

  accion: string;
  detalle: string | null;

  usuario_id: number | null;
  usuario_responsable: string | null;

  estado_anterior: MesaPartesEstadoExpediente | null;
  estado_nuevo: MesaPartesEstadoExpediente | null;

  estado_procesal_anterior: MesaPartesEstadoProcesal | null;
  estado_procesal_nuevo: MesaPartesEstadoProcesal | null;

  fecha_accion: string;
  createdAt: string;

  usuario: MesaPartesUsuarioReferencia | null;
}

// *********************************************************
// EXPEDIENTE
// *********************************************************

export interface MesaPartesExpedienteDetalle {
  id_expediente: number;
  numero_expediente: string;
  codigo: string;

  titulo: string;
  descripcion: string | null;

  tipo: MesaPartesTipoSolicitud;
  origen: MesaPartesOrigenExpediente;

  estado: MesaPartesEstadoExpediente;
  estado_procesal: MesaPartesEstadoProcesal;

  fecha_inicio: string | null;
  fecha_laudo: string | null;
  fecha_resolucion: string | null;
  fecha_cierre: string | null;

  usuario_responsable_id: number | null;
  created_by: number | null;
  updated_by: number | null;

  createdAt: string;
  updatedAt: string;

  participes: MesaPartesParticipeDetalle[];
  historial: MesaPartesHistorialDetalle[];
}

// *********************************************************
// DOCUMENTO
// *********************************************************

export interface MesaPartesDocumentoDetalle {
  id_documento: number;
  titulo: string;
  descripcion: string | null;

  tipo_documento: MesaPartesTipoDocumento;

  /** UUID compartido por las versiones del documento. */
  grupo_version: string;

  version: number;

  nombre_original: string;
  tipo_archivo: string;
  mime_type: string;

  /** BIGINT puede llegar como número o cadena. */
  tamano_bytes: number | string;

  sha256: string;
  fecha_subida: string;
  estado: boolean;
}

// *********************************************************
// DATA DEL DETALLE
// *********************************************************

export interface GetTramiteByIdData {
  id_tramite: number;
  numero_tramite: string;

  tipo_solicitud: MesaPartesTipoSolicitud;
  descripcion: string | null;
  archivo_url: string | null;

  estado: MesaPartesEstadoTramite;

  persona_id: number;
  usuario_id: number | null;
  expediente_id: number | null;
  usuario_revision_id: number | null;

  fecha_aprobacion: string | null;
  fecha_rechazo: string | null;
  observaciones: string | null;

  createdAt: string;
  updatedAt: string;

  solicitante: MesaPartesSolicitanteDetalle | null;

  registrador: MesaPartesUsuarioReferencia | null;
  revisor: MesaPartesUsuarioReferencia | null;

  expediente: MesaPartesExpedienteDetalle | null;
  documentos: MesaPartesDocumentoDetalle[];
}

// *********************************************************
// RESPONSE
// *********************************************************

export interface GetTramiteByIdResponse {
  success: boolean;
  message: string;
  data: GetTramiteByIdData;
}
