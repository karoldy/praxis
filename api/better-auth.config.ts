// 由 @better-auth/cli 读取的配置（run: pnpm better-auth migrate）.
// 仅用于在 DB 中创建/升级 Better Auth 依赖的表（user/session/account/verification），
// 与 NestJS 运行时无关。连接串读 PRAXIS_DATABASE_URL。
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const databaseUrl =
  process.env.PRAXIS_DATABASE_URL ?? 'postgres://postgres:postgres@127.0.0.1:15432/praxis';

const client = postgres(databaseUrl, { max: 1 });
const db = drizzle(client);

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  basePath: '/api/auth',
  secret: process.env.PRAXIS_AUTH_SECRET || undefined,
  emailAndPassword: { enabled: true },
});

void client;