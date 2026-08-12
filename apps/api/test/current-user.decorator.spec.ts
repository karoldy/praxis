import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import type { ExecutionContext } from '@nestjs/common';
import { CurrentUser } from '../src/auth/current-user.decorator.js';

/**
 * createParamDecorator does not expose its factory directly; extract it from
 * the route-args metadata a real controller method produces.
 */
function getCurrentUserFactory(): (
  data: unknown,
  ctx: ExecutionContext,
) => unknown {
  class DummyController {
    handler(@CurrentUser() user: unknown) {
      return user;
    }
  }
  const metadata = (Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    DummyController,
    'handler',
  ) ??
    Reflect.getMetadata(ROUTE_ARGS_METADATA, DummyController.prototype, 'handler')) as
    | Record<string, { factory: Function }>
    | undefined;
  if (!metadata) throw new Error('CurrentUser factory not found in metadata');
  const entry = Object.values(metadata).find((p) => p.factory);
  if (!entry) throw new Error('CurrentUser factory not found in metadata');
  return entry.factory as (
    data: unknown,
    ctx: ExecutionContext,
  ) => unknown;
}

function mockExecutionContext(request: Record<string, unknown>) {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('CurrentUser decorator', () => {
  it('extracts the user attached to the request', () => {
    const factory = getCurrentUserFactory();
    const user = {
      id: 'user_1',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = factory(undefined, mockExecutionContext({ user }));
    expect(result).toEqual(user);
  });

  it('returns undefined when no user is attached to the request', () => {
    const factory = getCurrentUserFactory();

    const result = factory(undefined, mockExecutionContext({}));
    expect(result).toBeUndefined();
  });
});
