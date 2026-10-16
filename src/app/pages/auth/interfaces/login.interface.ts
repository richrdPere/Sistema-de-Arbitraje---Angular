import { AuthLoginData } from "src/app/core/models/auth-session.model";

// *********************************************************
// REQUEST
// *********************************************************
export interface LoginRequest {
  correo: string;
  password: string;
  dispositivo: string;
}

// *********************************************************
// DATA
// *********************************************************
export type LoginData = AuthLoginData;

// *********************************************************
// RESPONSE
// *********************************************************
export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginData;
}
