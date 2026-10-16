import { AuthUsuario } from "src/app/core/models/auth-session.model";

// *********************************************************
// DATA
// *********************************************************
export type GetPerfilData = AuthUsuario;

// *********************************************************
// RESPONSE
// *********************************************************
export interface GetPerfilResponse {
  success: boolean;
  message: string;
  data: GetPerfilData;
}
