import { PersonaTipo } from './create-persona.interface';

// *********************************************************
// FILTROS
// Debe enviarse al menos un criterio de búsqueda.
// *********************************************************

export interface PersonasSelectorFilters {
  dni?: string;
  ruc?: string;
  nombres?: string;
  razon_social?: string;
  nombre_entidad?: string;
  tipo?: PersonaTipo;
  limit?: number;
}

// *********************************************************
// PERSONA DEL SELECTOR
// *********************************************************

export interface PersonaSelectorItem {
  id_persona: number;
  tipo: PersonaTipo;

  nombres: string | null;
  apellidos: string | null;
  dni: string | null;
  cargo: string | null;

  ruc: string | null;
  razon_social: string | null;
  nombre_entidad: string | null;

  email: string | null;
  direccion: string | null;
  telefono: string | null;

  estado: boolean;
}

// *********************************************************
// DATA
// *********************************************************

export interface PersonasSelectorData {
  total: number;
  personas: PersonaSelectorItem[];
}

// *********************************************************
// RESPONSE
// *********************************************************

export interface PersonasSelectorResponse {
  success: boolean;
  message: string;
  data: PersonasSelectorData;
}
