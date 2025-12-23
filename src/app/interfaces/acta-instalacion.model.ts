// models/acta-instalacion.model.ts
export interface Expediente {
  id: number;
  numero_expediente: string;
  titulo: string;
  estado: string;
  arbitro_id?: number;
  secretaria_id?: number;
  created_at: Date;
}

export interface ActaInstalacion {
  id?: number;
  expediente_id: number;
  arbitro_id: number;
  secretaria_id: number;
  fecha_convocatoria: Date;
  hora_convocatoria: string;
  fecha_instalacion?: Date;
  competencia?: string;
  normas_procesales?: string[];
  cronograma_inicial?: {
    fecha_presentacion_demanda: Date;
    fecha_contestacion: Date;
    fecha_audiencia_preliminar: Date;
    fecha_laudo: Date;
    plazos_especiales?: string[];
  };
  observaciones?: string;
  estado: 'convocada' | 'en_proceso' | 'instalada' | 'cancelada';
  created_at?: Date;
  updated_at?: Date;
}

export interface Notificacion {
  id?: number;
  usuario_id: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: boolean;
  created_at?: Date;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'secretaria' | 'arbitro' | 'admin' | 'parte';
}
