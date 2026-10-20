import { PersonaData } from './create-persona.interface';

// *********************************************************
// FILTROS
// *********************************************************

export type FindPersonaFilters =
  | {
    dni: string;
    ruc?: never;
  }
  | {
    ruc: string;
    dni?: never;
  };

// *********************************************************
// DATA
// *********************************************************

export interface FindPersonaData {
  persona: PersonaData;
}

// *********************************************************
// RESPONSE
// *********************************************************

export interface FindPersonaResponse {
  success: boolean;
  message: string;
  data: FindPersonaData;
}
