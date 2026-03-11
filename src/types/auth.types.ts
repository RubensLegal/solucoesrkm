/**
 * @file auth.types.ts
 * @description Tipos compartilhados de autenticação e autorização.
 */

/** Payload armazenado no JWT de sessão. */
export interface SessionPayload {
    userId: string;
    email: string;
    name: string | null;
    role?: string;
    [key: string]: unknown;
}

/** Roles do sistema para controle de acesso no admin. */
export type SystemRole = 'SUPERADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER';

/** Roles do User model (diferente de SystemRole/Employee). */
export type UserRole = 'SUPERADMIN' | 'EMPLOYEE' | 'VIEWER';
