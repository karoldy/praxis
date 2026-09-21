import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import '@/i18n';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthContext, type AuthContextValue } from './auth-context';

const base: AuthContextValue = {
  user: null,
  isPending: false,
  signOut: vi.fn(),
};

const user = {
  id: 'u1',
  name: '测试用户',
  email: 'a@b.c',
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// 关键：/login 与受保护路由平级（镜像生产 router.tsx），避免"未登录又 Navigate 到
// /login"在受保护布局内无限重定向。
function renderProtected(value: AuthContextValue) {
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={['/notes']}>
        <Routes>
          <Route path="/login" element={<div>login-page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="notes" element={<div>notes-content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('未登录时重定向到 /login', () => {
    renderProtected({ ...base, user: null });
    expect(screen.getByText('login-page')).toBeInTheDocument();
    expect(screen.queryByText('notes-content')).not.toBeInTheDocument();
  });

  it('已登录时放行子路由', () => {
    renderProtected({ ...base, user: { ...user } });
    expect(screen.getByText('notes-content')).toBeInTheDocument();
    expect(screen.queryByText('login-page')).not.toBeInTheDocument();
  });

  it('会话校验中显示占位（不误跳）', () => {
    renderProtected({ ...base, isPending: true });
    expect(screen.queryByText('notes-content')).not.toBeInTheDocument();
    expect(screen.queryByText('login-page')).not.toBeInTheDocument();
  });
});