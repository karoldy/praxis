import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { Pool } from 'pg';
import { db } from '../src/db/index.js';
import { AppModule } from '../src/app.module.js';
import { AuthMiddleware } from '../src/auth/auth.middleware.js';
import { AuthGuard } from '../src/auth/auth.guard.js';

vi.hoisted(() => {
  process.env.DATABASE_URL ??= 'postgresql://postgres:postgres@localhost:5433/praxis_test';
});

async function checkDb(): Promise<boolean> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  } finally {
    await pool.end();
  }
}

const dbAvailable = await checkDb();
const describeIfDb = dbAvailable ? describe : describe.skip;

describeIfDb('Better Auth E2E', () => {
  let app: INestApplication;
  let emailCounter = 0;

  const uniqueEmail = () => `task4-${Date.now()}-${emailCounter++}@example.com`;
  const password = 'password123';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    const authMiddleware = app.get(AuthMiddleware);
    app.use(
      '/api/auth',
      (req: Request, res: Response, next: NextFunction) => authMiddleware.use(req, res, next),
    );
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await (db as unknown as { $client?: { end(): Promise<void> } }).$client?.end();
  });

  it('GET /api/auth/ok returns ok', async () => {
    const res = await request(app.getHttpServer()).get('/api/auth/ok');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('signs up a new user and returns session cookies', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .send({ name: 'Task 4 User', email: uniqueEmail(), password });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toContain('task4-');
    expect(res.body.token).toBeTruthy();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('gets the session from cookies', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent
      .post('/api/auth/sign-up/email')
      .send({ name: 'Task 4 User', email: uniqueEmail(), password });

    const res = await agent.get('/api/auth/get-session');
    expect(res.status).toBe(200);
    expect(res.body.user.email).toContain('task4-');
    expect(res.body.session).toBeTruthy();
  });

  it('AuthGuard rejects requests without a session', async () => {
    const guard = new AuthGuard();
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ headers: { host: 'localhost' } }) }),
    } as never;

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      name: 'UnauthorizedException',
    });
  });

  it('AuthGuard accepts an authenticated request and populates user', async () => {
    const agent = request.agent(app.getHttpServer());
    const email = uniqueEmail();
    const signUp = await agent
      .post('/api/auth/sign-up/email')
      .send({ name: 'Task 4 User', email, password });
    expect(signUp.status).toBe(200);

    const cookie = signUp.headers['set-cookie'][0].split(';')[0];
    const requestLike: Record<string, unknown> = {
      headers: { host: 'localhost', cookie },
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => requestLike }),
    } as never;

    const guard = new AuthGuard();
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(requestLike.user).toMatchObject({ email });
    expect(requestLike.session).toHaveProperty('token');
  });
});
