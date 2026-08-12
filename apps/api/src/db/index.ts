import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export const DRIZZLE = Symbol('DRIZZLE');

export const databaseProvider = {
  provide: DRIZZLE,
  useValue: db,
};
