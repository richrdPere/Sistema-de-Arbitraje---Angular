export interface Notificacion {
  id_notificacion: number;
  usuario_id: number;
  titulo: string;
  mensaje: string;
  tipo: 'designacion' | 'expediente' | 'sistema' | 'alerta';
  leido: boolean;
  createdAt: string;
  updatedAt?: string;
  // opcional: payload extra que puedas enviar (ej: designacion_id, designacion_arbitro_id...)
  payload?: any;
}
