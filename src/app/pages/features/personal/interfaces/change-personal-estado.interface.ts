import { TipoPersonal } from ".";

// *********************************************************
// REQUEST
// *********************************************************
export interface ChangePersonalEstadoRequest {
  estado: boolean;
}

// *********************************************************
// CAMPOS COMUNES
// *********************************************************
type ChangePersonalEstadoBase = {
  persona_id: number;
  estado_anterior: boolean;
  estado: boolean;
  actualizado: boolean;
};

// *********************************************************
// CAMPOS SEGÚN EL TIPO DE PERSONAL
// *********************************************************
type ChangePersonalEstadoMap = {
  SECRETARIA: {
    tipo_personal: 'SECRETARIA';
    id_secretaria: number;
  };

  ARBITRO: {
    tipo_personal: 'ARBITRO';
    id_arbitro: number;
    disponible_anterior: boolean;
    disponible: boolean;
  };

  ADJUDICADOR: {
    tipo_personal: 'ADJUDICADOR';
    id_adjudicador: number;
    disponible_anterior: boolean;
    disponible: boolean;
  };

  STAFF_INTERNO: {
    tipo_personal: 'STAFF_INTERNO';
    id_staff_interno: number;
  };
};

// *********************************************************
// RESPONSE DATA
// *********************************************************
export type ChangePersonalEstadoData<
  T extends TipoPersonal = TipoPersonal,
> = ChangePersonalEstadoBase & ChangePersonalEstadoMap[T];

// *********************************************************
// RESPONSE
// *********************************************************
export interface ChangePersonalEstadoResponse<
  T extends TipoPersonal = TipoPersonal,
> {
  success: boolean;
  message: string;
  data: ChangePersonalEstadoData<T>;
}
