'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';

/**
 * Page 403 - Accès refusé
 *
 * Cette page est affichée lorsqu'un utilisateur tente d'accéder à une ressource
 * pour laquelle il n'a pas les permissions nécessaires.
 *
 * Elle offre deux options de navigation :
 * - Retour à la page précédente
 * - Retour au dashboard
 */
export default function ForbiddenPage() {
  const router = useRouter();
  const t = useTranslations('errors');

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icône d'erreur */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-6">
            <ShieldAlert className="w-16 h-16 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Code d'erreur */}
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
          403
        </h1>

        {/* Titre */}
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {t('forbidden.title', { defaultValue: 'Accès refusé' })}
        </h2>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {t('forbidden.message', {
            defaultValue:
              "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource. Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre administrateur.",
          })}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="secondary"
            onClick={handleGoBack}
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            {t('forbidden.goBack', { defaultValue: 'Retour' })}
          </Button>

          <Button
            variant="primary"
            onClick={handleGoHome}
            icon={<Home className="w-4 h-4" />}
            iconPosition="left"
          >
            {t('forbidden.goHome', { defaultValue: 'Aller au dashboard' })}
          </Button>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('forbidden.help', {
              defaultValue: "Besoin d'aide ? Contactez le support technique.",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
