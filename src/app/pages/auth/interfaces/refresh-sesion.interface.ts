import { AuthLoginData } from "src/app/core/models/auth-session.model";

// *********************************************************
// REQUEST
// *********************************************************
export interface RefreshSesionRequest {
  refresh_token: string;
  dispositivo: string;
}

// *********************************************************
// DATA
// *********************************************************
export type RefreshSesionData = AuthLoginData;

// *********************************************************
// RESPONSE
// *********************************************************
export interface RefreshSesionResponse {
  success: boolean;
  message: string;
  data: RefreshSesionData;
}
