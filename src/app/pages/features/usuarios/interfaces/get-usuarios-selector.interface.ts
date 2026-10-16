import { AuthRol } from "src/app/core/models/auth-session.model";

// *********************************************************
// FILTROS
// *********************************************************
export interface UsuariosSelectorFilters {
  search?: string;
  rol?: AuthRol;
  estado?: boolean;
  limit?: number;
}

// *********************************************************
// ITEM DEL SELECTOR
// *********************************************************
export interface UsuarioSelectorData {
  id_usuario: number;
  persona_id: number;
  nombre: string;
  correo: string;
  rol: AuthRol;
  estado: boolean;
}

// *********************************************************
// DATA
// *********************************************************
export interface UsuariosSelectorData {
  total: number;
  items: UsuarioSelectorData[];
}

// *********************************************************
// RESPONSE
// *********************************************************
export interface UsuariosSelectorResponse {
  success: boolean;
  message: string;
  data: UsuariosSelectorData;
}
