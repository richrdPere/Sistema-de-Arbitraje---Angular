import {
  UsuarioDetalleData,
} from './get-usuario-by-id.interface';

// *********************************************************
// REQUEST
// *********************************************************
export interface ChangeCorreoUsuarioRequest {
  correo: string;
}

// *********************************************************
// DATA
// *********************************************************
export interface ChangeCorreoUsuarioData {
  usuario: UsuarioDetalleData;
  tokens_revocados: number;
}

// *********************************************************
// RESPONSE
// *********************************************************
export interface ChangeCorreoUsuarioResponse {
  success: boolean;
  message: string;
  data: ChangeCorreoUsuarioData;
}
