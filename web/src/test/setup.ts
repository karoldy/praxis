import '@testing-library/jest-dom/vitest';
import { beforeEach } from 'vitest';
// 需要拦截真实 better-auth 网络调用的测试，在各自 spec 里用 vi.mock('@/api/auth-client')。

// 保证每个测试开始时 i18n 已就绪（翻译文案可用），无论执行顺序如何。
beforeEach(async () => {
  const { i18nReady } = await import('@/i18n');
  await i18nReady;
});