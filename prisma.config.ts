/**
 * @file prisma.config.ts
 * @description Configuração Prisma 7 — URL do banco definida aqui (não mais no schema).
 *
 * Em produção: DATABASE_URL aponta para Turso.
 * Em dev: DATABASE_URL = "file:./prisma/dev.db" para SQLite local.
 */
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
