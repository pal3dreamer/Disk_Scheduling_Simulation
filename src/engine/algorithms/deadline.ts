import type { DiskAlgorithm, SimulationState, Request } from '@/engine/types'

interface DeadlineRequest extends Request {
  deadline: number
}

export class DeadlineAlgorithm implements DiskAlgorithm {
  private readQueue: DeadlineRequest[] = []
  private writeQueue: DeadlineRequest[] = []
  private readonly defaultDeadline: number = 100

  selectNext(queue: Request[], state: SimulationState): Request | null {
    if (queue.length === 0 && this.readQueue.length === 0 && this.writeQueue.length === 0) {
      return null
    }

    // Add new requests to appropriate queue with deadlines
    if (queue.length > 0) {
      const newRequests = queue.splice(0)
      for (const req of newRequests) {
        const deadlineReq: DeadlineRequest = {
          ...req,
          deadline: req.arrivalTime + this.defaultDeadline,
        }
        // Separate read and write requests
        // For simplicity, assume even track numbers are reads, odd are writes
        if (req.track % 2 === 0) {
          this.readQueue.push(deadlineReq)
        } else {
          this.writeQueue.push(deadlineReq)
        }
      }
    }

    // First, try to find expired request in read queue
    const now = state.currentTime
    let expired = this.readQueue.find(r => r.deadline <= now)
    if (!expired) {
      expired = this.writeQueue.find(r => r.deadline <= now)
    }

    if (expired) {
      // Remove from queue
      this.readQueue = this.readQueue.filter(r => r.id !== expired!.id)
      this.writeQueue = this.writeQueue.filter(r => r.id !== expired!.id)
      return expired
    }

    // No expired requests - serve inFCFS order from read queue
    if (this.readQueue.length > 0) {
      const next = this.readQueue.shift()!
      return next
    }

    // Then serve write queue
    if (this.writeQueue.length > 0) {
      const next = this.writeQueue.shift()!
      return next
    }

    return null
  }

  nextMovement(state: SimulationState): { targetTrack: number; reason: string } {
    if (state.activeRequest) {
      return {
        targetTrack: state.activeRequest.track,
        reason: 'moving_to_deadline',
      }
    }

    return {
      targetTrack: state.headPosition,
      reason: 'idle',
    }
  }

  getName(): string {
    return 'Deadline'
  }

  getDescription(): string {
    return 'Deadline - serves expire requests first, thenFCFS. Guarantees max wait time.'
  }

  reset(): void {
    this.readQueue = []
    this.writeQueue = []
  }
}