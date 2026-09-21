import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import '@/i18n';
import AppLayout from './AppLayout';
import { AuthContext, type AuthContextValue } from '@/auth/auth-context';

const loggedIn: AuthContextValue = {
  user: { id: 'u1', name: '测试用户', email: 'a@b.c', emailVerified: true, createdAt: new Date(), updatedAt: new Date() },
  isPending: false,
  signOut: vi.fn(),
};

function renderLayout(value: AuthContextValue) {
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<div>outlet-content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('AppLayout', () => {
  it('渲染品牌、三大中心导航与当前用户', () => {
    renderLayout(loggedIn);

    expect(screen.getByText('知行')).toBeInTheDocument();
    expect(screen.getByText('测试用户')).toBeInTheDocument();
    expect(screen.getByText('登出')).toBeInTheDocument();

    // jsdom 不应用 Tailwind 断点类：桌面侧边栏 + 手机底栏都会渲染，故用 getAllByText
    for (const label of ['学习中心', '考试中心', '文档中心']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });
});