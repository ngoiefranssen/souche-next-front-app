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

const SEGMENT_TRANSLATION_KEYS: Record<string, string> = {
  'employment-status': 'employmentStatus',
  'client-list': 'clientList',
  'reseller-overview': 'resellerOverview',
  'gprs-sms': 'gprsSms',
};

const ACRONYMS = new Set(['api', 'gprs', 'id', 'ip', 'sms', 'ui', 'ux']);

const toCamelCase = (value: string): string =>
  value
    .replace(/[._-]+(.)?/g, (_, char?: string) =>
      char ? char.toUpperCase() : ''
    )
    .replace(/^([A-Z])/, match => match.toLowerCase());

const formatSegmentLabel = (value: string): string =>
  value
    .replace(/^breadcrumb\./i, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(word => {
      const lower = word.toLowerCase();
      if (ACRONYMS.has(lower)) {
        return lower.toUpperCase();
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');

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

      const translationCandidates = Array.from(
        new Set([
          SEGMENT_TRANSLATION_KEYS[segment] ?? segment,
          toCamelCase(segment),
          segment,
        ])
      );

      let label = formatSegmentLabel(segment);

      for (const translationKey of translationCandidates) {
        const translatedLabel = t(translationKey);
        const isMissingTranslation =
          translatedLabel === translationKey ||
          translatedLabel === `breadcrumb.${translationKey}` ||
          translatedLabel.startsWith('breadcrumb.');

        if (!isMissingTranslation) {
          label = translatedLabel;
          break;
        }
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
