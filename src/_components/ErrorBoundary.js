'use client';
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
          <div className="text-center px-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" className="mx-auto mb-6">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h1 className="text-4xl font-black text-[var(--text-primary)] mb-3">Oops</h1>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">Something went wrong</h2>
            <p className="text-[var(--text-tertiary)] max-w-md mx-auto mb-8 text-sm">
              {this.props.fallbackMessage || 'An unexpected error occurred. Please try refreshing the page.'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
              className="bg-[var(--accent)] text-white border-none px-8 py-3 rounded-full text-base font-bold cursor-pointer hover:bg-[var(--accent-hover)] transition-all duration-300 shadow-lg shadow-[var(--accent-glow)]"
            >
              Refresh Page
            </button>
          </div>
        </section>
      )
    }

    return this.props.children
  }
}
