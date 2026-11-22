// Reads settings from environment variables (the .env file at the repo root)
// and checks them with zod. If something is wrong, the server refuses to start
// with a clear message instead of crashing later in a confusing way.
import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

// Load ../../../.env (repo root) relative to THIS file, so it works no matter
// which folder you start the server from. Missing .env is fine (defaults apply).
dotenv.config({ path: path.resolve(import.meta.dirname, '../../../.env'), quiet: true });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  // Optional for now; becomes required in Milestone 3 when we add the database.
  DATABASE_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', z.prettifyError(parsed.error));
  process.exit(1);
}

/** Validated, typed settings. Import this instead of using process.env directly. */
export const env = parsed.data;
