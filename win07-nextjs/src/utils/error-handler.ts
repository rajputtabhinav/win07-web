/**
 * Centralized Error Handling Service
 * This replaces console.log statements with proper error handling
 */

export interface ErrorContext {
  userId?: string
  userEmail?: string
  action?: string
  data?: any
  timestamp?: Date
}

export interface ErrorReport {
  message: string
  level: 'info' | 'warning' | 'error' | 'critical'
  context?: ErrorContext
  stack?: string
}

class ErrorHandler {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private errorQueue: ErrorReport[] = []

  /**
   * Log an info message (replaces console.log)
   */
  info(message: string, context?: ErrorContext) {
    this.report({
      message,
      level: 'info',
      context: {
        ...context,
        timestamp: new Date()
      }
    })
  }

  /**
   * Log a warning (for non-critical issues)
   */
  warning(message: string, context?: ErrorContext) {
    this.report({
      message,
      level: 'warning',
      context: {
        ...context,
        timestamp: new Date()
      }
    })
  }

  /**
   * Log an error
   */
  error(message: string, error?: Error, context?: ErrorContext) {
    this.report({
      message,
      level: 'error',
      context: {
        ...context,
        timestamp: new Date()
      },
      stack: error?.stack
    })
  }

  /**
   * Log a critical error (requires immediate attention)
   */
  critical(message: string, error?: Error, context?: ErrorContext) {
    this.report({
      message,
      level: 'critical',
      context: {
        ...context,
        timestamp: new Date()
      },
      stack: error?.stack
    })
  }

  /**
   * Private method to handle error reporting
   */
  private report(errorReport: ErrorReport) {
    // In development, log to console
    if (this.isDevelopment) {
      const logMethod = errorReport.level === 'critical' || errorReport.level === 'error' 
        ? console.error 
        : errorReport.level === 'warning' 
        ? console.warn 
        : console.log

      logMethod(`[${errorReport.level.toUpperCase()}] ${errorReport.message}`, {
        context: errorReport.context,
        stack: errorReport.stack
      })
    }

    // In production, send to error reporting service
    if (!this.isDevelopment) {
      this.sendToErrorService(errorReport)
    }

    // Store in queue for batch processing
    this.errorQueue.push(errorReport)

    // Limit queue size
    if (this.errorQueue.length > 100) {
      this.errorQueue = this.errorQueue.slice(-50)
    }
  }

  /**
   * Send error to external error reporting service (Sentry, LogRocket, etc.)
   */
  private async sendToErrorService(errorReport: ErrorReport) {
    try {
      // TODO: Integrate with Sentry or another error reporting service
      // Example:
      // if (typeof window !== 'undefined' && window.Sentry) {
      //   window.Sentry.captureException(new Error(errorReport.message), {
      //     level: errorReport.level,
      //     extra: errorReport.context,
      //     tags: {
      //       action: errorReport.context?.action
      //     }
      //   })
      // }

      // For now, store in localStorage for admin review
      if (typeof window !== 'undefined') {
        const existingErrors = JSON.parse(localStorage.getItem('errorLogs') || '[]')
        existingErrors.push(errorReport)
        
        // Keep only last 50 errors
        const recentErrors = existingErrors.slice(-50)
        localStorage.setItem('errorLogs', JSON.stringify(recentErrors))
      }
    } catch (e) {
      // Silently fail - don't crash the app because of error reporting
    }
  }

  /**
   * Get recent errors (for admin dashboard)
   */
  getRecentErrors(): ErrorReport[] {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('errorLogs') || '[]')
      } catch {
        return []
      }
    }
    return this.errorQueue
  }

  /**
   * Clear error logs
   */
  clearErrors() {
    this.errorQueue = []
    if (typeof window !== 'undefined') {
      localStorage.removeItem('errorLogs')
    }
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler()

// Convenience functions for easy importing
export const logInfo = (message: string, context?: ErrorContext) => errorHandler.info(message, context)
export const logWarning = (message: string, context?: ErrorContext) => errorHandler.warning(message, context)
export const logError = (message: string, error?: Error, context?: ErrorContext) => errorHandler.error(message, error, context)
export const logCritical = (message: string, error?: Error, context?: ErrorContext) => errorHandler.critical(message, error, context)
