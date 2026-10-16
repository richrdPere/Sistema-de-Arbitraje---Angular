import { AuthRol, AuthUsuario } from "src/app/core/models/auth-session.model";
import { RegisterPersonaRequest } from "src/app/pages/auth/interfaces";


// *********************************************************
// ROLES HABILITADOS ACTUALMENTE PARA CREACIÓN
// Los perfiles profesionales están pendientes de integración.
// *********************************************************
export type CreateUsuarioRol = Extract<
  AuthRol,
  'ADMIN' | 'PARTICIPE' | 'STAFF_INTERNO'
>;

// *********************************************************
// DATOS COMUNES DEL REQUEST
// *********************************************************
export interface CreateUsuarioBase {
  correo: string;
  rol: CreateUsuarioRol;
}

// *********************************************************
// REQUEST
// Permite persona nueva O persona existente.
// *********************************************************
export type CreateUsuarioRequest =
  CreateUsuarioBase &
  (
    | {
      persona: RegisterPersonaRequest;
      persona_id?: never;
    }
    | {
      persona_id: number;
      persona?: never;
    }
  );

// *********************************************************
// USUARIO CREADO
// *********************************************************
export interface CreateUsuarioDataUsuario
  extends AuthUsuario {
  createdAt: string;
  updatedAt: string;
}

// *********************************************************
// DATA
// *********************************************************
export interface CreateUsuarioData {
  usuario: CreateUsuarioDataUsuario;
}

// *********************************************************
// RESPONSE
// *********************************************************
export interface CreateUsuarioResponse {
  success: boolean;
  message: string;
  data: CreateUsuarioData;
}
