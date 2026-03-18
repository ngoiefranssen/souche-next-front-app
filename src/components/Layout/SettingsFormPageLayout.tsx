'use client';

import React from 'react';

interface SettingsFormPageLayoutProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /**
   * Customize vertical spacing for current and future forms.
   * Example: "py-1 sm:py-2" | "py-3 sm:py-4"
   */
  verticalSpacingClassName?: string;
}

export default function SettingsFormPageLayout({
  title,
  description,
  action,
  children,
  className,
  verticalSpacingClassName = 'py-2 sm:py-3',
}: SettingsFormPageLayoutProps) {
  return (
    <div
      className={[
        'w-full px-1 sm:px-2 lg:px-2 space-y-3',
        verticalSpacingClassName,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-gray-600 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>

        {action ? <div className="sm:w-auto">{action}</div> : null}
      </div>

      {children}
    </div>
  );
}
