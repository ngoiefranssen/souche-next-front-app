'use client';

import React from 'react';
import {
  Listbox as HeadlessListbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';

export interface AppListboxOption<TValue extends string | number> {
  label: string;
  value: TValue;
  disabled?: boolean;
}

export interface AppListboxProps<TValue extends string | number> {
  value: TValue | null;
  onChange: (value: TValue) => void;
  options: AppListboxOption<TValue>[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  optionsClassName?: string;
}

export function AppListbox<TValue extends string | number>({
  value,
  onChange,
  options,
  placeholder = 'Sélectionner une option',
  disabled = false,
  className = '',
  buttonClassName = '',
  optionsClassName = '',
}: AppListboxProps<TValue>) {
  const selectedOption = options.find(option => option.value === value);

  return (
    <HeadlessListbox value={value} onChange={onChange} disabled={disabled}>
      <div className={`relative ${className}`}>
        <ListboxButton
          className={`
            w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-900
            focus:outline-none focus:ring-2 focus:ring-[#356ca5]
            disabled:cursor-not-allowed disabled:bg-gray-100
            ${buttonClassName}
          `}
        >
          <span className="block truncate">
            {selectedOption?.label || placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            <ChevronDown className="h-5 w-5" aria-hidden="true" />
          </span>
        </ListboxButton>

        <ListboxOptions
          className={`
            absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg
            focus:outline-none
            ${optionsClassName}
          `}
        >
          {options.map(option => (
            <ListboxOption
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="cursor-pointer"
            >
              {({ focus, selected, disabled: optionDisabled }) => (
                <div
                  className={`
                    relative flex items-center px-3 py-2 text-sm
                    ${selected ? 'font-medium text-[#1F3651]' : 'text-gray-700'}
                    ${focus ? 'bg-[#F2F5F9]' : ''}
                    ${optionDisabled ? 'cursor-not-allowed opacity-50' : ''}
                  `}
                >
                  <span className="block truncate">{option.label}</span>
                  {selected && (
                    <span className="ml-auto text-[#2B6A8E]">
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                  )}
                </div>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </HeadlessListbox>
  );
}
