import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary: Catches React errors and displays fallback UI
 * 
 * Features:
 * - Catches errors in child components
 * - Displays user-friendly error message
 * - Provides reload button to recover
 * - Logs error details to console for debugging
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="card-accent p-8 max-w-md rounded-lg shadow-2xl border border-slate-700">
            <h1 className="text-2xl font-bold text-red-400 mb-3">Error</h1>
            <p className="text-slate-300 mb-6 break-words">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-industrial w-full bg-amber-600 hover:bg-amber-700 active:bg-amber-800 transition-colors"
            >
              Reload App
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
