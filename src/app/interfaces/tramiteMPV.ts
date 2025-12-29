export interface TramiteMPV {
  id: number;
  numero_expediente: string;
  tipo: string;
  estado: string;
  etapa_procesal: string;
  fecha_inicio: string;
  solicitante: string;
  correo: string;
  condicion: string;
  id_expediente: number;
  accion: string;
  documento: string;
}

export interface TramiteMPVResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: TramiteMPV[];
}
