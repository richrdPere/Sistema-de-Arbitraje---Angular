export interface Arbitro {
  id?: number;
  usuario_id?: number;
  cargo?: string;
  especialidad?: string;
  experiencia?: string;
  Usuario?: any;
}

export interface Usuario {
  id?: number;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: string;
}
