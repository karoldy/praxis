// Temporary placeholder for Task 2 — replaced by the real Drizzle client
// (drizzle-orm/node-postgres + schema) in Task 3. Reads DATABASE_URL at
// module load time, so `import 'dotenv/config'` in main.ts must run first.
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const DRIZZLE = Symbol('DRIZZLE');

export const databaseProvider = {
  provide: DRIZZLE,
  useValue: pool,
};
