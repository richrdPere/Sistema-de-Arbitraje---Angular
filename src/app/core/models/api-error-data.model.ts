export interface ApiErrorData {
  message: string;
  error?: string | null;
  statusCode: number;
  code?: string | null;
  details?: unknown;
}
