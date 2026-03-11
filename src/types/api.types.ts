/**
 * @file api.types.ts
 * @description Tipos compartilhados para respostas de API.
 */

/** Resposta padrão de sucesso. */
export interface ApiSuccessResponse<T = unknown> {
    success: true;
    data: T;
    message?: string;
}

/** Resposta padrão de erro. */
export interface ApiErrorResponse {
    success: false;
    error: string;
    code?: string;
}

/** Union type para respostas de API. */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
