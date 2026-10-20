import {
  PersonaPaginatedItem,
} from './get-personas-paginado.interface';

// *********************************************************
// DATA
// *********************************************************

export interface GetPersonaByIdData {
  persona: PersonaPaginatedItem;
}

// *********************************************************
// RESPONSE
// *********************************************************

export interface GetPersonaByIdResponse {
  success: boolean;
  message: string;
  data: GetPersonaByIdData;
}
