import type { DiskAlgorithm, SimulationState, Request } from '@/engine/types'

export class CSCANAlgorithm implements DiskAlgorithm {
  selectNext(queue: Request[], state: SimulationState): Request | null {
    if (queue.length === 0) return null

    // C-SCAN only moves in one direction (always forward)
    const requestsAhead = queue.filter(req => req.track >= state.headPosition)

    if (requestsAhead.length > 0) {
      return requestsAhead.reduce((closest, current) =>
        current.track < closest.track ? current : closest
      )
    }

    // Wrap around to beginning
    return queue.reduce((closest, current) =>
      current.track > closest.track ? current : closest
    )
  }

  nextMovement(state: SimulationState): { targetTrack: number; reason: string } {
    if (state.activeRequest) {
      return {
        targetTrack: state.activeRequest.track,
        reason: 'moving_forward_cscan',
      }
    }

    return {
      targetTrack: state.diskSize - 1,
      reason: 'scanning_to_end',
    }
  }

  getName(): string {
    return 'C-SCAN'
  }

  getDescription(): string {
    return 'Circular SCAN - moves in one direction only, wraps to start. More uniform wait times than SCAN.'
  }
}
