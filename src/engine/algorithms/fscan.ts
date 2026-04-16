import type { DiskAlgorithm, SimulationState, Request } from '@/engine/types'

export class FSCANAlgorithm implements DiskAlgorithm {
  private requestQueue: Request[] = []
  private scanning: boolean = false

  selectNext(queue: Request[], state: SimulationState): Request | null {
    if (queue.length === 0 && this.requestQueue.length === 0) return null

    // During scan, collect all incoming requests
    if (this.scanning) {
      this.requestQueue.push(...queue)
      queue.length = 0
    }

    const activeQueue = this.scanning ? this.requestQueue : queue

    if (activeQueue.length === 0) return null

    const requestsInDirection = activeQueue.filter(req => {
      if (state.headDirection === 1) {
        return req.track >= state.headPosition
      } else {
        return req.track <= state.headPosition
      }
    })

    if (requestsInDirection.length > 0) {
      if (state.headDirection === 1) {
        return requestsInDirection.reduce((closest, current) =>
          current.track < closest.track ? current : closest
        )
      } else {
        return requestsInDirection.reduce((closest, current) =>
          current.track > closest.track ? current : closest
        )
      }
    }

    // End of disk reached - stop scanning and queue requests for next pass
    this.scanning = false

    // Add any remaining requests to the main queue for the next scan
    if (activeQueue !== queue && activeQueue.length > 0) {
      queue.push(...activeQueue)
    }
    this.requestQueue = []

    if (queue.length === 0) return null;

    const newDirection = state.headDirection === 1 ? -1 : 1
    if (newDirection === 1) {
      return queue.reduce((closest, current) =>
        current.track < closest.track ? current : closest
      )
    } else {
      return queue.reduce((closest, current) =>
        current.track > closest.track ? current : closest
      )
    }
  }

  nextMovement(state: SimulationState): { targetTrack: number; reason: string } {
    if (state.activeRequest) {
      this.scanning = true
      return {
        targetTrack: state.activeRequest.track,
        reason: 'moving_in_fscan',
      }
    }

    // Move to end in current direction to start scan
    const targetTrack = state.headDirection === 1 ? state.diskSize - 1 : 0
    this.scanning = true
    return {
      targetTrack,
      reason: 'fscan_to_end',
    }
  }

  getName(): string {
    return 'FSCAN'
  }

  getDescription(): string {
    return 'FSCAN - freezes queue at request start, serves all requests in one direction before reversing.'
  }

  reset(): void {
    this.requestQueue = []
    this.scanning = false
  }
}