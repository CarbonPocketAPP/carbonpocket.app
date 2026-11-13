import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../lib/schema.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

export function createUnpooledDatabase() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED;
  if (!connectionString) {
    throw new Error('DATABASE_URL_UNPOOLED é obrigatória para scripts manuais.');
  }

  const { hostname } = new URL(connectionString);
  if (hostname.toLowerCase().includes('pooler')) {
    throw new Error('O script exige uma conexão PostgreSQL direta, sem pooler.');
  }

  const pool = new Pool({
    connectionString,
    max: 1,
    connectionTimeoutMillis: 5000,
  });
  return { db: drizzle(pool, { schema }), pool };
}
