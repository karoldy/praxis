import { describe, it, expect, vi } from 'vitest';
import { AuthGuard, type RequestUser } from './auth.guard.js';
import type { Auth } from './auth.js';

function makeGuard(sessionResult: { session: unknown; user: RequestUser } | null) {
  const auth = {
    api: { getSession: vi.fn().mockResolvedValue(sessionResult) },
  } as unknown as Auth;
  const guard = new AuthGuard(auth);
  return { guard, auth };
}

function makeContext(headers: Record<string, string> = {}) {
  const req: Record<string, unknown> = { headers };
  const ctx = {
    switchToHttp: () => ({ getRequest: () => req }),
  } as Parameters<AuthGuard['canActivate']>[0];
  return { req, ctx };
}

describe('AuthGuard', () => {
  it('有会话时放行并注入 req.user', async () => {
    const user: RequestUser = { id: 'u1', name: 'Turbo', email: 'a@b.c', emailVerified: true };
    const { guard } = makeGuard({ session: { id: 's1' }, user });
    const { req, ctx } = makeContext({ cookie: 'session=abc' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(req.user).toEqual(user);
  });

  it('无会话时抛出 401', async () => {
    const { guard } = makeGuard(null);
    const { ctx } = makeContext();
    await expect(guard.canActivate(ctx)).rejects.toThrow(/未登录|会话/);
  });
});