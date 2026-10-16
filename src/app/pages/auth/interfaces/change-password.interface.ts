// *********************************************************
// REQUEST
// *********************************************************
export interface ChangePasswordRequest {
  password_actual: string;
  password_nuevo: string;
}

// *********************************************************
// DATA
// *********************************************************
export interface ChangePasswordData {
  id_usuario: number;
  password_reset_required: boolean;
  requiere_nuevo_login: boolean;
}

// *********************************************************
// RESPONSE
// *********************************************************
export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  data: ChangePasswordData;
}
