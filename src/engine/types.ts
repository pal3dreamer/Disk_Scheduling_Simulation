export type Algorithm = 'FCFS' | 'SSTF' | 'SCAN' | 'C-SCAN' | 'LOOK' | 'C-LOOK' | 'FSCAN' | 'Deadline'
export type EventType = 
  | 'HEAD_MOVED'
  | 'PLATTER_ROTATED'
  | 'REQUEST_QUEUED'
  | 'REQUEST_STARTED'
  | 'REQUEST_COMPLETED'
  | 'ALGORITHM_CHANGED'
  | 'STEP_COMPLETE'

export interface SimulationState {
  // Configuration
  algorithm: Algorithm
  diskSize: number
  trackSeekTime: number
  platterRPM: number

  // Disk state
  headPosition: number
  headDirection: 1 | -1
  platterAngle: number

  // Queues
  requestQueue: Request[]
  activeRequest?: Request
  completedRequests: Request[]

  // Time tracking
  currentTime: number
  stepCount: number
}

export interface Request {
  id: string
  track: number
  arrivalTime: number
  startTime?: number
  completionTime?: number
  seekTime?: number
  rotationalLatency?: number
  totalServiceTime?: number
}

export interface SimulationEvent {
  type: EventType
  payload: Record<string, any>
  duration: number
  timestamp: number
}

export interface DiskAlgorithm {
  selectNext(queue: Request[], state: SimulationState): Request | null
  nextMovement(state: SimulationState): { targetTrack: number; reason: string }
  getName(): string
  getDescription(): string
  reset?(): void
}
