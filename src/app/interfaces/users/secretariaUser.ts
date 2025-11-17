export interface LoginResponse {
  message: string;
  token: string;
  usuario: UsuarioSecretaria;
}

export interface UsuarioSecretaria {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  foto_perfil: string;
  detalles?: {
    id_secretaria: number;
    usuario_id: number;
    cargo: string;
    estado: string;
    createdAt: string;
    updatedAt: string;
  };
}
