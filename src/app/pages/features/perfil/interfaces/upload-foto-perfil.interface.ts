import type { ApiResponse } from 'src/app/core/models/api-response.model';

export interface UploadFotoPerfilData {
  foto_perfil: string;
  foto_url: string;
}

export type UploadFotoPerfilResponse = ApiResponse<UploadFotoPerfilData>;
