import {
  PersonaCamposOpcionales,
  PersonaData,
  PersonaTipo,
} from './create-persona.interface';

// *********************************************************
// REQUEST
// *********************************************************

export interface UpdatePersonaRequest
  extends PersonaCamposOpcionales {
  tipo?: PersonaTipo;
}

// *********************************************************
// DATA
// *********************************************************

export interface UpdatePersonaData {
  persona: PersonaData;
}

// *********************************************************
// RESPONSE
// *********************************************************

export interface UpdatePersonaResponse {
  success: boolean;
  message: string;
  data: UpdatePersonaData;
}
