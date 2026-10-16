// *********************************************************
// FILTROS
// *********************************************************
export interface ExisteCorreoFilters {
  correo: string;

  /** Excluir al usuario actual durante la edición. */
  excluir_usuario_id?: number;
}

// *********************************************************
// DATA
// *********************************************************
export interface ExisteCorreoData {
  existe: boolean;
}

// *********************************************************
// RESPONSE
// *********************************************************
export interface ExisteCorreoResponse {
  success: boolean;
  message: string;
  data: ExisteCorreoData;
}
