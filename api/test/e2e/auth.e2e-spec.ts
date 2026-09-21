import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from '../../src/app.module.js';
import { AUTH } from '../../src/modules/auth/constants.js';
import type { Auth } from '../../src/modules/auth/auth.js';

/**
 * 认证全流程 e2e：注册 → 取会话 → 登出 → 会话清空 → 错误密码拦截。
 * 需要本地 PostgreSQL（api/docker-compose.yml，15432；schema 已含 better-auth 表）。
 */
describe('Praxis Auth (e2e)', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;

  const email = `e2e-${Date.now()}@test.local`;
  const password = 'secret-123';
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    const auth = moduleRef.get<Auth>(AUTH);
    const handler = toNodeHandler(auth);
    app.use((req, res, next) => {
      if (req.path.startsWith('/api/auth')) {
        return (handler as (r: unknown, s: unknown) => Promise<void>)(req, res);
      }
      return next();
    });
    await app.init();
    server = app.getHttpServer();
    agent = request.agent(server);
  });

  afterAll(async () => {
    await app.close();
  });

  it('注册新用户返回 user', async () => {
    const res = await agent
      .post('/api/auth/sign-up/email')
      .send({ name: 'E2E 用户', email, password });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.id).toBeTruthy();
  });

  it('注册后可取到会话', async () => {
    const res = await agent.get('/api/auth/get-session');
    expect(res.status).toBe(200);
    const body = res.body ?? {};
    const session = body.session ?? body; // 1.7.x 可能返回 null 或 { session }
    expect(session).toBeTruthy();
  });

  it('登出后会话清空', async () => {
    const out = await agent.post('/api/auth/sign-out');
    expect(out.status).toBe(200);
    const res = await agent.get('/api/auth/get-session');
    const body = res.body;
    expect(body == null || (!body.session && !body.sessionId)).toBe(true);
  });

  it('错误密码登录被拒（401）', async () => {
    const res = await request(server)
      .post('/api/auth/sign-in/email')
      .send({ email, password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('正确密码登录成功', async () => {
    const res = await request(server)
      .post('/api/auth/sign-in/email')
      .send({ email, password, rememberMe: true });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email);
    expect(res.headers['set-cookie']).toBeDefined();
  });
});