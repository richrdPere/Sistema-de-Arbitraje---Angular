import { PersonalDataMap, TipoPersonal } from "./create-personal.interface";


// *********************************************************
// RESPUESTA — OBTENER PERSONAL POR ID
// *********************************************************
export interface GetPersonalByIdResponse<
  T extends TipoPersonal = TipoPersonal,
> {
  success: boolean;
  message: string;

  data: {
    tipo_personal: T;
    personal: PersonalDataMap[T];
  };
}
