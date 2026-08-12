import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './index.js';

const handler = toNodeHandler(auth);

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, _next: NextFunction) {
    return handler(req, res);
  }
}
