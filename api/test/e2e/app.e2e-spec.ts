import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from '../../src/app.module.js';
import { AUTH } from '../../src/modules/auth/constants.js';
import type { Auth } from '../../src/modules/auth/auth.js';

/**
 * e2e 冒烟测试。需要本地 PostgreSQL 可达（api/docker-compose.yml 的 postgres:16，
 * 映射 15432）。DB 未启动时 /api/auth/session 用例会失败。
 */
describe('Praxis API (e2e)', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();

    // 复刻 main.ts 的装配（global prefix + 校验管道 + Better Auth 中间件）
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health → 200 且包含 db 状态', async () => {
    const res = await request(server).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('details.db');
  });

  it('GET /api/notes → 200 骨架', async () => {
    const res = await request(server).get('/api/notes');
    expect(res.status).toBe(200);
    expect(typeof res.body.message).toBe('string');
  });

  it('GET /api/auth/get-session → 未登录时无会话', async () => {
    const res = await request(server).get('/api/auth/get-session');
    expect(res.status).toBe(200);
    // better-auth 1.7.x：未登录时返回字面 null，或 { session: null, user: null }
    expect(res.body == null || (res.body.session == null && res.body.user == null)).toBe(true);
  });
});