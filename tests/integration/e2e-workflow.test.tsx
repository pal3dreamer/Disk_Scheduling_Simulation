import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from '@/App'

describe('End-to-End: Complete Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render TimelineVisualizer with all controls and auto-play functionality', async () => {
    // Render the full app
    render(<App />)

    // Wait for canvas and playback controls to render
    await waitFor(() => {
      const canvas = document.querySelector('canvas')
      expect(canvas).toBeTruthy()
    }, { timeout: 5000 })

    // Verify PlaybackControls exist
    const playButton = screen.getByRole('button', { name: /play/i })
    expect(playButton).toBeTruthy()

    // Verify speed controls exist
    const speedInput = screen.getByDisplayValue('1')
    expect(speedInput).toBeTruthy()

    // Verify reset button exists
    const resetButton = screen.getByRole('button', { name: /reset/i })
    expect(resetButton).toBeTruthy()

    // Verify metrics toggle button exists
    const metricsToggle = screen.getByRole('button', { name: /metrics/i })
    expect(metricsToggle).toBeTruthy()
  })

  it('should render canvas on the page', async () => {
    render(<App />)

    await waitFor(() => {
      const canvas = document.querySelector('canvas')
      expect(canvas).toBeTruthy()
      expect(canvas?.width).toBeGreaterThan(0)
      expect(canvas?.height).toBeGreaterThan(0)
    }, { timeout: 5000 })
  })
})
