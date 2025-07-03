'use client';

import * as React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToasterProps {
  toasts?: Toast[];
}

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  default: null,
};

const toastStyles = {
  success:
    'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 border-green-200 dark:border-green-800',
  error:
    'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 border-red-200 dark:border-red-800',
  warning:
    'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800',
  info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800',
  default:
    'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700',
};

export function Toaster({ toasts = [] }: ToasterProps) {
  const [visibleToasts, setVisibleToasts] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    setVisibleToasts(toasts);
  }, [toasts]);

  const removeToast = (id: string) => {
    setVisibleToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2 pointer-events-none">
      {visibleToasts.map((toast) => {
        const Icon = toastIcons[toast.type || 'default'];
        const style = toastStyles[toast.type || 'default'];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 w-full max-w-sm p-4 rounded-lg border shadow-lg transition-all duration-300 ${style}`}
          >
            {Icon && <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />}
            <div className="flex-1">
              {toast.title && <div className="font-medium text-sm">{toast.title}</div>}
              {toast.description && (
                <div className="text-sm opacity-90 mt-1">{toast.description}</div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// Hook for using toast
export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration || 5000);
    }
  }, []);

  return { toasts, toast };
}
