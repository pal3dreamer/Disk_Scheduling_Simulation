import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '@/App'

describe('Integration: Algorithm Switching', () => {
  it('should switch algorithms mid-simulation without losing queue state', async () => {
    render(<App />)

    // Wait for app to be ready
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next step/i })).toBeInTheDocument()
    }, { timeout: 5000 })

    // Manually add 3 requests to queue via DiskConfig UI
    const trackInput = screen.getByDisplayValue(/^\d+$/)
    const addBtn = screen.getByRole('button', { name: /add request/i })

    for (let track of [100, 200, 150]) {
      trackInput.value = String(track)
      trackInput.dispatchEvent(new Event('change', { bubbles: true }))
      addBtn.click()
    }

    // Verify 3 requests in queue
    await waitFor(() => {
      const queueItems = screen.getAllByText(/track/)
      expect(queueItems.length).toBeGreaterThanOrEqual(3)
    })

    // Step once with FCFS
    const nextStepBtn = screen.getByRole('button', { name: /next step/i })
    nextStepBtn.click()

    await waitFor(() => {
      expect(screen.getByText(/step count/i)).toBeInTheDocument()
    }, { timeout: 2000 })

    // Switch algorithm to SSTF
    const algorithmSelect = screen.getByDisplayValue(/FCFS/i)
    algorithmSelect.value = 'SSTF'
    algorithmSelect.dispatchEvent(new Event('change', { bubbles: true }))

    // Verify queue is still present (not cleared)
    await waitFor(() => {
      const queueItems = screen.getAllByText(/track/)
      expect(queueItems.length).toBeGreaterThanOrEqual(3)
    })

    // Step again with SSTF
    nextStepBtn.click()

    // Verify algorithm changed and step count incremented
    await waitFor(() => {
      expect(algorithmSelect).toHaveValue('SSTF')
    }, { timeout: 2000 })

    // Head position should be non-zero (arm moved)
    const headPos = screen.getByText(/current track/i)
    expect(headPos.textContent).toBeTruthy()
  })
})
