import type { DiskAlgorithm, SimulationState, Request } from '@/engine/types'

export class FCFSAlgorithm implements DiskAlgorithm {
  selectNext(queue: Request[], _state: SimulationState): Request | null {
    return queue.length > 0 ? queue[0] : null
  }

  nextMovement(state: SimulationState): { targetTrack: number; reason: string } {
    if (state.activeRequest) {
      return {
        targetTrack: state.activeRequest.track,
        reason: 'moving_to_request',
      }
    }
    return {
      targetTrack: state.headPosition,
      reason: 'idle',
    }
  }

  getName(): string {
    return 'FCFS'
  }

  getDescription(): string {
    return 'First Come, First Served - processes requests in arrival order. Simplest but often inefficient.'
  }
}
