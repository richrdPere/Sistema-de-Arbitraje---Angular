import { PersonaTipo } from './create-persona.interface';

// *********************************************************
// TIPOS DE ORDENAMIENTO
// *********************************************************

export type PersonasSortBy =
  | 'id_persona'
  | 'tipo'
  | 'nombres'
  | 'apellidos'
  | 'razon_social'
  | 'nombre_entidad'
  | 'createdAt'
  | 'updatedAt';

export type PersonasSortOrder = 'ASC' | 'DESC';

// *********************************************************
// FILTROS
// *********************************************************

export interface PersonasPaginatedFilters {
  page?: number;
  limit?: number;
  search?: string;
  tipo?: PersonaTipo;
  estado?: boolean;
  sort_by?: PersonasSortBy;
  sort_order?: PersonasSortOrder;
}

// *********************************************************
// PERSONA DEL LISTADO
// *********************************************************

export interface PersonaPaginatedItem {
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

  // Fechas ISO recibidas como cadenas.
  createdAt: string;
  updatedAt: string;
}

// *********************************************************
// PAGINACIÓN
// *********************************************************

export interface PersonasPaginacion {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}

// *********************************************************
// DATA
// *********************************************************

export interface PersonasPaginatedData {
  personas: PersonaPaginatedItem[];
  paginacion: PersonasPaginacion;
}

// *********************************************************
// RESPONSE
// *********************************************************

export interface PersonasPaginatedResponse {
  success: boolean;
  message: string;
  data: PersonasPaginatedData;
}
