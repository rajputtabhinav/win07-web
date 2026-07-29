// Centralized Error Handling System - Production Ready
import { toast } from 'sonner'

export interface ErrorContext {
  userId?: string
  action?: string
  component?: string
  api?: string
  data?: any
  timestamp?: Date
}

export interface ErrorReport {
  id: string
  message: string
  level: 'info' | 'warning' | 'error' | 'critical'
  context: ErrorContext
  stack?: string
  timestamp: Date
}

class CentralizedErrorHandler {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private errorQueue: ErrorReport[] = []
  private maxQueueSize = 100

  // Log info message
  info(message: string, context?: ErrorContext) {
    this.report({
      id: this.generateId(),
      message,
      level: 'info',
      context: { ...context, timestamp: new Date() },
      timestamp: new Date()
    })
  }

  // Log warning
  warning(message: string, context?: ErrorContext) {
    this.report({
      id: this.generateId(),
      message,
      level: 'warning',
      context: { ...context, timestamp: new Date() },
      timestamp: new Date()
    })
  }

  // Log error
  error(message: string, error?: Error, context?: ErrorContext) {
    this.report({
      id: this.generateId(),
      message,
      level: 'error',
      context: { ...context, timestamp: new Date() },
      stack: error?.stack,
      timestamp: new Date()
    })

    // Show user-friendly toast in development
    if (this.isDevelopment) {
      toast.error(this.getUserFriendlyMessage(message))
    }
  }

  // Log critical error
  critical(message: string, error?: Error, context?: ErrorContext) {
    this.report({
      id: this.generateId(),
      message,
      level: 'critical',
      context: { ...context, timestamp: new Date() },
      stack: error?.stack,
      timestamp: new Date()
    })

    // Always show critical errors to user
    toast.error('A critical error occurred. Please refresh the page.')
  }

  // Handle API errors specifically
  apiError(endpoint: string, status: number, message: string, context?: ErrorContext) {
    this.error(`API Error [${status}] ${endpoint}: ${message}`, undefined, {
      ...context,
      api: endpoint,
      status
    })
  }

  // Handle game errors specifically
  gameError(game: string, action: string, message: string, context?: ErrorContext) {
    this.error(`Game Error [${game}] ${action}: ${message}`, undefined, {
      ...context,
      component: game,
      action
    })
  }

  // Handle financial errors specifically
  financialError(operation: string, amount: number, message: string, context?: ErrorContext) {
    this.critical(`Financial Error [${operation}] ₹${amount}: ${message}`, undefined, {
      ...context,
      action: operation,
      amount
    })
  }

  private report(errorReport: ErrorReport) {
    // Console logging in development
    if (this.isDevelopment) {
      const logMethod = this.getLogMethod(errorReport.level)
      logMethod(`[${errorReport.level.toUpperCase()}] ${errorReport.message}`, {
        context: errorReport.context,
        stack: errorReport.stack
      })
    }

    // Store in queue
    this.errorQueue.push(errorReport)
    
    // Limit queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(-50)
    }

    // Send to external service in production
    if (!this.isDevelopment) {
      this.sendToExternalService(errorReport)
    }
  }

  private getLogMethod(level: string) {
    switch (level) {
      case 'critical':
      case 'error':
        return console.error
      case 'warning':
        return console.warn
      default:
        return console.log
    }
  }

  private getUserFriendlyMessage(message: string): string {
    // Convert technical errors to user-friendly messages
    const errorMap: Record<string, string> = {
      'Insufficient balance': 'You don\'t have enough balance for this action',
      'Invalid amount': 'Please enter a valid amount',
      'User not found': 'Account not found. Please try signing in again',
      'Game processing failed': 'Game temporarily unavailable. Please try again',
      'Authentication failed': 'Please sign in to continue',
      'Database connection failed': 'Service temporarily unavailable. Please try again',
      'Invalid game parameters': 'Invalid game settings. Please refresh and try again'
    }

    return errorMap[message] || 'Something went wrong. Please try again'
  }

  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async sendToExternalService(errorReport: ErrorReport) {
    // In production, send to error monitoring service like Sentry
    try {
      // Example implementation for Sentry or similar service
      if (process.env.ERROR_REPORTING_URL) {
        await fetch(process.env.ERROR_REPORTING_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorReport)
        })
      }
    } catch (error) {
      console.error('Failed to send error report:', error)
    }
  }

  // Get error statistics
  getErrorStats() {
    const now = Date.now()
    const oneHourAgo = now - (60 * 60 * 1000)
    
    const recentErrors = this.errorQueue.filter(
      err => err.timestamp.getTime() > oneHourAgo
    )

    return {
      total: this.errorQueue.length,
      lastHour: recentErrors.length,
      critical: recentErrors.filter(err => err.level === 'critical').length,
      errors: recentErrors.filter(err => err.level === 'error').length,
      warnings: recentErrors.filter(err => err.level === 'warning').length
    }
  }

  // Clear error queue
  clearErrors() {
    this.errorQueue = []
  }
}

// Singleton instance
export const errorHandler = new CentralizedErrorHandler()

// Convenience exports
export const logInfo = (message: string, context?: ErrorContext) => errorHandler.info(message, context)
export const logWarning = (message: string, context?: ErrorContext) => errorHandler.warning(message, context)
export const logError = (message: string, error?: Error, context?: ErrorContext) => errorHandler.error(message, error, context)
export const logCritical = (message: string, error?: Error, context?: ErrorContext) => errorHandler.critical(message, error, context)
export const logApiError = (endpoint: string, status: number, message: string, context?: ErrorContext) => errorHandler.apiError(endpoint, status, message, context)
export const logGameError = (game: string, action: string, message: string, context?: ErrorContext) => errorHandler.gameError(game, action, message, context)
export const logFinancialError = (operation: string, amount: number, message: string, context?: ErrorContext) => errorHandler.financialError(operation, amount, message, context)
