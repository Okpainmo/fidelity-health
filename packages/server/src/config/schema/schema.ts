import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),

  // PostgreSQL (the only database; accessed through Prisma)
  POSTGRES_USER: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_DATABASE_NAME: z.string().optional(),
  POSTGRES_DATABASE_URL: z.string().min(1, 'POSTGRES_DATABASE_URL is required'),

  // JWT
  JWT_SECRET: z.string().min(8),
  JWT_ACCESS_EXPIRATION_TIME: z.string().default('1h'),
  JWT_SESSION_EXPIRATION_TIME: z.string().default('24h'),
  JWT_ONE_TIME_PASSWORD_LIFETIME: z.string().default('5m'),

  // WebSockets
  WS_PATH: z.string().startsWith('/').default('/ws'),
  WS_HEARTBEAT_INTERVAL: z.coerce.number().default(30000),
  WS_SHUTDOWN_TIMEOUT: z.coerce.number().default(10000),

  // Missie (AI assistant): an OpenAI-compatible endpoint, e.g. Amazon Bedrock's
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  OPENAI_BASE_URL: z.string().url(),
  MISSIE_MODEL: z.string().min(1, 'MISSIE_MODEL is required'),

  // S3 file storage, mirroring the XOps Maestros setup: one bucket for images
  // (profile photos) and one for files (record attachments), each with its own
  // credentials. Both buckets must be PRIVATE - objects are only ever handed
  // out through short-lived signed URLs after an access check.
  AWS_IMAGES_ENABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  AWS_IMAGES_ACCESS_KEY: z.string().optional(),
  AWS_IMAGES_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_IMAGES_S3_BUCKET_REGION: z.string().optional(),
  AWS_IMAGES_S3_BUCKET_NAME: z.string().optional(),

  AWS_FILES_ENABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  AWS_FILES_ACCESS_KEY: z.string().optional(),
  AWS_FILES_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_FILES_S3_BUCKET_REGION: z.string().optional(),
  AWS_FILES_S3_BUCKET_NAME: z.string().optional(),

  // Service Details
  SERVICE_NAME: z.string().optional()
});

export type EnvConfig = z.infer<typeof envSchema>;
