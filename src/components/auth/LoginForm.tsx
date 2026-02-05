'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

import { LoginCredentials, authAPI } from '@/lib/api/auth/auth';
import { LanguageSelector } from '@/components/LanguageSelector';
import { setAuthToken } from '@/utils/auth/tokenManager';

export default function LoginForm() {
  const t = useTranslations('auth');
  const locale = useLocale();

  /* ---------- États ---------- */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginCredentials, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);

  /* ---------- CSRF ---------- */
  // useEffect(() => {
  //   fetch('/api/csrf')
  //     .then((r) => r.json())
  //     .then((d) => setCsrf(d.token))
  //     .catch(() => { });
  // }, []);

  /* ---------- Gestion verrou ---------- */
  useEffect(() => {
    if (lockUntil && Date.now() < lockUntil) {
      const t = setTimeout(() => setLockUntil(null), lockUntil - Date.now());
      return () => clearTimeout(t);
    }
  }, [lockUntil]);

  /* ---------- Validation ---------- */
  const validate = ({ email, password }: LoginCredentials) => {
    const e: Partial<Record<keyof LoginCredentials, string>> = {};
    if (!email) e.email = t('emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = t('emailInvalid');

    if (!password) e.password = t('passwordRequired');
    else if (password.length < 8) e.password = t('passwordTooShort');
    return e;
  };

  /* ---------- Soumission ---------- */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = validate({ email, password });
    setErrors(validation);
    if (Object.keys(validation).length) return;
    if (lockUntil) return;

    setIsLoading(true);

    try {
      // Appeler directement le backend
      const response = await authAPI.login({ email, password });

      // Stocker le token (accessToken du backend)
      if (response.data?.accessToken) {
        setAuthToken(response.data.accessToken);

        // Stocker aussi les données utilisateur
        if (response.data?.user) {
          localStorage.setItem('user-data', JSON.stringify(response.data.user));
        }
      }

      // Attendre un peu pour s'assurer que le token est bien enregistré
      await new Promise(resolve => setTimeout(resolve, 100));

      // Forcer un rechargement complet pour que le middleware puisse lire le token
      window.location.href = `/${locale}/dashboard`;
    } catch {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= Number(process.env.NEXT_PUBLIC_MAX_ATTEMPTS ?? '5')) {
        setLockUntil(
          Date.now() +
            Number(process.env.NEXT_PUBLIC_LOCKOUT_SEC ?? '30') * 1000
        );
        setErrors({ password: t('tooManyAttempts') });
      } else {
        setErrors({ password: t('invalidCredentials') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- Rendu ---------- */
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 relative">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-xl font-semibold text-[#2B6A8E]">
              {t('welcomeBack')}
            </h1>
            <p className="text-sm text-gray-500">{t('loginPrompt')}</p>
          </div>

          <form noValidate onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                {t('email')}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value.trim())
                }
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                disabled={isLoading}
                className={`w-full px-4 py-3 bg-white border text-black rounded-lg focus:outline-none focus:ring-2 transition-all
                  ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-[#2B6A8E]'}`}
              />
              {errors.email && (
                <p
                  id="email-error"
                  role="alert"
                  className="text-red-500 text-xs"
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                {t('password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? 'password-error' : undefined
                  }
                  disabled={isLoading}
                  className={`w-full px-4 py-3 pr-10 bg-white border text-black rounded-lg focus:outline-none focus:ring-2 transition-all
                    ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-[#2B6A8E]'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={t('togglePassword')}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  role="alert"
                  className="text-red-500 text-xs"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 text-[#2B6A8E] border-gray-300 rounded focus:ring-[#2B6A8E]"
                />
                <span className="text-sm text-gray-700">{t('rememberMe')}</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-[#2B6A8E] hover:text-[#255D7E]"
              >
                {t('forgotPassword')}
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !!lockUntil}
              className={`w-full bg-[#2B6A8E] text-white py-3 rounded-lg font-medium
                hover:bg-[#255D7E] focus:outline-none focus:ring-2 focus:ring-[#2B6A8E] focus:ring-offset-2
                transition-all shadow-lg
                ${isLoading || lockUntil ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {t('loggingIn')}
                </span>
              ) : (
                t('login')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
