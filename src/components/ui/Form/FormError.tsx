'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface FormErrorProps {
  message: string;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({
  message,
  className = '',
}) => {
  if (!message) return null;

  return (
    <div
      className={`
        flex items-start gap-2 p-3 
        bg-red-50 border border-red-200 rounded-lg
        ${className}
      `}
      role="alert"
    >
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-800">{message}</p>
    </div>
  );
};
