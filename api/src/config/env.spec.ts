import { validateEnv } from './env';

describe('validateEnv', () => {
  it('accepts a complete development config', () => {
    expect(
      validateEnv({
        PRAXIS_NODE_ENV: 'development',
        PRAXIS_PORT: '13000',
        PRAXIS_DATABASE_URL:
          'postgres://postgres:postgres@127.0.0.1:15432/praxis',
      }),
    ).toEqual({
      PRAXIS_NODE_ENV: 'development',
      PRAXIS_PORT: 13000,
      PRAXIS_DATABASE_URL:
        'postgres://postgres:postgres@127.0.0.1:15432/praxis',
    });
  });

  it('rejects a missing database url', () => {
    expect(() => validateEnv({})).toThrow('PRAXIS_DATABASE_URL is required');
  });
});
