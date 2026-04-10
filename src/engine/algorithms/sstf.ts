import type { DiskAlgorithm, SimulationState, Request } from '@/engine/types'

export class SSTFAlgorithm implements DiskAlgorithm {
  selectNext(queue: Request[], state: SimulationState): Request | null {
    if (queue.length === 0) return null

    return queue.reduce((closest, current) => {
      const currentDistance = Math.abs(current.track - state.headPosition)
      const closestDistance = Math.abs(closest.track - state.headPosition)
      return currentDistance < closestDistance ? current : closest
    })
  }

  nextMovement(state: SimulationState): { targetTrack: number; reason: string } {
    if (state.activeRequest) {
      return {
        targetTrack: state.activeRequest.track,
        reason: 'moving_to_closest_request',
      }
    }
    return {
      targetTrack: state.headPosition,
      reason: 'idle',
    }
  }

  getName(): string {
    return 'SSTF'
  }

  getDescription(): string {
    return 'Shortest Seek Time First - selects nearest pending request. More efficient but can cause starvation.'
  }
}
