import type { DiskAlgorithm, SimulationState, Request } from '@/engine/types'

export class SCANAlgorithm implements DiskAlgorithm {
  selectNext(queue: Request[], state: SimulationState): Request | null {
    if (queue.length === 0) return null

    const requestsInDirection = queue.filter(req => {
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

    // No requests in current direction; reverse
    if (state.headDirection === 1) {
      return queue.reduce((farthest, current) =>
        current.track < farthest.track ? current : farthest
      )
    } else {
      return queue.reduce((farthest, current) =>
        current.track > farthest.track ? current : farthest
      )
    }
  }

  nextMovement(state: SimulationState): { targetTrack: number; reason: string } {
    if (state.activeRequest) {
      return {
        targetTrack: state.activeRequest.track,
        reason: 'moving_in_scan_direction',
      }
    }

    // Move to end in current direction
    const targetTrack = state.headDirection === 1 ? state.diskSize - 1 : 0
    return {
      targetTrack,
      reason: 'scanning_to_end',
    }
  }

  getName(): string {
    return 'SCAN'
  }

  getDescription(): string {
    return 'SCAN (Elevator) - moves in one direction servicing requests, reverses at end. Reduces starvation.'
  }
}
