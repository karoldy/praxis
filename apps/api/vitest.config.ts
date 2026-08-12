import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.e2e-spec.ts'],
    setupFiles: ['./test/setup.ts'],
    env: {
      DATABASE_URL: 'postgresql://localhost:5432/praxis_test',
    },
  },
});
