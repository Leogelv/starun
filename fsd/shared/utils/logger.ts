type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogData {
  telegram_id?: string;
  session_id?: string;
  level: LogLevel;
  message: string;
  error_stack?: string;
  url?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private baseUrl: string;

  constructor() {
    this.baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : '';
  }

  private async sendLog(data: LogData): Promise<void> {
    if (typeof window === 'undefined') return; // Только на клиенте

    // Всегда логируем в консоль для отладки
    console.log(`[Logger ${data.level.toUpperCase()}]`, data.message, data);

    try {
      const logData: LogData = {
        ...data,
        url: data.url || window.location.href,
        user_agent: data.user_agent || navigator.userAgent,
      };

      const response = await fetch(`${this.baseUrl}/api/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Log API returned error:', response.status, errorText);
      } else {
        const result = await response.json();
        console.log('Log sent successfully:', result);
      }
    } catch (error) {
      // Fallback на console если API недоступно
      console.error('Failed to send log to server:', error);
      console.error('Original log data:', data);
    }
  }

  // Логирование ошибок
  async error(
    message: string, 
    error?: Error, 
    metadata?: Record<string, any>,
    telegram_id?: string,
    session_id?: string
  ): Promise<void> {
    await this.sendLog({
      level: 'error',
      message,
      error_stack: error?.stack,
      metadata: {
        ...metadata,
        errorName: error?.name,
        errorMessage: error?.message,
      },
      telegram_id,
      session_id,
    });
  }

  // Логирование предупреждений
  async warn(
    message: string, 
    metadata?: Record<string, any>,
    telegram_id?: string,
    session_id?: string
  ): Promise<void> {
    await this.sendLog({
      level: 'warn',
      message,
      metadata,
      telegram_id,
      session_id,
    });
  }

  // Информационные логи
  async info(
    message: string, 
    metadata?: Record<string, any>,
    telegram_id?: string,
    session_id?: string
  ): Promise<void> {
    await this.sendLog({
      level: 'info',
      message,
      metadata,
      telegram_id,
      session_id,
    });
  }

  // Debug логи (отправляются только в development)
  async debug(
    message: string, 
    metadata?: Record<string, any>,
    telegram_id?: string,
    session_id?: string
  ): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      await this.sendLog({
        level: 'debug',
        message,
        metadata,
        telegram_id,
        session_id,
      });
    }
  }

  // Логирование React ошибок
  async reactError(
    error: Error,
    errorInfo: { componentStack: string },
    metadata?: Record<string, any>,
    telegram_id?: string,
    session_id?: string
  ): Promise<void> {
    await this.sendLog({
      level: 'error',
      message: `React Error: ${error.message}`,
      error_stack: error.stack,
      metadata: {
        ...metadata,
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
      telegram_id,
      session_id,
    });
  }
}

// Singleton instance
export const logger = new Logger();

// Utility function для быстрого логирования с текущим пользователем
export const logError = (
  message: string,
  error?: Error,
  metadata?: Record<string, any>
) => {
  logger.error(message, error, metadata);
}; 