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
        <section className="min-h-screen flex items-center justify-center bg-[#141414]">
          <div className="text-center px-4">
            <h1 className="text-6xl font-bold text-white mb-4">Oops</h1>
            <h2 className="text-2xl font-semibold text-white mb-3">Something went wrong</h2>
            <p className="text-[#b3b3b3] max-w-md mx-auto mb-8">
              {this.props.fallbackMessage || 'An unexpected error occurred. Please try refreshing the page.'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
              className="bg-[#e50914] text-white border-none px-8 py-3 rounded text-base font-bold cursor-pointer hover:bg-[#f40612] transition-colors"
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
