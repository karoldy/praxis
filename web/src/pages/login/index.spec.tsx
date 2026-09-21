import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import '@/i18n';
import LoginPage from './index';
import { AuthContext, type AuthContextValue } from '@/auth/auth-context';
import { authClient } from '@/api/auth-client';

// 只在本 spec 拦截真实 better-auth 网络调用：signIn.email 用桩。
vi.mock('@/api/auth-client', () => ({
  authClient: {
    signIn: { email: vi.fn(), social: vi.fn() },
    signUp: { email: vi.fn() },
    signOut: vi.fn(),
  },
}));

const signInEmail = vi.mocked(authClient.signIn.email);

const anon: AuthContextValue = {
  user: null,
  isPending: false,
  signOut: vi.fn(),
};

function renderLogin() {
  return render(
    <AuthContext.Provider value={anon}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => signInEmail.mockReset());

  it('渲染邮箱/密码输入与提交按钮', () => {
    renderLogin();
    expect(screen.getByLabelText('邮箱')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
  });

  it('提交时调用 signIn.email（含 rememberMe）', async () => {
    signInEmail.mockResolvedValue({ data: null });
    renderLogin();

    fireEvent.change(screen.getByLabelText('邮箱'), { target: { value: 'a@b.c' } });
    fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: '登录' }));

    await waitFor(() =>
      expect(signInEmail).toHaveBeenCalledWith({
        email: 'a@b.c',
        password: 'secret123',
        rememberMe: true,
      }),
    );
  });

  it('登录失败时展示错误文案', async () => {
    // 预 reject 的 promise 需先挂一个 catch，否则被 vitest 当作未处理拒绝
    const rejected = Promise.reject(new Error('bad'));
    void rejected.catch(() => {});
    signInEmail.mockImplementationOnce(() => rejected);

    renderLogin();

    fireEvent.change(screen.getByLabelText('邮箱'), { target: { value: 'a@b.c' } });
    fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'wrong!!' } });
    fireEvent.click(screen.getByRole('button', { name: '登录' }));

    expect(await screen.findByText('邮箱或密码不正确')).toBeInTheDocument();
  });
});