import { describe, it, expect, vi } from 'vitest'
import { SimulationEngine } from '@/engine/SimulationEngine'
import type { Request } from '@/engine/types'

describe('SimulationEngine', () => {
  it('should initialize with correct state', () => {
    const engine = new SimulationEngine({
      algorithm: 'FCFS',
      diskSize: 500,
      trackSeekTime: 0.1,
      platterRPM: 7200,
    })

    expect(engine.getState().diskSize).toBe(500)
    expect(engine.getState().headPosition).toBe(0)
  })

  it('should queue a request', () => {
    const engine = new SimulationEngine({
      algorithm: 'FCFS',
      diskSize: 500,
      trackSeekTime: 0.1,
      platterRPM: 7200,
    })

    const req: Request = { id: '1', track: 100, arrivalTime: 0 }
    engine.queueRequest(req)

    expect(engine.getState().requestQueue).toHaveLength(1)
    expect(engine.getState().requestQueue[0].id).toBe('1')
  })

  it('should emit event on queue', () => {
    return new Promise<void>((resolve) => {
      const engine = new SimulationEngine({
        algorithm: 'FCFS',
        diskSize: 500,
        trackSeekTime: 0.1,
        platterRPM: 7200,
      })

      engine.onEvent('REQUEST_QUEUED', (event) => {
        expect(event.type).toBe('REQUEST_QUEUED')
        resolve()
      })

      const req: Request = { id: '1', track: 100, arrivalTime: 0 }
      engine.queueRequest(req)
    })
  })

  it('should allow algorithm switching', () => {
    const engine = new SimulationEngine({
      algorithm: 'FCFS',
      diskSize: 500,
      trackSeekTime: 0.1,
      platterRPM: 7200,
    })

    engine.setAlgorithm('SSTF')
    expect(engine.getState().algorithm).toBe('SSTF')
  })

  it('should reset simulation', () => {
    const engine = new SimulationEngine({
      algorithm: 'FCFS',
      diskSize: 500,
      trackSeekTime: 0.1,
      platterRPM: 7200,
    })

    const req: Request = { id: '1', track: 100, arrivalTime: 0 }
    engine.queueRequest(req)
    engine.reset()

    expect(engine.getState().requestQueue).toHaveLength(0)
    expect(engine.getState().completedRequests).toHaveLength(0)
    expect(engine.getState().headPosition).toBe(0)
  })
})
