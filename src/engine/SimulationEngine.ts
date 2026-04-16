import { EventBus } from '@/utils/eventBus'
import { getAlgorithm } from './algorithmFactory'
import { calculateSeekTime, calculateRotationalLatency } from '@/utils/physics'
import type { SimulationState, Request, SimulationEvent, EventType, Algorithm } from './types'

export interface EngineConfig {
  algorithm: Algorithm
  diskSize: number
  trackSeekTime: number
  platterRPM: number
}

export class SimulationEngine {
  private state: SimulationState
  private eventBus: EventBus = new EventBus()
  private config: EngineConfig

  constructor(config: EngineConfig) {
    this.config = config
    this.state = {
      algorithm: config.algorithm,
      diskSize: config.diskSize,
      trackSeekTime: config.trackSeekTime,
      platterRPM: config.platterRPM,
      headPosition: 0,
      headDirection: 1,
      platterAngle: 0,
      requestQueue: [],
      activeRequest: undefined,
      completedRequests: [],
      currentTime: 0,
      stepCount: 0,
    }
  }

  getState(): SimulationState {
    return { ...this.state }
  }

  getEventBus(): EventBus {
    return this.eventBus
  }

  queueRequest(request: Request): void {
    request.arrivalTime = this.state.currentTime
    this.state.requestQueue.push(request)
    this.emit({
      type: 'REQUEST_QUEUED',
      payload: { request },
      duration: 0,
      timestamp: this.state.currentTime,
    })
  }

  setAlgorithm(algorithm: Algorithm): void {
    this.state.algorithm = algorithm
    this.emit({
      type: 'ALGORITHM_CHANGED',
      payload: { algorithm },
      duration: 0,
      timestamp: this.state.currentTime,
    })
  }

  setDiskSize(size: number): void {
    this.state.diskSize = size
    if (this.state.headPosition >= size) {
      this.state.headPosition = 0
    }
    this.emit({
      type: 'CONFIG_CHANGED',
      payload: { diskSize: size },
      duration: 0,
      timestamp: this.state.currentTime,
    })
  }

  setHeadPosition(position: number): void {
    this.state.headPosition = Math.max(0, Math.min(position, this.state.diskSize - 1))
    this.emit({
      type: 'CONFIG_CHANGED',
      payload: { headPosition: this.state.headPosition },
      duration: 0,
      timestamp: this.state.currentTime,
    })
  }

  addRequests(tracks: number[]): void {
    tracks.forEach((track) => {
      this.queueRequest({
        id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        track: Math.max(0, Math.min(track, this.state.diskSize - 1)),
        arrivalTime: this.state.currentTime,
      })
    })
  }

  clearQueue(): void {
    this.state.requestQueue = []
    this.state.activeRequest = undefined
  }

  generateRandomRequests(count: number, maxTrack: number): void {
    for (let i = 0; i < count; i++) {
      const track = Math.floor(Math.random() * maxTrack)
      this.queueRequest({
        id: `req-${Date.now()}-${i}`,
        track,
        arrivalTime: this.state.currentTime,
      })
    }
  }

  async step(): Promise<void> {
    // Don't count steps when idle - this saves us from infinite X movement
    if (this.state.requestQueue.length === 0 && !this.state.activeRequest) {
      return
    }

    // If no active request and queue not empty, start new request
    if (!this.state.activeRequest && this.state.requestQueue.length > 0) {
      const algo = getAlgorithm(this.state.algorithm)
      const selected = algo.selectNext(this.state.requestQueue, this.state)

      if (selected) {
        this.state.activeRequest = selected
        this.state.requestQueue = this.state.requestQueue.filter(r => r.id !== selected.id)
        selected.startTime = this.state.currentTime

        this.emit({
          type: 'REQUEST_STARTED',
          payload: { request: selected },
          duration: 0,
          timestamp: this.state.currentTime,
        })
      }
    }

    // Move head toward active request
    if (this.state.activeRequest) {
      const targetTrack = this.state.activeRequest.track
      const direction = targetTrack > this.state.headPosition ? 1 : -1

      // Update direction when moving
      this.state.headDirection = direction as 1 | -1

      const seekTime = calculateSeekTime(
        this.state.headPosition,
        targetTrack,
        this.state.trackSeekTime
      )

      if (seekTime > 0) {
        // Head movement step
        const distance = Math.abs(targetTrack - this.state.headPosition)
        const step = Math.min(1, distance)
        this.state.headPosition += step * direction

        this.emit({
          type: 'HEAD_MOVED',
          payload: {
            from: this.state.headPosition - step * direction,
            to: this.state.headPosition,
            distance: step,
          },
          duration: this.state.trackSeekTime * step,
          timestamp: this.state.currentTime,
        })

        this.state.currentTime += this.state.trackSeekTime * step
      } else {
        // Head is at target, apply rotational latency
        const latency = calculateRotationalLatency(this.state.platterRPM)

        this.state.activeRequest.seekTime = seekTime
        this.state.activeRequest.rotationalLatency = latency
        this.state.activeRequest.totalServiceTime = seekTime + latency
        this.state.activeRequest.completionTime = this.state.currentTime + latency

        this.emit({
          type: 'REQUEST_COMPLETED',
          payload: { request: this.state.activeRequest },
          duration: latency,
          timestamp: this.state.currentTime,
        })

        this.state.completedRequests.push(this.state.activeRequest)
        this.state.currentTime += latency
        this.state.activeRequest = undefined
      }
    }

    // Update platter angle based on current time and RPM
    // 1 rotation = 360 degrees, time in seconds, RPM = rotations per minute
    const rotationsPerSecond = this.state.platterRPM / 60
    this.state.platterAngle = (this.state.currentTime * rotationsPerSecond * 360) % 360

    // Emit platter rotation event for animation
    this.emit({
      type: 'PLATTER_ROTATED',
      payload: { angle: this.state.platterAngle },
      duration: 0,
      timestamp: this.state.currentTime,
    })

    this.state.stepCount++

    this.emit({
      type: 'STEP_COMPLETE',
      payload: { stepCount: this.state.stepCount },
      duration: 0,
      timestamp: this.state.currentTime,
    })
  }

  reset(): void {
    this.state = {
      algorithm: this.config.algorithm,
      diskSize: this.config.diskSize,
      trackSeekTime: this.config.trackSeekTime,
      platterRPM: this.config.platterRPM,
      headPosition: 0,
      headDirection: 1,
      platterAngle: 0,
      requestQueue: [],
      activeRequest: undefined,
      completedRequests: [],
      currentTime: 0,
      stepCount: 0,
    }
  }

  onEvent(eventType: EventType, listener: (event: SimulationEvent) => void): () => void {
    return this.eventBus.on(eventType, listener)
  }

  private emit(event: SimulationEvent): void {
    this.eventBus.emit(event)
  }
}
