import type { SimulationEvent, EventType } from '@/engine/types'

type EventListener = (event: SimulationEvent) => void
type Unsubscribe = () => void

export class EventBus {
  private listeners: Map<EventType, Set<EventListener>> = new Map()

  on(eventType: EventType, listener: EventListener): Unsubscribe {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)!.add(listener)

    return () => {
      this.listeners.get(eventType)?.delete(listener)
    }
  }

  emit(event: SimulationEvent): void {
    const eventListeners = this.listeners.get(event.type)
    if (eventListeners) {
      eventListeners.forEach(listener => listener(event))
    }
  }

  clear(): void {
    this.listeners.clear()
  }
}
