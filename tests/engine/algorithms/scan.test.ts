import { describe, it, expect } from 'vitest'
import { SCANAlgorithm } from '@/engine/algorithms/scan'
import type { Request, SimulationState } from '@/engine/types'

describe('SCAN Algorithm', () => {
  const algo = new SCANAlgorithm()

  it('should select request in current direction', () => {
    const state: SimulationState = {
      algorithm: 'SCAN',
      diskSize: 500,
      trackSeekTime: 0.1,
      platterRPM: 7200,
      headPosition: 250,
      headDirection: 1, // moving toward higher tracks
      platterAngle: 0,
      requestQueue: [],
      completedRequests: [],
      currentTime: 0,
      stepCount: 0,
    }

    const req1: Request = { id: '1', track: 300, arrivalTime: 0 }
    const req2: Request = { id: '2', track: 100, arrivalTime: 5 }
    const queue = [req1, req2]

    // Should pick req1 first (in direction of head)
    const selected = algo.selectNext(queue, state)
    expect(selected?.id).toBe('1')
  })

  it('should select highest track when moving right at end', () => {
    const state: SimulationState = {
      algorithm: 'SCAN',
      diskSize: 500,
      trackSeekTime: 0.1,
      platterRPM: 7200,
      headPosition: 100,
      headDirection: 1,
      platterAngle: 0,
      requestQueue: [],
      completedRequests: [],
      currentTime: 0,
      stepCount: 0,
      activeRequest: { id: '1', track: 499, arrivalTime: 0 },
    }

    const movement = algo.nextMovement(state)
    expect(movement.targetTrack).toBe(499)
  })

  it('should return null if queue is empty', () => {
    const state: SimulationState = {
      algorithm: 'SCAN',
      diskSize: 500,
      trackSeekTime: 0.1,
      platterRPM: 7200,
      headPosition: 250,
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
    expect(algo.getName()).toBe('SCAN')
    expect(algo.getDescription()).toContain('Elevator')
  })
})
