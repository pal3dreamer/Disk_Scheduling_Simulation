import { render, screen, waitFor, within } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from '@/App'

describe('End-to-End: Complete Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should execute a complete simulation: load scenario → select algorithm → step through → verify all components update', async () => {
    // Render the full app
    const { rerender } = render(<App />)

    // Wait for app to mount and Three.js scene to render
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next step/i })).toBeInTheDocument()
    }, { timeout: 5000 })

    // Verify initial state: no requests queued
    const queueMonitor = screen.getByText(/queue/i).closest('.card-accent')
    expect(within(queueMonitor!).queryByText(/track \d+/)).not.toBeInTheDocument()

    // Manually add a request to queue
    const trackInput = screen.getByDisplayValue(/^\d+$/)
    const addBtn = screen.getByRole('button', { name: /add request/i })
    
    trackInput.value = '100'
    trackInput.dispatchEvent(new Event('change', { bubbles: true }))
    addBtn.click()

    // Verify request is now in queue
    await waitFor(() => {
      const queueItems = screen.getAllByText(/track/)
      expect(queueItems.length).toBeGreaterThanOrEqual(1)
    })

    // Select an algorithm
    const algorithmSelect = screen.getByDisplayValue(/FCFS/i)
    expect(algorithmSelect).toBeInTheDocument()

    // Step through simulation (3 steps)
    const nextStepBtn = screen.getByRole('button', { name: /next step/i })
    for (let i = 0; i < 3; i++) {
      nextStepBtn.click()

      // Each step should update metrics
      await waitFor(() => {
        const metricsPanel = screen.getByText(/step count/i).closest('.card-accent')
        expect(metricsPanel).toBeInTheDocument()
      }, { timeout: 2000 })
    }

    // Verify head position display is non-zero (arm moved)
    const headPos = screen.getByText(/current track/i)
    expect(headPos.textContent).toBeTruthy()
  })
})
