import { AuthUsuario } from "src/app/core/models/auth-session.model";

// *********************************************************
// DATA
// *********************************************************
export interface UsuarioDetalleData
  extends AuthUsuario {
  createdAt: string;
  updatedAt: string;
}

// *********************************************************
// RESPONSE
// *********************************************************
export interface GetUsuarioByIdResponse {
  success: boolean;
  message: string;
  data: UsuarioDetalleData;
}
