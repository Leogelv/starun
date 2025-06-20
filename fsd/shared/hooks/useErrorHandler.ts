'use client';

import { useEffect } from 'react';
import { logger } from '@/fsd/shared/utils/logger';

interface UseErrorHandlerOptions {
  telegram_id?: string;
  session_id?: string;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Обработчик для JavaScript ошибок
    const handleError = (event: ErrorEvent) => {
      console.error('Global JavaScript error:', event.error);
      
      logger.error(
        `JavaScript Error: ${event.message}`,
        event.error,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          timestamp: new Date().toISOString(),
        },
        options.telegram_id,
        options.session_id
      );
    };

    // Обработчик для unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      
      logger.error(
        `Unhandled Promise Rejection: ${error.message}`,
        error,
        {
          reason: String(event.reason),
          timestamp: new Date().toISOString(),
        },
        options.telegram_id,
        options.session_id
      );
    };

    // Добавляем обработчики
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup при размонтировании
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [options.telegram_id, options.session_id]);
}; 