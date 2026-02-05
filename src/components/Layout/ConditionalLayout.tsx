'use client';

import { usePathname } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Pages publiques qui ne doivent pas avoir le MainLayout
  const publicPages = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ];
  const isPublicPage = publicPages.some(page => pathname?.includes(page));

  if (isPublicPage) {
    return <>{children}</>;
  }

  return <MainLayout>{children}</MainLayout>;
}
