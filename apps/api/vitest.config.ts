import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.{e2e-spec,e2e,spec,test}.{ts,mts}'],
    setupFiles: ['./test/setup.ts'],
    env: {
      DATABASE_URL: 'postgresql://localhost:5432/praxis_test',
    },
  },
});
