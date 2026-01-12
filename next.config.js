/* eslint-disable @typescript-eslint/no-require-imports */

const createNextIntlPlugin = require('next-intl/plugin');

// 1. Indique à next-intl quel fichier contient getRequestConfig
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 2. Déplacement de l’option turbo (plus propre et sans warning)
  turbopack: {
    // (optionnel) forcer un root explicite :
    // root: __dirname,
  },

  // 3. Variables d’environnement
  env: {
    API_URL: process.env.API_URL,
    JWT_SECRET: process.env.JWT_SECRET,
  },

  // 4. Configuration images
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = withNextIntl(nextConfig);
