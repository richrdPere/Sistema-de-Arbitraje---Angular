import { PersonalDataMap, TipoPersonal } from "./create-personal.interface";

// *********************************************************
// CAMPOS DE ORDENAMIENTO
// *********************************************************
type PersonalSortComun =
  | 'persona_id'
  | 'estado'
  | 'createdAt'
  | 'updatedAt';

type PersonalSortProfesional =
  | 'cargo'
  | 'especialidad'
  | 'numero_colegiatura'
  | 'disponible';

type PersonalSortMap = {
  SECRETARIA:
  | PersonalSortComun
  | 'id_secretaria'
  | 'cargo'
  | 'fecha_ingreso';

  ARBITRO:
  | PersonalSortComun
  | PersonalSortProfesional
  | 'id_arbitro';

  ADJUDICADOR:
  | PersonalSortComun
  | PersonalSortProfesional
  | 'id_adjudicador';

  STAFF_INTERNO:
  | PersonalSortComun
  | 'id_staff_interno';
};

// *********************************************************
// FILTROS
// *********************************************************
export type PersonalPaginadoFilters<
  T extends TipoPersonal = TipoPersonal,
> = {
  page?: number;
  limit?: number;
  persona_id?: number;
  estado?: boolean;
  sort_by?: PersonalSortMap[T];
  sort_order?: 'ASC' | 'DESC';
} & (
    T extends 'ARBITRO' | 'ADJUDICADOR'
    ? { disponible?: boolean }
    : { disponible?: never }
  );

// *********************************************************
// PAGINACIÓN
// *********************************************************
export interface PersonalPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// *********************************************************
// RESPUESTA
// *********************************************************
export interface PersonalPaginadoResponse<
  T extends TipoPersonal = TipoPersonal,
> {
  success: boolean;
  message: string;

  data: {
    tipo_personal: T;
    items: PersonalDataMap[T][];
    pagination: PersonalPagination;
  };
}
