import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Define the environment schema validation using Zod
const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection URL'),
  // Optional: when set, POST ingestion requires a matching `x-api-key` header.
  INGEST_API_KEY: z.string().min(1).optional(),
  // Optional: restrict CORS to these origins (comma-separated). Defaults to any.
  CORS_ORIGIN: z.string().min(1).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Environment validation failed:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
export type EnvConfig = z.infer<typeof envSchema>;
