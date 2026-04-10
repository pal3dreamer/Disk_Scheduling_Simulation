// tests/engine/types.test.ts
import { describe, it, expect } from 'vitest'
import type { SimulationState, Request, SimulationEvent, Algorithm } from '@/engine/types'

describe('Type Definitions', () => {
  it('should create a valid SimulationState', () => {
    const state: SimulationState = {
      algorithm: 'FCFS',
      diskSize: 500,
      trackSeekTime: 0.1,
      platterRPM: 7200,
      headPosition: 0,
      headDirection: 1,
      platterAngle: 0,
      requestQueue: [],
      activeRequest: undefined,
      completedRequests: [],
      currentTime: 0,
      stepCount: 0,
    }
    expect(state.diskSize).toBe(500)
  })

  it('should create a valid Request', () => {
    const req: Request = {
      id: 'req-1',
      track: 100,
      arrivalTime: 0,
    }
    expect(req.track).toBe(100)
  })

  it('should create a SimulationEvent', () => {
    const evt: SimulationEvent = {
      type: 'HEAD_MOVED',
      payload: { from: 0, to: 50 },
      duration: 5,
      timestamp: 0,
    }
    expect(evt.type).toBe('HEAD_MOVED')
  })
})
