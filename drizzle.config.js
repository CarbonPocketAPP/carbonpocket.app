import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config({ path: '.env.local' });
dotenv.config();

export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/schema.js',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED,
  },
});
