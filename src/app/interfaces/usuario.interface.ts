export interface Persona {
  id: number;
  tipo: 'NATURAL' | 'JURIDICA' | 'ENTIDAD_PUBLICA';

  nombres?: string;
  apellidos?: string;
  dni?: string;

  ruc?: string;
  razon_social?: string;
  nombre_entidad?: string;

  email?: string;
  direccion?: string;
  telefono?: string;

  estado: boolean;
}


export interface Usuario {
  id: number;
  persona_id: number;

  correo: string;
  rol: 'admin' | 'secretaria' | 'participe' | 'arbitro' | 'adjudicador' | 'staff_interno';

  estado: boolean;
  foto_perfil?: string;

  correo_verificado: boolean;
  password_reset_required: boolean;
}


export interface Arbitro {
  id_arbitro: number;
  persona_id: number;
  usuario_id?: number;

  cargo: string;
  especialidad?: string;
  experiencia?: string;
  numero_colegiatura?: string;
  certificado_pdf?: string;
  disponible: boolean;
}


export interface Secretaria {
  id_secretaria: number;
  persona_id: number;
  usuario_id: number;

  cargo: string;
  fecha_ingreso?: Date;
  estado: boolean;
}


export interface Adjudicador {
  id: number;
  persona_id: number;
}

export interface Participe {
  id_participe: number;
  persona_id: number;
  expediente_id: number;

  rol_participe: 'DEMANDANTE' | 'DEMANDADO' | 'TERCERO';
  estado: boolean;
}

// RESPONSE
// - Detalle de un usuario
export interface UsuarioDetalleResponse {
  usuario: Usuario;
  persona: Persona;
  detalle: Arbitro | Secretaria | Adjudicador | Participe[] | null;
}

// REQUEST
// - Crear un usuario
export interface CreateUsuarioRequest {
  persona: Partial<Persona>;
  usuario: {
    correo: string;
    password: string;
    rol: Usuario['rol'];
  };
  detalle?: any; // luego lo puedes tipar por rol
}
