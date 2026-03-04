import { z } from 'zod'

const envSchema = z.object({
  // Database (required for production, optional for development)
  DATABASE_URL: z.string().url().optional(),

  // Authentication (Clerk)
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Storage (optional)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),

  // Email (optional)
  RESEND_API_KEY: z.string().optional(),

  // Analytics (optional)
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    const formatted = parsed.error.flatten().fieldErrors
    const messages = Object.entries(formatted)
      .map(([key, errors]) => `  ${key}: ${errors?.join(', ')}`)
      .join('\n')

    console.error(`\n[GNCO] Invalid environment variables:\n${messages}\n`)

    // In production, fail fast
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing or invalid environment variables. Check server logs.')
    }

    // In development, warn but continue with defaults
    console.warn('[GNCO] Continuing with defaults in development mode.\n')
    return envSchema.parse({
      ...process.env,
      DATABASE_URL: undefined,
      CLERK_SECRET_KEY: undefined,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: undefined,
    })
  }

  return parsed.data
}

export const env = validateEnv()
