import { AuthPersonaTipo, AuthRol, AuthUsuario } from "src/app/core/models/auth-session.model";

// *********************************************************
// ORDENAMIENTO
// *********************************************************
export type UsuariosSortBy =
  | 'id_usuario'
  | 'correo'
  | 'rol'
  | 'estado'
  | 'correo_verificado'
  | 'ultimo_acceso'
  | 'createdAt'
  | 'updatedAt';

export type UsuariosSortOrder =
  | 'ASC'
  | 'DESC';

// *********************************************************
// FILTROS
// *********************************************************
export interface UsuariosPaginatedFilters {
  page?: number;
  limit?: number;
  search?: string;

  rol?: AuthRol;
  estado?: boolean;
  tipo_persona?: AuthPersonaTipo;

  correo_verificado?: boolean;
  password_reset_required?: boolean;

  sort_by?: UsuariosSortBy;
  sort_order?: UsuariosSortOrder;
}

// *********************************************************
// USUARIO DEL LISTADO
// *********************************************************
export interface UsuarioListadoData
  extends AuthUsuario {
  createdAt: string;
  updatedAt: string;
}

// *********************************************************
// PAGINACIÓN
// *********************************************************
export interface UsuariosPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// *********************************************************
// DATA
// *********************************************************
export interface UsuariosPaginatedData {
  items: UsuarioListadoData[];
  pagination: UsuariosPagination;
}

// *********************************************************
// RESPONSE
// *********************************************************
export interface UsuariosPaginatedResponse {
  success: boolean;
  message: string;
  data: UsuariosPaginatedData;
}
