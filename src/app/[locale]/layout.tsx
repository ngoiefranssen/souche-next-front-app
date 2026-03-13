import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AuthProvider } from '@/contexts/AuthContext';
import { PermissionProvider } from '@/contexts/PermissionContext';
import ConditionalLayout from '@/components/Layout/ConditionalLayout';
import { CsrfInitializer } from '@/components/CsrfInitializer';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>
        <PermissionProvider>
          <CsrfInitializer />
          <ConditionalLayout>{children}</ConditionalLayout>
        </PermissionProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
