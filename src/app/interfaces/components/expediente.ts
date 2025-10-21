export interface Expediente {
  id_expediente?: number;
  numero_expediente: string;
  codigo: string;
  titulo: string;
  descripcion?: string;
  tipo: string;
  estado: string;
  estado_procesal: string;
  fecha_inicio?: Date;
  fecha_laudo?: Date | null;
  fecha_resolucion?: Date | null;
  fecha_cierre?: Date | null;
  cliente_id?: number;
  arbitro_id?: number;
  secretaria_id?: number;
  caso_id?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
