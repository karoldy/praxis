import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { auth } from '../src/auth/index.js';
import { AuthGuard } from '../src/auth/auth.guard.js';

vi.mock('../src/auth/index.js', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

const getSessionMock = vi.mocked(auth.api.getSession);

function mockExecutionContext(request: Record<string, unknown>) {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as never;
}

describe('AuthGuard', () => {
  beforeEach(() => {
    getSessionMock.mockReset();
  });

  it('throws UnauthorizedException when no session exists', async () => {
    getSessionMock.mockResolvedValue(null);

    const guard = new AuthGuard();
    const request: Record<string, unknown> = { headers: { host: 'localhost:3000' } };

    await expect(guard.canActivate(mockExecutionContext(request))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('sets request.user and request.session and returns true when session exists', async () => {
    const user = {
      id: 'user_1',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const session = {
      id: 'session_1',
      userId: 'user_1',
      token: 'token-1',
      expiresAt: new Date(),
    };
    getSessionMock.mockResolvedValue({ user, session } as never);

    const guard = new AuthGuard();
    const request: Record<string, unknown> = { headers: { host: 'localhost:3000' } };

    await expect(guard.canActivate(mockExecutionContext(request))).resolves.toBe(true);
    expect(request.user).toEqual(user);
    expect(request.session).toEqual(session);
    expect(getSessionMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
    });
  });
});
