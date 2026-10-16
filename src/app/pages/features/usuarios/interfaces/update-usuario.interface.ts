

import { AuthPersonaTipo } from 'src/app/core/models/auth-session.model';
import { UsuarioDetalleData } from './get-usuario-by-id.interface';

// *********************************************************
// ACTUALIZACIÓN PARCIAL DE PERSONA
// *********************************************************
export interface UpdateUsuarioPersonaRequest {
  tipo?: AuthPersonaTipo;

  nombres?: string;
  apellidos?: string;
  dni?: string | null;
  cargo?: string | null;

  ruc?: string | null;
  razon_social?: string | null;
  nombre_entidad?: string | null;

  email?: string | null;
  direccion?: string | null;
  telefono?: string | null;
}

// *********************************************************
// REQUEST
// *********************************************************
export interface UpdateUsuarioRequest {
  persona?: UpdateUsuarioPersonaRequest;
  foto_perfil?: string | null;
}

// *********************************************************
// RESPONSE
// *********************************************************
export interface UpdateUsuarioResponse {
  success: boolean;
  message: string;
  data: UsuarioDetalleData;
}
