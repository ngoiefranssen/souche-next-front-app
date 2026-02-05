import { z } from 'zod';

const server = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']),
    API_URL: z.string().url(),
    DATABASE_URL: z.string().url(),
    JWT_PRIVATE_KEY: z.string(),
    COOKIE_SECRET: z.string().min(32),
    TURNSTILE_SECRET_KEY: z.string(),
    RATE_LIMIT_MAX: z.coerce.number().default(100),
    PII_HASH_SALT: z.string().min(16), // au moins 16 caractères
});

const client = z.object({
    NEXT_PUBLIC_APP_NAME: z.string().min(1),
    NEXT_PUBLIC_API_URL: z.string().url(),
    // NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
});

const processEnv = {
    NODE_ENV: process.env.NODE_ENV,
    API_URL: process.env.API_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,
    COOKIE_SECRET: process.env.COOKIE_SECRET,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    // NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    PII_HASH_SALT: process.env.PII_HASH_SALT,
};

const merged = server.merge(client).parse(processEnv);

export const env = { ...merged, isDev: merged.NODE_ENV === 'development' };