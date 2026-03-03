import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AuthProvider } from '@/contexts/AuthContext';
import { PermissionProvider } from '@/contexts/PermissionContext';
import ConditionalLayout from '@/components/Layout/ConditionalLayout';
import { CsrfInitializer } from '@/components/CsrfInitializer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'JULIA - Learning Management System',
  description: 'Professional learning management platform',
};

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
    <html lang={locale}>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <PermissionProvider>
              <CsrfInitializer />
              <ConditionalLayout>{children}</ConditionalLayout>
            </PermissionProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
