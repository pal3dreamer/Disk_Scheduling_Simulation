import type { DiskAlgorithm, SimulationState, Request } from '@/engine/types'

export class CLOOKAlgorithm implements DiskAlgorithm {
  selectNext(queue: Request[], state: SimulationState): Request | null {
    if (queue.length === 0) return null

    // C-LOOK only moves forward, looks ahead to avoid unnecessary wrap
    const requestsAhead = queue.filter(req => req.track >= state.headPosition)

    if (requestsAhead.length > 0) {
      return requestsAhead.reduce((closest, current) =>
        current.track < closest.track ? current : closest
      )
    }

    // No requests ahead, wrap to lowest track
    return queue.reduce((lowest, current) =>
      current.track < lowest.track ? current : lowest
    )
  }

  nextMovement(state: SimulationState): { targetTrack: number; reason: string } {
    if (state.activeRequest) {
      return {
        targetTrack: state.activeRequest.track,
        reason: 'moving_forward_clook',
      }
    }

    return {
      targetTrack: state.diskSize - 1,
      reason: 'clook_to_end',
    }
  }

  getName(): string {
    return 'C-LOOK'
  }

  getDescription(): string {
    return 'Circular LOOK - moves in one direction only, looks ahead to avoid unnecessary end traversal.'
  }
}
