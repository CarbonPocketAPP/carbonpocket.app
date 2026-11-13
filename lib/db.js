import { attachDatabasePool } from '@vercel/functions';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

const g = globalThis;
const pool = g.__cpPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 3000,
});

attachDatabasePool(pool);
if (process.env.NODE_ENV !== 'production') g.__cpPool = pool;

export const db = drizzle(pool, { schema });
