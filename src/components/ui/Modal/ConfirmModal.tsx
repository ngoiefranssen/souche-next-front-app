'use client';

import React from 'react';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
  isLoading?: boolean;
}

const variantConfig = {
  danger: {
    icon: AlertCircle,
    iconColor: 'text-red-600',
    buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-600',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
    buttonColor: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-600',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    buttonColor: 'bg-[#356ca5] hover:bg-[#2f5f91] focus:ring-[#356ca5]',
  },
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'info',
  loading = false,
  isLoading,
}) => {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const pending = isLoading ?? loading;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Error handling is done by the parent component
      console.error('Confirm action failed:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnOverlayClick={!pending}
    >
      <div className="space-y-4">
        {/* Icon and Message */}
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 ${config.iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
          <p className="text-sm text-gray-700 flex-1">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            disabled={pending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#356ca5] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={pending}
            className={`
              px-4 py-2 text-sm font-medium text-white rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-offset-2 
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              ${config.buttonColor}
            `}
          >
            {pending ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Chargement...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
