import { describe, it, expect } from 'vitest'
import { LOOKAlgorithm } from '@/engine/algorithms/look'
import type { Request, SimulationState } from '@/engine/types'

describe('LOOK Algorithm', () => {
  const algo = new LOOKAlgorithm()

  it('should look ahead and move toward request in current direction', () => {
    const state: SimulationState = {
      algorithm: 'LOOK',
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
      activeRequest: { id: '1', track: 300, arrivalTime: 0 },
    }

    const movement = algo.nextMovement(state)
    expect(movement.targetTrack).toBe(300)
    expect(movement.reason).toBe('moving_look')
  })

  it('should select closest request in direction', () => {
    const state: SimulationState = {
      algorithm: 'LOOK',
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

    const req1: Request = { id: '1', track: 300, arrivalTime: 0 }
    const req2: Request = { id: '2', track: 100, arrivalTime: 5 }
    const queue = [req1, req2]

    const selected = algo.selectNext(queue, state)
    expect(selected?.id).toBe('1')
  })

  it('should return null if queue is empty', () => {
    const state: SimulationState = {
      algorithm: 'LOOK',
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
    expect(algo.getName()).toBe('LOOK')
    expect(algo.getDescription()).toContain('LOOK')
  })
})
