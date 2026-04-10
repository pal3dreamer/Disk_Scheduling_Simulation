import { describe, it, expect } from 'vitest'
import { SSTFAlgorithm } from '@/engine/algorithms/sstf'
import type { Request, SimulationState } from '@/engine/types'

describe('SSTF Algorithm', () => {
  const algo = new SSTFAlgorithm()

  it('should select closest request to head', () => {
    const state: SimulationState = {
      algorithm: 'SSTF',
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
    }

    const req1: Request = { id: '1', track: 150, arrivalTime: 0 }
    const req2: Request = { id: '2', track: 200, arrivalTime: 5 }
    const queue = [req1, req2]

    const selected = algo.selectNext(queue, state)
    expect(selected?.id).toBe('1') // Closest to head at 100
  })

  it('should handle negative distances', () => {
    const state: SimulationState = {
      algorithm: 'SSTF',
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
    }

    const req1: Request = { id: '1', track: 50, arrivalTime: 0 }
    const req2: Request = { id: '2', track: 200, arrivalTime: 5 }
    const queue = [req1, req2]

    const selected = algo.selectNext(queue, state)
    expect(selected?.id).toBe('1') // 50 is closer (distance 50 vs 100)
  })

  it('should return null if queue is empty', () => {
    const state: SimulationState = {
      algorithm: 'SSTF',
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
    }

    const selected = algo.selectNext([], state)
    expect(selected).toBeNull()
  })

  it('should have correct name and description', () => {
    expect(algo.getName()).toBe('SSTF')
    expect(algo.getDescription()).toContain('Shortest Seek')
  })
})
