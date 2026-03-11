/**
 * @file roles.ts
 * @description Constantes de roles do sistema.
 *
 * Substitui magic strings como 'SUPERADMIN', 'ADMIN', etc.
 * Usar estas constantes garante type-safety e auto-complete.
 */

/** Roles para o model User. */
export const USER_ROLES = {
    SUPERADMIN: 'SUPERADMIN',
    EMPLOYEE: 'EMPLOYEE',
    VIEWER: 'VIEWER',
} as const;

/** Roles para o model Employee (acesso ao admin). */
export const EMPLOYEE_ROLES = {
    ADMIN: 'ADMIN',
    EDITOR: 'EDITOR',
    VIEWER: 'VIEWER',
} as const;

/** Roles que têm permissão de edição no admin. */
export const EDITABLE_ROLES: ReadonlySet<string> = new Set([
    USER_ROLES.SUPERADMIN,
    EMPLOYEE_ROLES.ADMIN,
    EMPLOYEE_ROLES.EDITOR,
]);
