import { createContext, useContext, type ReactNode } from 'react';
import { authClient, type AuthUser } from '@/api/auth-client';

interface AuthContextValue {
  /** 当前登录用户；未登录为 null。 */
  user: AuthUser | null;
  /** 会话仍在加载中（首次 get-session 未返回）。 */
  isPending: boolean;
  /** 登出。 */
  signOut: () => Promise<void>;
}

export type { AuthContextValue };

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// 导出供测试注入受控会话值；生产代码请用 useAuth()。
export { AuthContext };

/**
 * 提供全局登录态。内部用 better-auth/react 的 useSession hook（含 store 反应式更新）。
 * 在 get-session 返回前 isPending=true，避免整页闪现「未登录」。
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isPending } = authClient.useSession();

  const value: AuthContextValue = {
    user: (data?.user as AuthUser | null) ?? null,
    isPending,
    signOut: async () => {
      await authClient.signOut();
      // better-auth 的 store 会随 signOut 自动刷新，useSession 随之更新。
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth 必须在 <AuthProvider> 内使用');
  }
  return ctx;
}