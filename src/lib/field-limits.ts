/**
 * Limites de caracteres para campos de nome no sistema.
 * Usados tanto na validação backend (Zod) quanto no frontend (maxLength input).
 */

export const FIELD_LIMITS = {
    /** Nome de Casa / Local */
    houseName: 50,
    /** Nome de Cômodo */
    roomName: 50,
    /** Nome de Móvel */
    furnitureName: 50,
    /** Nome de Item */
    itemName: 80,
    /** Descrição de Item */
    itemDescription: 500,
    /** Compartimento */
    compartment: 50,
    /** Tags */
    tags: 200,
} as const;
