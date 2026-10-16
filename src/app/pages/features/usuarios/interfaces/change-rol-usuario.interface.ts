import { AuthRol } from "src/app/core/models/auth-session.model";

// *********************************************************
// ROLES ASIGNABLES ACTUALMENTE
// *********************************************************
export type UsuarioRolAsignable = Extract<
  AuthRol,
  'ADMIN' | 'PARTICIPE' | 'STAFF_INTERNO'
>;

// *********************************************************
// REQUEST
// *********************************************************
export interface ChangeRolUsuarioRequest {
  rol: UsuarioRolAsignable;
}

// *********************************************************
// DATA
// *********************************************************
export interface ChangeRolUsuarioData {
  id_usuario: number;
  rol_anterior: AuthRol;
  rol: AuthRol;
  tokens_revocados: number;
}

// *********************************************************
// RESPONSE
// *********************************************************
export interface ChangeRolUsuarioResponse {
  success: boolean;
  message: string;
  data: ChangeRolUsuarioData;
}
