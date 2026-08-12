import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module.js';
import { AuthMiddleware } from './auth/auth.middleware.js';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new GlobalExceptionFilter());

  // Mount Better Auth under /api/auth (native Express middleware)
  const authMiddleware = app.get(AuthMiddleware);
  app.use(
    '/api/auth',
    (req: Request, res: Response, next: NextFunction) => authMiddleware.use(req, res, next),
  );

  await app.listen(3000);
  console.log('Praxis API running on http://localhost:3000');
}

bootstrap();
