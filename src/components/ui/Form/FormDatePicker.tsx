'use client';

import React, { forwardRef } from 'react';
import { Calendar } from 'lucide-react';

export interface FormDatePickerProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormDatePicker = forwardRef<HTMLInputElement, FormDatePickerProps>(
  (
    { label, error, helperText, required, className = '', id, ...props },
    ref
  ) => {
    const fieldId = id || `date-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = `${fieldId}-error`;
    const helperId = `${fieldId}-helper`;

    return (
      <div className="w-full">
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Calendar className="w-5 h-5" />
          </div>

          <input
            ref={ref}
            type="date"
            id={fieldId}
            required={required}
            className={`
              w-full px-3 py-2 pl-10
              border rounded-lg
              text-gray-900
              focus:outline-none focus:ring-2 focus:ring-offset-0
              transition-all duration-200
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${
                error
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-[#2B6A8E] focus:border-[#2B6A8E]'
              }
              ${className}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            {...props}
          />
        </div>

        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormDatePicker.displayName = 'FormDatePicker';
