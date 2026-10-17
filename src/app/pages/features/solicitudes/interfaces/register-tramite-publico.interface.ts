// *********************************************************
// TIPOS
// *********************************************************

export type MesaPartesTipoPersona =
  | 'NATURAL'
  | 'JURIDICA'
  | 'ENTIDAD_PUBLICA';

export type MesaPartesTipoSolicitud =
  | 'ARBITRAJE_DE_EMERGENCIA'
  | 'ARBITRAJE_AD_HOC'
  | 'ARBITRAJE_INSTITUCIONAL';

export type MesaPartesEstadoTramite =
  | 'PENDIENTE'
  | 'APROBADA'
  | 'RECHAZADA';

// *********************************************************
// DATOS DE CONTACTO
// *********************************************************

export interface MesaPartesPersonaContacto {
  email?: string | null;
  direccion?: string | null;
  telefono?: string | null;
}

// *********************************************************
// PERSONA NATURAL
// *********************************************************

export interface MesaPartesPersonaNaturalRequest
  extends MesaPartesPersonaContacto {
  tipo: 'NATURAL';
  nombres: string;
  apellidos: string;

  /** Cadena para conservar los ceros iniciales. */
  dni: string;

  cargo?: string | null;
}

// *********************************************************
// PERSONA JURÍDICA
// *********************************************************

export interface MesaPartesPersonaJuridicaRequest
  extends MesaPartesPersonaContacto {
  tipo: 'JURIDICA';
  ruc: string;
  razon_social: string;
}

// *********************************************************
// ENTIDAD PÚBLICA
// *********************************************************

export interface MesaPartesEntidadPublicaRequest
  extends MesaPartesPersonaContacto {
  tipo: 'ENTIDAD_PUBLICA';
  ruc: string;
  nombre_entidad: string;
}

// *********************************************************
// PERSONA DEL TRÁMITE
// *********************************************************

export type MesaPartesPersonaRequest =
  | MesaPartesPersonaNaturalRequest
  | MesaPartesPersonaJuridicaRequest
  | MesaPartesEntidadPublicaRequest;

// *********************************************************
// SOLICITUD
// *********************************************************

export interface MesaPartesSolicitudRequest {
  /** Obligatorio; máximo 50 caracteres. */
  codigo: string;

  tipo_solicitud: MesaPartesTipoSolicitud;

  descripcion?: string | null;
}

// *********************************************************
// REQUEST JSON
// Se serializa dentro del campo "data" de FormData.
// Los archivos se envían por separado.
// *********************************************************

export interface RegisterTramitePublicoRequest {
  demandante: MesaPartesPersonaRequest;
  demandado: MesaPartesPersonaRequest;
  solicitud: MesaPartesSolicitudRequest;
}

// *********************************************************
// DATA DE RESPUESTA
// *********************************************************

export interface RegisterTramitePublicoData {
  id_tramite: number;
  numero_tramite: string;
  numero_expediente: string;
  estado: 'PENDIENTE';

  /** Fecha ISO 8601. */
  fecha_registro: string;

  total_documentos: number;
}

// *********************************************************
// RESPONSE
// *********************************************************

export interface RegisterTramitePublicoResponse {
  success: boolean;
  message: string;
  data: RegisterTramitePublicoData;
}
