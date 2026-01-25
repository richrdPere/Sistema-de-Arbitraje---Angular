export interface CalendarioActividad {
  id?: number;
  titulo: string;
  descripcion: string;
  fecha_actividad: Date | string;
  tipo_actividad: TipoActividad;
  estado?: EstadoActividad;

  user_ins?: string;
  user_mod?: string;
  fecha_ins?: Date;
  fecha_mod?: Date;
}

export type TipoActividad =
  | 'AUDIENCIA'
  | 'PLAZO'
  | 'NOTIFICACION'
  | 'REUNION'
  | 'OTRO';

export type EstadoActividad =
  | 'PROGRAMADO'
  | 'REALIZADO'
  | 'CANCELADO';
