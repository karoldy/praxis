import { defineConfig } from 'drizzle-kit';

const databaseUrl =
  process.env.PRAXIS_DATABASE_URL ?? 'postgres://postgres:postgres@127.0.0.1:15432/praxis';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: databaseUrl },
});