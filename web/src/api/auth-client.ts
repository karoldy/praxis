import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth 前端客户端。baseURL 与后端一致（VITE_API_BASE_URL，默认 127.0.0.1:13000），
 * 会话走 cookie（CORS credentials 已由后端开启）。
 * 提供 signIn.email / signUp.email / signOut / getSession / useSession 等方法与 hook。
 */
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:13000',
});

export type AuthClient = typeof authClient;

/** 当前登录用户（匹配 Better Auth 默认 user 字段；createdAt/updatedAt 为 Date）。 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}