import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { toNodeHandler } from 'better-auth/node';
import type { Logger as PinoLogger } from 'pino';
import type { NextFunction, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { AppModule } from './app.module.js';
import { AUTH } from './modules/auth/constants.js';
import type { Auth } from './modules/auth/auth.js';
import { PINO_LOGGER } from './logging/logging.module.js';
import { PinoNestLogger } from './logging/pino-nest-logger.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // 让 Nest 内部日志统一走 pino（开发 pino-pretty / 生产启动 rolling 文件）
  const pinoLogger = app.get<PinoLogger>(PINO_LOGGER);
  app.useLogger(new PinoNestLogger(pinoLogger));

  const config = app.get(ConfigService);

  // 全局前缀 api → 控制器路由为 /api/*（设计 §9）
  app.setGlobalPrefix('api');

  // 全局校验管道：剥离白名单外字段 & 按 DTO 转换
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS（Web 前端 dev，设计 §7：15173）
  const corsOrigin = config.get<string>('PRAXIS_CORS_ORIGIN');
  app.enableCors({ origin: corsOrigin ?? true, credentials: true });

  // Better Auth —— 挂载 /api/auth/*（用 path 守卫，避免 global prefix /api 双重叠加）
  const auth = app.get<Auth>(AUTH);
  const authHandler = toNodeHandler(auth);
  app.use((req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    if (req.path.startsWith('/api/auth')) {
      return authHandler(req, res);
    }
    return next();
  });

  // Swagger / OpenAPI
  SwaggerModule.setup(
    'api-docs',
    app,
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('知行 Praxis API')
        .setDescription('积累知识系统集群的后端契约')
        .setVersion('1.0')
        .build(),
    ),
  );

  const port = config.get<number>('PRAXIS_PORT') ?? 13000;
  const host = config.get<string>('PRAXIS_NODE_ENV') === 'production' ? '0.0.0.0' : '127.0.0.1';
  await app.listen(port, host);
  pinoLogger.info(`Praxis API 已启动: http://${host}:${port}/api/health`);
}

void bootstrap();