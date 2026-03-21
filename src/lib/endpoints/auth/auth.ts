// Endpoints d'authentification
// Ces endpoints sont consommés depuis le backend Node.js
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/oauth2/signin/authorized',
    LOGOUT: '/auth/signout/oauth2/authorized',
    LOGOUT_LEGACY: '/auth/singout/oauth2/authorized',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
};
