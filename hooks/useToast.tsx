'use client';

import { useCallback } from 'react';
import { Toaster, toast } from 'sonner';

export function useToast() {
  const showSuccess = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const showError = useCallback((message: string) => {
    toast.error(message);
  }, []);

  const showInfo = useCallback((message: string) => {
    toast(message);
  }, []);

  return { showSuccess, showError, showInfo };
}

export function ToastProvider() {
  return <Toaster position="top-right" richColors />;
}
