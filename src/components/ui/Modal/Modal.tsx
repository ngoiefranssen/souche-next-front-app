'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { AppDialog, AppDialogTitle } from '@/components/ui/Headless';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  headerClassName?: string;
  titleClassName?: string;
  closeButtonClassName?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  headerClassName,
  titleClassName,
  closeButtonClassName,
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    // Keep scroll behavior consistent with previous implementation.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow || 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AppDialog
      isOpen={isOpen}
      onClose={onClose}
      closeOnBackdropClick={closeOnOverlayClick}
      overlayClassName="animate-fade-in"
      panelClassName={`
        max-h-[90vh] sm:max-h-[85vh] flex flex-col animate-slide-up
        ${sizeClasses[size]}
      `}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 ${headerClassName ?? ''}`}
      >
        <AppDialogTitle
          id="modal-title"
          className={`text-base sm:text-lg font-semibold text-gray-900 ${titleClassName ?? ''}`}
        >
          {title}
        </AppDialogTitle>
        {showCloseButton && (
          <button
            onClick={onClose}
            className={`text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#356ca5] rounded-lg p-1 ${closeButtonClassName ?? ''}`}
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto flex-1">
        {children}
      </div>
    </AppDialog>
  );
};
