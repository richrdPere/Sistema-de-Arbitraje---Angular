import { CreatePersonalRequestMap, PersonalDataMap, TipoPersonal } from ".";

// *********************************************************
// REQUEST — ACTUALIZAR PERSONAL
// *********************************************************
export type UpdatePersonalRequest<
  T extends TipoPersonal = TipoPersonal,
> = Partial<
  Omit<CreatePersonalRequestMap[T], 'persona_id'>
>;

// *********************************************************
// RESPONSE — ACTUALIZAR PERSONAL
// *********************************************************
export interface UpdatePersonalResponse<
  T extends TipoPersonal = TipoPersonal,
> {
  success: boolean;
  message: string;

  data: {
    tipo_personal: T;
    personal: PersonalDataMap[T];
  };
}
