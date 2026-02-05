/* eslint-disable @typescript-eslint/no-require-imports */
const createNextIntlPlugin = require('next-intl/plugin');
const { z } = require('zod');

// Validation stricte des variables d’environnement
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  API_URL: z
    .string()
    .url()
    .refine(
      u => process.env.NODE_ENV !== 'production' || u.startsWith('https'),
      {
        message: 'API_URL must use HTTPS in production',
      }
    ),
  JWT_PRIVATE_KEY: z.string().min(1),
  COOKIE_SECRET: z.string().min(32),
  NEXT_PUBLIC_API_URL: z.string().url(),
});

// Lance une erreur au build si invalide
envSchema.parse(process.env);

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pas de variable secrète dans `env:{}` → serveur only
  env: {}, // on utilise process.env directement côté API

  // Sécurité : headers HTTP obligatoires
  async headers() {
    const connectSrc =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:7700'
        : 'https://api.dev.myapp.com';
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      `connect-src 'self' ${connectSrc}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '0' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: csp },
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
      },
    ];
  },

  // Rewrites : on force HTTPS via l’URL d’env
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.API_URL}/:path*`,
      },
    ];
  },

  // 4. Images : on supprime localhost en prod
  images: {
    remotePatterns: [
      ...(process.env.NODE_ENV === 'development'
        ? [{ protocol: 'https', hostname: 'localhost' }] // mkcert
        : []),
      { protocol: 'https', hostname: '**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // 5. Fuite d’info
  poweredByHeader: false,

  // 6. Turbo (optionnel)
  experimental: {
    turbo: {},
  },
};

module.exports = withNextIntl(nextConfig);
