/**
 * Logger utility for server-side logging
 * Automatically handles production/development modes
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug'

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  /**
   * Error logs - always logged (even in production)
   * In production, consider sending to error tracking service
   */
  error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args)
    // TODO: In production, send to error tracking service (Sentry, LogRocket, etc.)
  }

  /**
   * Warning logs - only in development
   */
  warn(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  }

  /**
   * Info logs - only in development
   */
  info(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, ...args)
    }
  }

  /**
   * Debug logs - only in development
   */
  debug(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  }

  /**
   * Log with emoji prefix (for visual clarity in dev)
   * Only works in development
   */
  log(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(message, ...args)
    }
  }
}

export const logger = new Logger()

