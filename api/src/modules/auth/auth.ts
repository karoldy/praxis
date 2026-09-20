import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { Db } from '../../db/db.js';

export interface AuthConfig {
  /** 对外基础 URL，Better Auth 生成回调 / 链接用。 */
  baseUrl: string;
  /** 会话签名密钥（生产必须强随机）。dev 空值下 Better Auth 自己管理密钥。 */
  secret: string;
  /** 允许的来源（跨域）。 */
  trustedOrigins: string[];
}

/**
 * 创建 Better Auth 实例，Drizzle + postgres-js 适配器。
 * Better Auth 依赖的 user / session / account / verification 表由其自身
 * 按需创建并升级，不进入我们手写的 schema。
 */
export function createAuth(db: Db, config: AuthConfig) {
  return betterAuth({
    database: drizzleAdapter(db, { provider: 'pg' }),
    basePath: '/api/auth',
    baseURL: config.baseUrl,
    secret: config.secret || undefined,
    trustedOrigins: config.trustedOrigins,
    socialProviders: {},
    emailAndPassword: { enabled: true },
    advanced: {
      // 本地 / 自建网（HTTP，非公网）：
      defaultCookieAttributes: { secure: false, sameSite: 'lax' },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;