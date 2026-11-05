import type { ApiResponse } from 'src/app/core/models/api-response.model';
import type { AuthUsuario } from 'src/app/core/models/auth-session.model';

export interface UpdateMiPerfilRequest {
  nombres?: string;
  apellidos?: string;
  telefono?: string | null;
}

export type UpdateMiPerfilResponse = ApiResponse<AuthUsuario>;
