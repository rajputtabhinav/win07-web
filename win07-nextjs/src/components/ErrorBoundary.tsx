// Professional Error Boundary Component
"use client"

import React, { Component, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { logCritical } from '@/lib/centralized-error-handler'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log to centralized error handler
    logCritical('React Error Boundary caught error', error, {
      component: 'ErrorBoundary',
      errorInfo: errorInfo.componentStack
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-red-500/50 rounded-xl p-8 max-w-md w-full mx-4 text-center"
          >
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            
            <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-6">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
                <p className="text-red-400 text-sm font-mono break-all">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-red-300 text-xs cursor-pointer">Error Details</summary>
                    <pre className="text-red-300 text-xs mt-2 overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Error ID: {Date.now().toString(36)}
            </div>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

// Game-specific error boundary
export function GameErrorBoundary({ children, gameName }: { children: ReactNode, gameName: string }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        logCritical(`Game error in ${gameName}`, error, {
          component: gameName,
          errorInfo: errorInfo.componentStack
        })
      }}
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 border border-red-500/50 rounded-xl p-8 max-w-md w-full mx-4 text-center"
          >
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Game Error</h2>
            <p className="text-gray-400 mb-4">
              {gameName} encountered an error. Your balance is safe.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Restart Game
            </button>
          </motion.div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
