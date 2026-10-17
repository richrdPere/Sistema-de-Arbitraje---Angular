// Ajusta la ruta al ApiResponse que ya utilizas.

import { ApiResponse } from "src/app/core/models/api-response.model";

// *********************************************************
// TIPOS
// *********************************************************

export type ExpedienteTipo =
  | 'ARBITRAJE_DE_EMERGENCIA'
  | 'ARBITRAJE_AD_HOC'
  | 'ARBITRAJE_INSTITUCIONAL';

export type ExpedienteOrigen = 'MPV' | 'MANUAL';

export type ExpedienteEstado =
  | 'SUSPENDIDO'
  | 'EN_ESPERA'
  | 'EN_TRAMITE'
  | 'CONCLUIDO'
  | 'ARCHIVADO'
  | 'ANULADO';

export type ExpedienteEstadoProcesal =
  | 'Prearbitral'
  | 'Instalación'
  | 'Postulatoria'
  | 'Fijación de puntos controvertidos'
  | 'Admisión de medios probatorios'
  | 'Actuación pericial'
  | 'Actuación probatoria'
  | 'Cierre de etapa probatoria'
  | 'Alegatos'
  | 'Audiencia'
  | 'Plazo para laudar'
  | 'Plazo para resolver pedido contra Laudo Arbitral'
  | 'Concluido con Laudo Arbitral Consentido'
  | 'Concluido con pedido contra Laudo Arbitral'
  | 'Recusación de arbitro'
  | 'Recusación de adjudicador'
  | 'Reconstitución de Tribunal Arbitral'
  | 'Reconstitución de JPRD';

// *********************************************************
// REQUEST: PERSONA NATURAL
// Corresponde al caso que compartiste.
// *********************************************************

export interface CreateExpedientePersonaRequest {
  tipo: 'NATURAL';
  nombres: string;
  apellidos: string;
  dni: string;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
}

// *********************************************************
// REQUEST: DATOS DEL EXPEDIENTE
// *********************************************************

export interface CreateExpedienteDatosRequest {
  codigo: string;
  titulo: string;
  descripcion?: string | null;
  tipo: ExpedienteTipo;

  /** Fecha ISO con zona horaria o YYYY-MM-DD. */
  fecha_inicio?: string | null;
  fecha_laudo?: string | null;
  fecha_resolucion?: string | null;

  /**
   * Omitido: se asigna al usuario autenticado.
   * null: se registra sin responsable.
   */
  usuario_responsable_id?: number | null;
}

// *********************************************************
// REQUEST
// *********************************************************

export interface CreateExpedienteRequest {
  persona: CreateExpedientePersonaRequest;
  expediente: CreateExpedienteDatosRequest;
}

// *********************************************************
// RESPONSE: PERSONA NATURAL
// *********************************************************

export interface CreateExpedientePersonaData {
  id_persona: number;
  tipo: 'NATURAL';
  nombres: string;
  apellidos: string;
  dni: string;

  email: string | null;
  telefono: string | null;
  direccion: string | null;

  estado: boolean;
  createdAt: string;
  updatedAt: string;
}

// *********************************************************
// RESPONSE: EXPEDIENTE
// *********************************************************

export interface CreateExpedienteDatosData {
  id_expediente: number;
  numero_expediente: string;
  codigo: string;
  titulo: string;
  descripcion: string | null;

  tipo: ExpedienteTipo;
  origen: ExpedienteOrigen;
  estado: ExpedienteEstado;
  estado_procesal: ExpedienteEstadoProcesal;

  fecha_inicio: string | null;
  fecha_laudo: string | null;
  fecha_resolucion: string | null;

  /** Puede omitirse en la respuesta de creación. */
  fecha_cierre?: string | null;

  usuario_responsable_id: number | null;
  created_by: number | null;
  updated_by: number | null;

  createdAt: string;
  updatedAt: string;
}

// *********************************************************
// RESPONSE: PARTÍCIPE CREADO
// *********************************************************

export interface CreateExpedienteParticipeData {
  id_participe: number;
  persona_id: number;
  expediente_id: number;
  rol_participe: 'DEMANDANTE';

  estado: boolean;
  createdAt: string;
  updatedAt: string;
}

// *********************************************************
// RESPONSE: TRÁMITE GENERADO
// *********************************************************

export interface CreateExpedienteTramiteData {
  id_tramite: number;
  numero_tramite: string;
  tipo_solicitud: ExpedienteTipo;
  descripcion: string | null;
  archivo_url: string | null;

  estado: 'APROBADA';

  persona_id: number;
  usuario_id: number;
  expediente_id: number;
  usuario_revision_id: number;

  fecha_aprobacion: string;
  fecha_rechazo: null;
  observaciones: string | null;

  createdAt: string;
  updatedAt: string;
}

// *********************************************************
// RESPONSE: DATA
// *********************************************************

export interface CreateExpedienteData {
  persona: CreateExpedientePersonaData;
  expediente: CreateExpedienteDatosData;
  participe: CreateExpedienteParticipeData;
  tramite: CreateExpedienteTramiteData;
}

// *********************************************************
// RESPONSE
// *********************************************************

export type CreateExpedienteResponse = ApiResponse<CreateExpedienteData>;
