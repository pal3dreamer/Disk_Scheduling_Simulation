import { describe, it, expect } from 'vitest'
import { debounce, throttle, PerformanceMonitor } from '@/utils/performanceOptimizations'

describe('Performance Optimizations', () => {
  it('debounce should call function only once after delay', async () => {
    let callCount = 0
    const fn = () => callCount++
    const debouncedFn = debounce(fn, 100)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    expect(callCount).toBe(0)

    await new Promise(resolve => setTimeout(resolve, 150))
    expect(callCount).toBe(1)
  })

  it('throttle should limit calls to interval', async () => {
    let callCount = 0
    const fn = () => callCount++
    const throttledFn = throttle(fn, 100)

    throttledFn()
    throttledFn()
    expect(callCount).toBe(1)

    await new Promise(resolve => setTimeout(resolve, 150))
    throttledFn()
    expect(callCount).toBe(2)
  })

  it('PerformanceMonitor should track FPS', async () => {
    const monitor = new PerformanceMonitor()

    // Record 60 frames at ~16ms each
    // Need to wait for 1000ms to trigger FPS calculation
    const startTime = Date.now()
    let frameCount = 0
    
    while (Date.now() - startTime < 1100) {
      monitor.recordFrame(16)
      frameCount++
      // Small delay to simulate real frame timing
      await new Promise(resolve => setTimeout(resolve, 1))
    }

    const report = monitor.getReport()
    expect(report.fps).toBeGreaterThan(0)
    expect(report.renderTimeMs).toBeCloseTo(16, 0)
  })
})
