'use client';

import React from 'react';

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
}

const variantClasses = {
  text: 'rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-lg',
};

const SkeletonItem: React.FC<Omit<SkeletonProps, 'count'>> = ({
  variant = 'text',
  width,
  height,
  className = '',
}) => {
  const style: React.CSSProperties = {};

  if (width !== undefined) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }

  if (height !== undefined) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  } else {
    // Default heights based on variant
    if (variant === 'text') {
      style.height = '1rem';
    } else if (variant === 'circular') {
      style.height = width || '3rem';
      style.width = width || '3rem';
    }
  }

  return (
    <div
      className={`
        animate-pulse bg-gray-200
        ${variantClasses[variant]}
        ${className}
      `}
      style={style}
      aria-hidden="true"
    />
  );
};

export const Skeleton: React.FC<SkeletonProps> = ({ count = 1, ...props }) => {
  if (count === 1) {
    return <SkeletonItem {...props} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem key={index} {...props} />
      ))}
    </div>
  );
};
