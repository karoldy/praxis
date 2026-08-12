import { beforeAll, afterAll } from 'vitest';

// Set env before any imports read from process.env
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://localhost:5432/praxis_test';

beforeAll(() => {
  console.log('Test database:', process.env.DATABASE_URL);
});

afterAll(() => {
  // cleanup if needed
});
