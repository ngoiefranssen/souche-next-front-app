export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7700/api/v1',
  TIMEOUT: 30000,
  RETRIES: 3,
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};
