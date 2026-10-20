// *********************************************************
// TIPOS
// *********************************************************

export type PersonaTipo =
  | 'NATURAL'
  | 'JURIDICA'
  | 'ENTIDAD_PUBLICA';

// *********************************************************
// REQUEST
// *********************************************************

export interface PersonaCamposOpcionales {
  nombres?: string | null;
  apellidos?: string | null;
  dni?: string | null;
  cargo?: string | null;
  ruc?: string | null;
  razon_social?: string | null;
  nombre_entidad?: string | null;
  email?: string | null;
  direccion?: string | null;
  telefono?: string | null;
}

export interface CreatePersonaNaturalRequest
  extends PersonaCamposOpcionales {
  tipo: 'NATURAL';
  nombres: string;
  apellidos: string;
}

export interface CreatePersonaJuridicaRequest
  extends PersonaCamposOpcionales {
  tipo: 'JURIDICA';
  razon_social: string;
}

export interface CreatePersonaEntidadPublicaRequest
  extends PersonaCamposOpcionales {
  tipo: 'ENTIDAD_PUBLICA';
  nombre_entidad: string;
}

export type CreatePersonaRequest =
  | CreatePersonaNaturalRequest
  | CreatePersonaJuridicaRequest
  | CreatePersonaEntidadPublicaRequest;

// *********************************************************
// DATA
// *********************************************************

export interface PersonaData extends PersonaCamposOpcionales {
  id_persona: number;
  tipo: PersonaTipo;
  estado: boolean;
}

export interface CreatePersonaData {
  persona: PersonaData;
}

// *********************************************************
// RESPONSE
// *********************************************************

export interface CreatePersonaResponse {
  success: boolean;
  message: string;
  data: CreatePersonaData;
}
