export interface TramiteMPV {
  id: number;
  numero_expediente: string;
  tipo: string;
  estado: string;
  etapa_procesal: string;
  fecha_inicio?: string;
  solicitante: string;
  correo: string;
  condicion: string;
  accion: string;
}

export interface TramiteMPVResponse {
  total: number;
  pagina_actual: number;
  por_pagina: number;
  total_paginas: number;
  tramites: TramiteMPV[];
}
