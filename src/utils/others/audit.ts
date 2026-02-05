import crypto from 'crypto';
import { env } from '@/../env.mjs';

const SALT = env.PII_HASH_SALT; // 16 bytes hex

export function hashIp(ip?: string): string {
  const src = ip ?? getClientIp(); // extraire de x-forwarded-for ou socket
  return crypto
    .createHash('sha256')
    .update(src + SALT)
    .digest('hex');
}

function getClientIp(): string {
  // Adapter l'infra (Next.js, Nginx, Vercel, etc.)
  return '0.0.0.0'; // placeholder
}
