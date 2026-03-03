import { useCallback } from 'react';

/**
 * Type de notification toast
 */
export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

/**
 * Options pour une notification toast
 */
export interface ToastOptions {
  duration?: number; // Durée en millisecondes (défaut: 3000ms)
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}

/**
 * Interface de retour du hook useToast
 */
export interface UseToastReturn {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  dismiss: (id?: string) => void;
}

/**
 * Hook pour afficher des notifications toast
 * Utilise le ToastContext pour gérer les notifications globalement
 *
 * @returns Méthodes pour afficher différents types de notifications
 *
 * @example
 * ```tsx
 * const toast = useToast();
 *
 * // Notification de succès
 * toast.success('Utilisateur créé avec succès');
 *
 * // Notification d'erreur
 * toast.error('Erreur lors de la création');
 *
 * // Notification avec options
 * toast.info('Information importante', { duration: 5000 });
 * ```
 */
export function useToast(): UseToastReturn {
  const showToast = useCallback(
    (message: string, variant: ToastVariant, options: ToastOptions = {}) => {
      const { duration = 3000, position = 'top-right' } = options;

      // Créer l'élément toast
      const toastId = `toast-${Date.now()}-${Math.random()}`;
      const toastElement = document.createElement('div');
      toastElement.id = toastId;
      toastElement.className = getToastClasses(variant);
      toastElement.setAttribute('role', 'alert');
      toastElement.setAttribute('aria-live', 'polite');
      toastElement.innerHTML = `
      <div class="flex items-center gap-3">
        ${getToastIcon(variant)}
        <p class="text-sm font-medium">${escapeHtml(message)}</p>
        <button 
          class="ml-auto text-current opacity-70 hover:opacity-100 transition-opacity"
          onclick="document.getElementById('${toastId}')?.remove()"
          aria-label="Fermer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `;

      // Ajouter le toast au DOM
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = getContainerClasses(position);
        document.body.appendChild(container);
      }
      container.appendChild(toastElement);

      // Animation d'entrée
      setTimeout(() => {
        toastElement.style.opacity = '1';
        toastElement.style.transform = 'translateY(0)';
      }, 10);

      // Auto-dismiss après la durée spécifiée
      if (duration > 0) {
        setTimeout(() => {
          dismissToast(toastId);
        }, duration);
      }
    },
    []
  );

  const success = useCallback(
    (message: string, options?: ToastOptions) => {
      showToast(message, 'success', options);
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, options?: ToastOptions) => {
      showToast(message, 'error', options);
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, options?: ToastOptions) => {
      showToast(message, 'info', options);
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, options?: ToastOptions) => {
      showToast(message, 'warning', options);
    },
    [showToast]
  );

  const dismiss = useCallback((id?: string) => {
    if (id) {
      dismissToast(id);
    } else {
      // Fermer tous les toasts
      const container = document.getElementById('toast-container');
      if (container) {
        container.remove();
      }
    }
  }, []);

  return { success, error, info, warning, dismiss };
}

/**
 * Fermer un toast spécifique avec animation
 */
function dismissToast(id: string) {
  const toast = document.getElementById(id);
  if (toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-1rem)';
    setTimeout(() => {
      toast.remove();
      // Supprimer le container si vide
      const container = document.getElementById('toast-container');
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }
}

/**
 * Obtenir les classes CSS pour le toast selon le variant
 */
function getToastClasses(variant: ToastVariant): string {
  const baseClasses =
    'mb-4 p-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out opacity-0 transform -translate-y-4';
  const variantClasses = {
    success: 'bg-green-50 text-green-800 border border-green-200',
    error: 'bg-red-50 text-red-800 border border-red-200',
    info: 'bg-blue-50 text-blue-800 border border-blue-200',
    warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  };

  return `${baseClasses} ${variantClasses[variant]}`;
}

/**
 * Obtenir les classes CSS pour le container selon la position
 */
function getContainerClasses(position: string): string {
  const baseClasses = 'fixed z-50 pointer-events-none';
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return `${baseClasses} ${positionClasses[position as keyof typeof positionClasses] || positionClasses['top-right']}`;
}

/**
 * Obtenir l'icône SVG selon le variant
 */
function getToastIcon(variant: ToastVariant): string {
  const icons = {
    success: `
      <svg class="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    `,
    error: `
      <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    `,
    info: `
      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    `,
    warning: `
      <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    `,
  };

  return icons[variant];
}

/**
 * Échapper les caractères HTML pour prévenir XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
