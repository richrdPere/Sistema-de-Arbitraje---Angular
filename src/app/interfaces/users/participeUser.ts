export interface UsuarioParticipe {
  id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: string;
  estado: boolean;
  telefono?: string | null;
  documento_identidad?: string | null;
}

export interface Participe {
  id_participe: number;
  usuario_id: number;
  cargo?: string;
  rol_participe?: 'Demandante' | 'Demandado' | 'Secretario Arbitral' | 'Secretario Técnico';
  tipo_usuario?: 'entidad_publica' | 'proveedor';
  estado: 'Activo' | 'Inactivo';
  id_expediente?: number;
  createdAt?: string;
  updatedAt?: string;
  usuario?: UsuarioParticipe; // Relación con el usuario
}
