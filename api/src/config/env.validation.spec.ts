import { describe, it, expect } from 'vitest';
import { validateEnv } from './env.validation.js';

describe('validateEnv', () => {
  it('无 PRAXIS_ 变量时返回默认配置', () => {
    const config = validateEnv({});
    expect(config.PRAXIS_PORT).toBe(13000);
    expect(config.PRAXIS_NODE_ENV).toBe('development');
    expect(config.PRAXIS_LOG_FILE).toBe(false);
  });

  it('读取 PRAXIS_ 键并做类型转换', () => {
    const config = validateEnv({
      PRAXIS_PORT: '14000',
      PRAXIS_LOG_FILE: 'true',
      PRAXIS_NODE_ENV: 'production',
    });
    expect(config.PRAXIS_PORT).toBe(14000);
    expect(config.PRAXIS_LOG_FILE).toBe(true);
    expect(config.PRAXIS_NODE_ENV).toBe('production');
  });

  it('忽略非 PRAXIS_ 前缀的环境变量', () => {
    const config = validateEnv({ PATH: '/usr/bin', NODE_ENV: 'whatever', PRAXIS_PORT: '13001' });
    expect(config.PRAXIS_PORT).toBe(13001);
  });

  it('非法端口抛错', () => {
    expect(() => validateEnv({ PRAXIS_PORT: '999999' })).toThrow();
  });
});