import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import { AUTH } from './constants.js';
import type { Auth } from './auth.js';

export interface RequestUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
}

export interface RequestSession {
  session: unknown;
  user: RequestUser | null;
}

/**
 * 校验请求会话：存在则放行并注入 req.user / req.session；否则 401。
 * 配合 @CurrentUser() 装饰器读取当前用户。
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(AUTH) private readonly auth: Auth) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Record<string, unknown>>();

    const session = await this.auth.api.getSession({
      headers: fromNodeHeaders(req.headers as Record<string, string | string[] | undefined>),
    });

    if (!session) {
      throw new UnauthorizedException('未登录或会话已过期');
    }

    req.user = session.user;
    req.session = session;
    return true;
  }
}