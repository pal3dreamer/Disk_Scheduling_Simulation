import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ErrorBoundary } from '@/components/ErrorBoundary'

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children when there is no error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()

    vi.restoreAllMocks()
  })

  it('renders error UI when child throws an error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const ThrowError = () => {
      throw new Error('Test error message')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText(/Test error message/)).toBeInTheDocument()

    vi.restoreAllMocks()
  })

  it('displays reload button in error state', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const ThrowError = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    const reloadButton = screen.getByRole('button', { name: /reload/i })
    expect(reloadButton).toBeInTheDocument()

    vi.restoreAllMocks()
  })

  it('renders error message in error UI', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const ThrowError = () => {
      throw new Error('Something went wrong')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()

    vi.restoreAllMocks()
  })

  it('styles error UI with correct Tailwind classes', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const ThrowError = () => {
      throw new Error('Test')
    }

    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    const errorContainer = container.querySelector(
      '.flex.items-center.justify-center'
    )
    expect(errorContainer).toBeTruthy()
    expect(
      errorContainer?.className.includes('bg-gradient-to-br')
    ).toBeTruthy()

    vi.restoreAllMocks()
  })

  it('logs errors to console when error occurs', () => {
    const consoleSpy = vi.spyOn(console, 'error')

    const ThrowError = () => {
      throw new Error('Console test error')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    // ErrorBoundary should log something to console.error
    expect(consoleSpy).toHaveBeenCalled()

    vi.restoreAllMocks()
  })
})

