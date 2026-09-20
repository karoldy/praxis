import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

/**
 * 基于 postgres-js 驱动的 Drizzle 客户端。
 * 连接串来自 ConfigService（PRAXIS_DATABASE_URL），在 DrizzleModule 中以工厂方式创建，
 * 避免在 import 时机读环境变量造成的启动顺序问题。
 */
export function createDb(databaseUrl: string) {
  const client = postgres(databaseUrl, { max: 10 });
  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof createDb>;