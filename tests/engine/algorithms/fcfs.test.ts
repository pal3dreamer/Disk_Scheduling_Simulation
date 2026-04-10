import { describe, it, expect } from 'vitest'
import { FCFSAlgorithm } from '@/engine/algorithms/fcfs'
import type { Request, SimulationState } from '@/engine/types'

describe('FCFS Algorithm', () => {
  const algo = new FCFSAlgorithm()

  it('should select first request in queue', () => {
    const state: SimulationState = {
      algorithm: 'FCFS',
      diskSize: 500,
      trackSeekTime: 0.1,
      platterRPM: 7200,
      headPosition: 0,
      headDirection: 1,
      platterAngle: 0,
      requestQueue: [],
      completedRequests: [],
      currentTime: 0,
      stepCount: 0,
    }

    const req1: Request = { id: '1', track: 100, arrivalTime: 0 }
    const req2: Request = { id: '2', track: 200, arrivalTime: 5 }
    const queue = [req1, req2]

    const selected = algo.selectNext(queue, state)
    expect(selected).toBe(req1)
  })

  it('should return null if queue is empty', () => {
    const state: SimulationState = {
      algorithm: 'FCFS',
      diskSize: 500,
      trackSeekTime: 0.1,
      platterRPM: 7200,
      headPosition: 0,
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

  it('should move head to selected request track', () => {
    const state: SimulationState = {
      algorithm: 'FCFS',
      diskSize: 500,
      trackSeekTime: 0.1,
      platterRPM: 7200,
      headPosition: 0,
      headDirection: 1,
      platterAngle: 0,
      requestQueue: [],
      completedRequests: [],
      currentTime: 0,
      stepCount: 0,
      activeRequest: { id: '1', track: 250, arrivalTime: 0 },
    }

    const movement = algo.nextMovement(state)
    expect(movement.reason).toBe('moving_to_request')
    expect(movement.targetTrack).toBe(250)
  })

  it('should have correct name and description', () => {
    expect(algo.getName()).toBe('FCFS')
    expect(algo.getDescription()).toContain('First Come')
  })
})
