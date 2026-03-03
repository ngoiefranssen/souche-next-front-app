'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Home, ChevronRight } from 'lucide-react';

interface BreadcrumbSegment {
  label: string;
  href: string;
  isLast: boolean;
}

export const Breadcrumb: React.FC = () => {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('breadcrumb');

  // Parse pathname to generate breadcrumb segments
  const generateBreadcrumbs = (): BreadcrumbSegment[] => {
    // Remove locale from pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');

    // Split path into segments and filter empty strings
    const segments = pathWithoutLocale.split('/').filter(Boolean);

    if (segments.length === 0) {
      return [];
    }

    const breadcrumbs: BreadcrumbSegment[] = [];
    let currentPath = `/${locale}`;

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      // Skip dynamic route segments (like [id])
      if (segment.startsWith('[') && segment.endsWith(']')) {
        return;
      }

      // Check if segment is a number (likely an ID)
      const isNumeric = /^\d+$/.test(segment);
      if (isNumeric) {
        return;
      }

      // Map segment to translation key
      let translationKey = segment;

      // Handle special cases
      if (segment === 'employment-status') {
        translationKey = 'employmentStatus';
      }

      // Get translated label, fallback to capitalized segment
      let label: string;
      try {
        label = t(translationKey);
      } catch {
        // If translation doesn't exist, capitalize the segment
        label =
          segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      }

      breadcrumbs.push({
        label,
        href: currentPath,
        isLast,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't render breadcrumb if we're on the dashboard root
  if (
    breadcrumbs.length === 0 ||
    (breadcrumbs.length === 1 && breadcrumbs[0].label === t('dashboard'))
  ) {
    return null;
  }

  return (
    <nav
      className="flex items-center space-x-2 text-sm mb-1 px-1"
      aria-label="Breadcrumb"
    >
      {/* Home icon */}
      <Link
        href={`/${locale}/dashboard`}
        className="text-gray-500 hover:text-[#2B6A8E] transition-colors p-1 rounded hover:bg-gray-100"
        aria-label={t('home')}
      >
        <Home className="w-4 h-4" />
      </Link>

      {/* Breadcrumb segments */}
      {breadcrumbs.map(segment => (
        <React.Fragment key={segment.href}>
          {/* Separator */}
          <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />

          {/* Segment */}
          {segment.isLast ? (
            <span className="text-gray-900 font-medium" aria-current="page">
              {segment.label}
            </span>
          ) : (
            <Link
              href={segment.href}
              className="text-gray-500 hover:text-[#2B6A8E] transition-colors hover:underline"
            >
              {segment.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
