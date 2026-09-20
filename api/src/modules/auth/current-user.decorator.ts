import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestUser } from './auth.guard.js';

/**
 * 注入当前登录用户。在 AuthGuard 保护的路由处理器参数中使用：
 *   @CurrentUser() user: RequestUser
 *   @CurrentUser('id') userId: string
 */
export const CurrentUser = createParamDecorator(
  (
    data: keyof RequestUser | undefined,
    ctx: ExecutionContext,
  ): RequestUser | RequestUser[keyof RequestUser] | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;
    return data ? (user?.[data] as RequestUser[keyof RequestUser]) : user;
  },
);