import { TipoPersonal } from ".";

// *********************************************************
// TIPOS QUE ADMITEN DISPONIBILIDAD
// *********************************************************
export type TipoPersonalConDisponibilidad = Extract<
  TipoPersonal,
  'ARBITRO' | 'ADJUDICADOR'
>;

// *********************************************************
// REQUEST
// *********************************************************
export interface ChangePersonalDisponibilidadRequest {
  disponible: boolean;
}

// *********************************************************
// RESPONSE DATA
// *********************************************************
export type ChangePersonalDisponibilidadData<
  T extends TipoPersonalConDisponibilidad =
  TipoPersonalConDisponibilidad,
> = T extends 'ARBITRO'
  ? {
    tipo_personal: T;
    id_arbitro: number;
    persona_id: number;
    disponible_anterior: boolean;
    disponible: boolean;
    actualizado: boolean;
  }
  : {
    tipo_personal: T;
    id_adjudicador: number;
    persona_id: number;
    disponible_anterior: boolean;
    disponible: boolean;
    actualizado: boolean;
  };

// *********************************************************
// RESPONSE
// *********************************************************
export interface ChangePersonalDisponibilidadResponse<
  T extends TipoPersonalConDisponibilidad =
  TipoPersonalConDisponibilidad,
> {
  success: boolean;
  message: string;
  data: ChangePersonalDisponibilidadData<T>;
}
