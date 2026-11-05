import type { ApiResponse } from 'src/app/core/models/api-response.model';
import type { AuthUsuario } from 'src/app/core/models/auth-session.model';

export type GetMiPerfilResponse = ApiResponse<AuthUsuario>;
