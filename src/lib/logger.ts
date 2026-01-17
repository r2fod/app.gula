type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  prefix?: string;
}

class Logger {
  private config: LoggerConfig;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      enabled: import.meta.env.DEV,
      level: 'info',
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled && level !== 'error') {
      return false;
    }
    return true;
  }

  private formatMessage(level: LogLevel, ...args: any[]): any[] {
    const timestamp = new Date().toISOString();
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : '';
    const levelEmoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🔍',
    };

    return [`${levelEmoji[level]} ${prefix}`, ...args];
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(...this.formatMessage('info', ...args));
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(...this.formatMessage('warn', ...args));
    }
  }

  error(...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(...this.formatMessage('error', ...args));
    }
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(...this.formatMessage('debug', ...args));
    }
  }

  group(label: string): void {
    if (this.config.enabled) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.config.enabled) {
      console.groupEnd();
    }
  }

  table(data: any): void {
    if (this.config.enabled) {
      console.table(data);
    }
  }
}

export const logger = new Logger();

export const createLogger = (prefix: string) => new Logger({ prefix });
