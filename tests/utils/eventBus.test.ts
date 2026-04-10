import { describe, it, expect, vi } from 'vitest'
import { EventBus } from '@/utils/eventBus'
import type { SimulationEvent } from '@/engine/types'

describe('EventBus', () => {
  it('should emit and listen to events', () => {
    const bus = new EventBus()
    const listener = vi.fn()

    bus.on('HEAD_MOVED', listener)
    
    const event: SimulationEvent = {
      type: 'HEAD_MOVED',
      payload: { from: 0, to: 50 },
      duration: 5,
      timestamp: 0,
    }
    
    bus.emit(event)
    
    expect(listener).toHaveBeenCalledWith(event)
  })

  it('should support multiple listeners', () => {
    const bus = new EventBus()
    const listener1 = vi.fn()
    const listener2 = vi.fn()

    bus.on('REQUEST_COMPLETED', listener1)
    bus.on('REQUEST_COMPLETED', listener2)

    const event: SimulationEvent = {
      type: 'REQUEST_COMPLETED',
      payload: { requestId: '1' },
      duration: 0,
      timestamp: 10,
    }

    bus.emit(event)

    expect(listener1).toHaveBeenCalledWith(event)
    expect(listener2).toHaveBeenCalledWith(event)
  })

  it('should allow unsubscribe', () => {
    const bus = new EventBus()
    const listener = vi.fn()

    const unsubscribe = bus.on('HEAD_MOVED', listener)
    
    const event: SimulationEvent = {
      type: 'HEAD_MOVED',
      payload: {},
      duration: 0,
      timestamp: 0,
    }

    bus.emit(event)
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    bus.emit(event)
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
