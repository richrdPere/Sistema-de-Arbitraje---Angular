import { AuthUsuario } from "src/app/core/models/auth-session.model";

// *********************************************************
// DATOS COMUNES DE PERSONA
// *********************************************************
export interface RegisterPersonaContacto {
  email?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  cargo?: string | null;
}

// *********************************************************
// PERSONA NATURAL
// *********************************************************
export interface RegisterPersonaNatural
  extends RegisterPersonaContacto {
  tipo: 'NATURAL';

  nombres: string;
  apellidos: string;

  dni?: string | null;
}

// *********************************************************
// PERSONA JURÍDICA
// *********************************************************
export interface RegisterPersonaJuridica
  extends RegisterPersonaContacto {
  tipo: 'JURIDICA';

  razon_social: string;

  ruc?: string | null;
}

// *********************************************************
// ENTIDAD PÚBLICA
// *********************************************************
export interface RegisterEntidadPublica
  extends RegisterPersonaContacto {
  tipo: 'ENTIDAD_PUBLICA';

  nombre_entidad: string;

  ruc?: string | null;
}

// *********************************************************
// PERSONA DEL REQUEST
// *********************************************************
export type RegisterPersonaRequest =
  | RegisterPersonaNatural
  | RegisterPersonaJuridica
  | RegisterEntidadPublica;

// *********************************************************
// REQUEST
// *********************************************************
export interface RegisterUsuarioRequest {
  correo: string;
  password: string;

  persona: RegisterPersonaRequest;
}

// *********************************************************
// USUARIO REGISTRADO
// Estos dos campos no aparecen en tu respuesta de registro,
// pero pueden ser devueltos si el backend los incorpora.
// *********************************************************
export interface RegisterUsuario
  extends Omit<
    AuthUsuario,
    'foto_perfil' | 'ultimo_acceso' | 'rol'
  > {
  rol: 'PARTICIPE';

  foto_perfil?: string | null;
  ultimo_acceso?: string | null;
}

// *********************************************************
// DATA
// *********************************************************
export interface RegisterUsuarioData {
  usuario: RegisterUsuario;
}

// *********************************************************
// RESPONSE
// *********************************************************
export interface RegisterUsuarioResponse {
  success: boolean;
  message: string;

  data: RegisterUsuarioData;
}
