import type { DiskAlgorithm, SimulationState, Request } from '@/engine/types'

export class LOOKAlgorithm implements DiskAlgorithm {
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

    // Reverse direction and pick closest in new direction
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
      return {
        targetTrack: state.activeRequest.track,
        reason: 'moving_look',
      }
    }

    return {
      targetTrack: state.headDirection === 1 ? state.diskSize - 1 : 0,
      reason: 'look_to_end',
    }
  }

  getName(): string {
    return 'LOOK'
  }

  getDescription(): string {
    return 'LOOK - like SCAN but looks ahead to avoid unnecessary end traversal. More efficient than SCAN.'
  }
}
