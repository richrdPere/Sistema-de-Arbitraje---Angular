// *********************************************************
// FILTROS
// *********************************************************

export interface PreviewNumeroTramiteFilters {
  /** Si se omite, el backend utiliza CA-FIRMA-LEGAL. */
  codigo?: string;
}

// *********************************************************
// DATA
// *********************************************************

export interface PreviewNumeroTramiteData {
  numero: string;

  /** El preview no reserva el correlativo. */
  reservado: false;
}

// *********************************************************
// RESPONSE
// *********************************************************

export interface PreviewNumeroTramiteResponse {
  success: boolean;
  message: string;
  data: PreviewNumeroTramiteData;
}
