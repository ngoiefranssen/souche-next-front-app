'use client';

import React from 'react';
import {
  Dialog as HeadlessDialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle as HeadlessDialogTitle,
} from '@headlessui/react';

export interface AppDialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  panelClassName?: string;
  overlayClassName?: string;
  closeOnBackdropClick?: boolean;
  initialFocus?: React.MutableRefObject<HTMLElement | null>;
}

interface AppDialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const baseOverlayClassName = 'fixed inset-0 bg-black/50';
const basePanelClassName = 'relative w-full bg-white rounded-lg shadow-xl';

export const AppDialog: React.FC<AppDialogProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  panelClassName = '',
  overlayClassName = '',
  closeOnBackdropClick = true,
  initialFocus,
}) => {
  if (!isOpen) return null;

  return (
    <HeadlessDialog
      open={isOpen}
      onClose={() => onClose()}
      initialFocus={initialFocus}
      transition={false}
      className={`relative z-50 ${className}`}
    >
      {closeOnBackdropClick ? (
        <>
          <DialogBackdrop
            data-testid="app-dialog-overlay"
            className={`${baseOverlayClassName} ${overlayClassName}`}
            onClick={event => {
              event.stopPropagation();
              onClose();
            }}
          />

          <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6">
            <div className="flex min-h-full items-center justify-center">
              <DialogPanel
                data-testid="app-dialog-panel"
                className={`${basePanelClassName} ${panelClassName}`}
              >
                {children}
              </DialogPanel>
            </div>
          </div>
        </>
      ) : (
        <DialogPanel className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
          <div
            data-testid="app-dialog-overlay"
            className={`absolute inset-0 ${baseOverlayClassName} ${overlayClassName}`}
            aria-hidden="true"
          />

          <div
            data-testid="app-dialog-panel"
            className={`${basePanelClassName} ${panelClassName}`}
          >
            {children}
          </div>
        </DialogPanel>
      )}
    </HeadlessDialog>
  );
};

export const AppDialogTitle: React.FC<AppDialogTitleProps> = ({
  children,
  ...props
}) => {
  return (
    <HeadlessDialogTitle as="h2" {...props}>
      {children}
    </HeadlessDialogTitle>
  );
};
