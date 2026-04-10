import { describe, it, expect } from 'vitest'
import { CSCANAlgorithm } from '@/engine/algorithms/cscan'
import type { Request, SimulationState } from '@/engine/types'

describe('C-SCAN Algorithm', () => {
  const algo = new CSCANAlgorithm()

  it('should only move in one direction, wrap at end', () => {
    const state: SimulationState = {
      algorithm: 'C-SCAN',
      diskSize: 500,
      trackSeekTime: 0.1,
      platterRPM: 7200,
      headPosition: 400,
      headDirection: 1,
      platterAngle: 0,
      requestQueue: [],
      completedRequests: [],
      currentTime: 0,
      stepCount: 0,
    }

    const req1: Request = { id: '1', track: 450, arrivalTime: 0 }
    const req2: Request = { id: '2', track: 50, arrivalTime: 5 }
    const queue = [req1, req2]

    // Should pick req1 (forward direction)
    const selected = algo.selectNext(queue, state)
    expect(selected?.id).toBe('1')
  })

  it('should wrap around to beginning when no requests ahead', () => {
    const state: SimulationState = {
      algorithm: 'C-SCAN',
      diskSize: 500,
      trackSeekTime: 0.1,
      platterRPM: 7200,
      headPosition: 400,
      headDirection: 1,
      platterAngle: 0,
      requestQueue: [],
      completedRequests: [],
      currentTime: 0,
      stepCount: 0,
    }

    const req1: Request = { id: '1', track: 50, arrivalTime: 0 }
    const queue = [req1]

    // Should pick req1 (wrap around)
    const selected = algo.selectNext(queue, state)
    expect(selected?.id).toBe('1')
  })

  it('should return null if queue is empty', () => {
    const state: SimulationState = {
      algorithm: 'C-SCAN',
      diskSize: 500,
      trackSeekTime: 0.1,
      platterRPM: 7200,
      headPosition: 400,
      headDirection: 1,
      platterAngle: 0,
      requestQueue: [],
      completedRequests: [],
      currentTime: 0,
      stepCount: 0,
    }

    const selected = algo.selectNext([], state)
    expect(selected).toBeNull()
  })

  it('should have correct name and description', () => {
    expect(algo.getName()).toBe('C-SCAN')
    expect(algo.getDescription()).toContain('Circular')
  })
})
