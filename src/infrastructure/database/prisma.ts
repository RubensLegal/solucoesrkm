/**
 * @file prisma.ts
 * @description Cliente Prisma com adaptador LibSQL para Turso.
 *
 * Prisma 7 com driverAdapters: sempre usa LibSQL adapter.
 * Em produção: DATABASE_URL = libsql://... + TURSO_AUTH_TOKEN
 * Em dev: DATABASE_URL = file:./prisma/dev.db (SQLite local via LibSQL)
 *
 * Singleton pattern evita múltiplas instâncias em hot-reload.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const prismaClientSingleton = () => {
    const url = process.env.DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
        throw new Error(
            '[Prisma] DATABASE_URL is required. ' +
            'Set it in your .env file or environment variables.'
        );
    }

    // Sempre usa LibSQL adapter (Prisma 7 com driverAdapters)
    try {
        const adapter = new PrismaLibSql({
            url,
            authToken: authToken
        });

        return new PrismaClient({ adapter });
    } catch (error) {
        console.error('[Prisma] Failed to initialize LibSQL adapter.', error);
        return new PrismaClient();
    }
};

// ─── Singleton ────────────────────────────────────────────────────
declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaGlobal = prisma;
}

export default prisma;
