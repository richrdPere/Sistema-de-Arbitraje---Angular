import { Usuario } from "../acta-instalacion.model";
import { Arbitro, Persona } from "../usuario.interface";

export interface ArbitroDetalleResponse {
  id_arbitro: number;

  cargo: string;
  especialidad?: string;
  experiencia?: string;
  numero_colegiatura?: string;
  certificado_pdf?: string;
  disponible: boolean;

  persona: Persona;
  usuario: Usuario | null;

  tiene_acceso_sistema: boolean;
}



// export interface ArbitroConRelaciones extends Arbitro {
//   persona: Persona;
//   usuario?: Usuario | null;
// }


export interface CrearArbitroResponse {
  message: string;

  data: {
    arbitro_id: number;
    persona_id: number;
    usuario_id: number;

    persona: Persona;
    usuario: Usuario;
    arbitro: Arbitro;
  };
}


export interface CreateArbitroRequest {
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  password: string;

  telefono?: string;
  direccion?: string;

  cargo?: string;
  especialidad?: string;
  experiencia?: string;
  numero_colegiatura?: string;
}

export interface UpdateArbitroRequest {
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  email?: string;
  direccion?: string;

  cargo?: string;
  especialidad?: string;
  experiencia?: string;
  numero_colegiatura?: string;

  disponible?: boolean;
}


export interface DeleteArbitroResponse {
  message: string;
}

// Usuario + Persona anidado (según tu include)
export interface UsuarioDetalleSimple {
  id: number;
  correo: string;
  estado: boolean;

  persona?: Persona;
}


// =============================
// ARBITRO CON RELACIONES
// =============================



// =============================
// LISTADO PAGINADO
// =============================
export interface ArbitroListItem {
  id_arbitro: number;

  cargo: string;
  especialidad?: string;
  experiencia?: string;
  disponible: boolean;

  usuario?: {
    id: number;
    correo: string;
    estado: boolean;
    persona?: Persona;
  };
}

// =============================
// RESPONSE PAGINADO
// =============================
export interface ArbitroPaginadoResponse {
  data: ArbitroListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// =============================
// CREATE / UPDATE REQUESTS
// =============================
export interface CreateArbitroRequest {
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  password: string;

  telefono?: string;
  direccion?: string;

  cargo?: string;
  especialidad?: string;
  experiencia?: string;
  numero_colegiatura?: string;
}

export interface UpdateArbitroRequest {
  nombres?: string;
  apellidos?: string;
  telefono?: string;

  especialidad?: string;
  experiencia?: string;
  disponible?: boolean;
}

// =============================
// CREATE / UPDATE REQUESTS
// =============================
export interface ArbitroDisponible {
  id_arbitro: number;

  cargo: string;
  especialidad?: string;
  numero_colegiatura?: string;

  disponible: boolean;

  persona: {
    id: number;
    nombres: string;
    apellidos: string;
    dni: string;
    telefono?: string;
    email?: string;
  };
}

export interface ArbitrosDisponiblesResponse {
  total: number;
  data: ArbitroDisponible[];
}
