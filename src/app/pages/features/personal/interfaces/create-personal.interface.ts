export type TipoPersonal =
  | 'SECRETARIA'
  | 'ARBITRO'
  | 'ADJUDICADOR'
  | 'STAFF_INTERNO';

export interface CreateSecretariaRequest {
  persona_id: number;
  cargo?: string;
  fecha_ingreso?: string | null;
  estado?: boolean;
}

export interface CreateArbitroRequest {
  persona_id: number;
  cargo?: string;
  especialidad?: string | null;
  experiencia?: string | null;
  numero_colegiatura?: string | null;
  disponible?: boolean;
  estado?: boolean;
}

export interface CreateAdjudicadorRequest {
  persona_id: number;
  cargo?: string;
  especialidad?: string | null;
  experiencia?: string | null;
  numero_colegiatura?: string | null;
  disponible?: boolean;
  estado?: boolean;
}

export interface CreateStaffInternoRequest {
  persona_id: number;
  estado?: boolean;
}


export interface SecretariaData {
  id_secretaria: number;
  persona_id: number;
  cargo: string;
  fecha_ingreso: string | null;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ArbitroData {
  id_arbitro: number;
  persona_id: number;
  cargo: string;
  especialidad: string | null;
  experiencia: string | null;
  numero_colegiatura: string | null;
  certificado_pdf: string | null;
  disponible: boolean;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdjudicadorData {
  id_adjudicador: number;
  persona_id: number;
  cargo: string;
  especialidad: string | null;
  experiencia: string | null;
  numero_colegiatura: string | null;
  acreditacion_pdf: string | null;
  disponible: boolean;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
}

// Campos contemplados por la configuración actual.
// Completar al revisar el modelo StaffInterno.
export interface StaffInternoData {
  id_staff_interno: number;
  persona_id: number;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreatePersonalRequestMap = {
  SECRETARIA: CreateSecretariaRequest;
  ARBITRO: CreateArbitroRequest;
  ADJUDICADOR: CreateAdjudicadorRequest;
  STAFF_INTERNO: CreateStaffInternoRequest;
};

export type PersonalDataMap = {
  SECRETARIA: SecretariaData;
  ARBITRO: ArbitroData;
  ADJUDICADOR: AdjudicadorData;
  STAFF_INTERNO: StaffInternoData;
};

export interface CreatePersonalResponse<
  T extends TipoPersonal = TipoPersonal,
> {
  success: boolean;
  message: string;

  data: {
    tipo_personal: T;
    personal: PersonalDataMap[T];
  };
}
