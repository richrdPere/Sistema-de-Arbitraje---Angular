// *********************************************************
// REQUEST
// *********************************************************
export interface ResetPasswordRequest {
  token: string;
  password_nuevo: string;
}

// *********************************************************
// DATA
// *********************************************************
export interface ResetPasswordData {
  password_restablecida: boolean;
  requiere_nuevo_login: boolean;
}

// *********************************************************
// RESPONSE
// *********************************************************
export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data: ResetPasswordData;
}
