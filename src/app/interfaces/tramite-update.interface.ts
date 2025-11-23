export interface UpdateTramitePayload {
  id_expediente?: number;
  estado: string;
  usuario_responsable?: string;
  razon?: string | null;
  correo_solicitante?: string;  // <-- AGREGADO
  nombre_solicitante?: string;

  // <---- NUEVO PARA WEBHOOKS
  correo_asociado?: {
    remitente: string;
    asunto: string;
    mensaje: string;
    fecha: string;
    adjuntos?: string[]; // URLs/paths
  };
}
