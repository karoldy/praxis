import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './auth-context';

/**
 * 受保护路由：会话加载中显示占位；未登录重定向到 /login（携带来源路径供回跳）。
 * 包在需登录的布局/路由外层。
 */
export function ProtectedRoute() {
  const { user, isPending } = useAuth();
  const location = useLocation();

  if (isPending) {
    // 会话仍在校验，避免首屏误判跳登录
    return <div className="grid h-dvh place-items-center text-muted-foreground">…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}