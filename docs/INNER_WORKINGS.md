# Inner Workings - Disk Scheduling Simulator

This document explains how the simulator works internally — the algorithms, event system, and engine logic. For UI/visualization details, see the main README.

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [The Event System](#the-event-system)
3. [Simulation Engine](#simulation-engine)
4. [Disk Scheduling Algorithms](#disk-scheduling-algorithms)
5. [Data Flow](#data-flow)
6. [Type Definitions](#type-definitions)

---

## Core Concepts

### Disk Model

The simulator models a simplified hard disk with:
- **Tracks**: Numbered 0 to `diskSize-1` (default: 500 tracks)
- **Head Position**: Current track where the read/write head is positioned
- **Head Direction**: Movement direction (+1 = increasing track, -1 = decreasing track)
- **Request Queue**: List of pending I/O requests waiting to be serviced

### I/O Request

Each request represents a disk I/O operation:

```typescript
interface Request {
  id: string           // Unique identifier
  track: number        // Target track number
  arrivalTime: number  // When request entered the queue
  startTime?: number   // When processing began
  completionTime?: number  // When processing finished
  seekTime?: number    // Time spent moving the head
  rotationalLatency?: number  // Time waiting for correct sector
  totalServiceTime?: number   // Total processing time
}
```

### Service Time Components

For each request, the simulator tracks:
1. **Seek Time**: Time to move the head from current track to target track
2. **Rotational Latency**: Time waiting for the correct sector to rotate under the head
3. **Total Service Time**: Sum of seek time and rotational latency

---

## The Event System

The simulator uses an **EventBus** for decoupled communication between components.

### EventBus Implementation

Located at `src/utils/eventBus.ts`:

```typescript
export class EventBus {
  private listeners: Map<EventType, Set<EventListener>> = new Map()

  on(eventType: EventType, listener: EventListener): Unsubscribe {
    // Register listener for event type
  }

  emit(event: SimulationEvent): void {
    // Notify all listeners of this event type
  }

  clear(): void {
    // Remove all listeners
  }
}
```

### Event Types

| Event | When Emitted |
|-------|--------------|
| `HEAD_MOVED` | Disk head moves to a new track |
| `PLATTER_ROTATED` | Platter angle changes |
| `REQUEST_QUEUED` | New request added to queue |
| `REQUEST_STARTED` | Request begins processing |
| `REQUEST_COMPLETED` | Request finished processing |
| `ALGORITHM_CHANGED` | User switched algorithms |
| `CONFIG_CHANGED` | Disk configuration changed |
| `STEP_COMPLETE` | A simulation step finished |

### Event Structure

```typescript
interface SimulationEvent {
  type: EventType
  payload: Record<string, any>  // Event-specific data
  duration: number              // Animation/operation duration
  timestamp: number             // When event occurred
}
```

### Usage Pattern

```typescript
// Subscribe to events
const unsubscribe = engine.onEvent('REQUEST_COMPLETED', (event) => {
  console.log('Request completed:', event.payload.request)
})

// Unsubscribe when done
unsubscribe()
```

---

## Simulation Engine

Located at `src/engine/SimulationEngine.ts`, the engine orchestrates the entire simulation.

### Initialization

```typescript
constructor(config: EngineConfig) {
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
```

### Key Methods

| Method | Purpose |
|--------|---------|
| `queueRequest(request)` | Add single request to queue |
| `addRequests(tracks[])` | Add multiple requests |
| `generateRandomRequests(count, maxTrack)` | Generate random workload |
| `step()` | Execute one simulation step |
| `reset()` | Reset to initial state |
| `setAlgorithm(algorithm)` | Change scheduling algorithm |
| `getState()` | Get current simulation state |

### The Step Method

This is the core simulation logic:

```typescript
async step(): Promise<void> {
  // 1. If no active request and queue has requests, select next
  if (!this.state.activeRequest && this.state.requestQueue.length > 0) {
    const algo = getAlgorithm(this.state.algorithm)
    const selected = algo.selectNext(this.state.requestQueue, this.state)
    
    if (selected) {
      this.state.activeRequest = selected
      this.state.requestQueue = this.state.requestQueue.filter(r => r.id !== selected.id)
      selected.startTime = this.state.currentTime
      this.emit({ type: 'REQUEST_STARTED', ... })
    }
  }

  // 2. If there's an active request, move head toward it
  if (this.state.activeRequest) {
    const targetTrack = this.state.activeRequest.track
    const direction = targetTrack > this.state.headPosition ? 1 : -1
    this.state.headDirection = direction
    
    const seekTime = calculateSeekTime(...)
    
    if (seekTime > 0) {
      // Move head one track
      this.state.headPosition += step * direction
      this.emit({ type: 'HEAD_MOVED', ... })
    } else {
      // At target: apply rotational latency and complete
      this.state.activeRequest.seekTime = 0
      this.state.activeRequest.rotationalLatency = calculateRotationalLatency(...)
      this.state.completedRequests.push(this.state.activeRequest)
      this.state.activeRequest = undefined
      this.emit({ type: 'REQUEST_COMPLETED', ... })
    }
  }
}
```

### Request Lifecycle

```
[User adds request]
       ↓
  REQUEST_QUEUED event emitted
       ↓
[Request sits in queue]
       ↓
[Algorithm selects request]
       ↓
  REQUEST_STARTED event emitted
       ↓
[Head moves track by track]
       ↓
  HEAD_MOVED events emitted (one per track)
       ↓
[Head reaches target]
       ↓
  Rotational latency applied
       ↓
  REQUEST_COMPLETED event emitted
```

---

## Disk Scheduling Algorithms

All algorithms implement the `DiskAlgorithm` interface:

```typescript
interface DiskAlgorithm {
  selectNext(queue: Request[], state: SimulationState): Request | null
  nextMovement(state: SimulationState): { targetTrack: number; reason: string }
  getName(): string
  getDescription(): string
  reset?(): void
}
```

### 1. FCFS (First Come First Served)

**File**: `src/engine/algorithms/fcfs.ts`

The simplest algorithm — processes requests in arrival order.

```typescript
selectNext(queue: Request[], _state: SimulationState): Request | null {
  return queue.length > 0 ? queue[0] : null
}
```

**Behavior**: 
- Always selects the oldest request in the queue
- No optimization whatsoever

**Pros**:
- Simple to understand and implement
- No starvation (every request eventually gets served)

**Cons**:
- High average seek time
- Poor performance on clustered workloads

### 2. SSTF (Shortest Seek Time First)

**File**: `src/engine/algorithms/sstf.ts`

Selects the request closest to the current head position.

```typescript
selectNext(queue: Request[], state: SimulationState): Request | null {
  if (queue.length === 0) return null
  
  let nearest = queue[0]
  let minDistance = Math.abs(queue[0].track - state.headPosition)
  
  for (const request of queue) {
    const distance = Math.abs(request.track - state.headPosition)
    if (distance < minDistance) {
      minDistance = distance
      nearest = request
    }
  }
  
  return nearest
}
```

**Behavior**:
- Calculates distance from head to each pending request
- Selects the one with minimum distance

**Pros**:
- Reduces total head movement vs FCFS
- Simple to understand

**Cons**:
- Can starve requests on distant tracks (starvation)
- Not uniform response times

### 3. SCAN (Elevator Algorithm)

**File**: `src/engine/algorithms/scan.ts`

Like an elevator — moves in one direction until the end, then reverses.

```typescript
selectNext(queue: Request[], state: SimulationState): Request | null {
  if (queue.length === 0) return null
  
  // Get all requests in current direction
  const sameDirection = queue.filter(r => 
    (state.headDirection === 1 && r.track >= state.headPosition) ||
    (state.headDirection === -1 && r.track <= state.headPosition)
  )
  
  if (sameDirection.length > 0) {
    // Select nearest in current direction
    return sameDirection.reduce((nearest, r) =>
      Math.abs(r.track - state.headPosition) < Math.abs(nearest.track - state.headPosition)
        ? r : nearest
    )
  }
  
  // No requests in direction — reverse
  state.headDirection = (state.headDirection * -1) as 1 | -1
  
  // Find nearest in new direction
  return queue.reduce((nearest, r) =>
    Math.abs(r.track - state.headPosition) < Math.abs(nearest.track - state.headPosition)
      ? r : nearest
  )
}
```

**Behavior**:
1. If requests exist in current direction, pick nearest
2. If no requests in direction, reverse and pick nearest

**Pros**:
- Prevents starvation (all requests get served)
- More uniform response times than SSTF

**Cons**:
- Periodic "tax" at endpoints
- Requests in the middle get served more frequently

### 4. C-SCAN (Circular SCAN)

**File**: `src/engine/algorithms/cscan.ts`

Moves in one direction only, then wraps back to the start.

```typescript
selectNext(queue: Request[], state: SimulationState): Request | null {
  if (queue.length === 0) return null
  
  // Get all requests in current direction
  const sameDirection = queue.filter(r =>
    (state.headDirection === 1 && r.track >= state.headPosition) ||
    (state.headDirection === -1 && r.track <= state.headPosition)
  )
  
  if (sameDirection.length > 0) {
    // Pick nearest in current direction
    return sameDirection.reduce((nearest, r) =>
      Math.abs(r.track - state.headPosition) < Math.abs(nearest.track - state.headPosition)
        ? r : nearest
    )
  }
  
  // Wrap to opposite end
  if (state.headDirection === 1) {
    state.headPosition = 0
  } else {
    state.headPosition = state.diskSize - 1
  }
  
  // Pick nearest from new position
  return queue.reduce((nearest, r) =>
    Math.abs(r.track - state.headPosition) < Math.abs(nearest.track - state.headPosition)
      ? r : nearest
  )
}
```

**Behavior**:
1. Service requests in one direction only
2. When no more requests, jump to opposite end
3. Continue servicing in same direction

**Pros**:
- Uniform service times
- Better for high-load systems

**Cons**:
- Longer average seek time than SCAN
- "Jump" takes time

### 5. LOOK

**File**: `src/engine/algorithms/look.ts`

Like SCAN but doesn't go to the end — stops at the last request.

```typescript
selectNext(queue: Request[], state: SimulationState): Request | null {
  if (queue.length === 0) return null
  
  // Like SCAN, but direction reverses at extreme requests
  // instead of at disk boundaries
}
```

**Behavior**: Same as SCAN, but the head only travels to the outermost requests, not the full disk edges.

**Pros**:
- Reduced unnecessary travel
- Better performance than SCAN

**Cons**:
- More complex to implement
- Slightly irregular service patterns

### 6. C-LOOK

**File**: `src/engine/algorithms/clook.ts`

Combines C-SCAN and LOOK — services in one direction, stops at last request.

```typescript
selectNext(queue: Request[], state: SimulationState): Request | null {
  if (queue.length === 0) return null
  
  // Like C-SCAN, but wraps to the lowest request instead of track 0
  // (if moving up) or highest request (if moving down)
}
```

**Behavior**:
1. Service requests in one direction
2. When no more requests, jump to the lowest/highest request
3. Continue in same direction

**Pros**:
- Best performance for random workloads
- No unnecessary end-of-disk travel

**Cons**:
- Most complex algorithm
- Jump distance depends on request distribution

### 7. FSCAN (Freeze SCAN)

**File**: `src/engine/algorithms/fscan.ts`

Freezes the queue when a new sweep begins.

```typescript
selectNext(queue: Request[], state: SimulationState): Request | null {
  // During a sweep, only service requests that existed at start of sweep
  // New requests go to a "new queue" and wait for next sweep
}
```

**Behavior**:
- When head reaches end and reverses, freeze current queue
- New requests go to a secondary queue
- Process secondary queue on next sweep

**Pros**:
- Excellent for heavy load scenarios
- New requests don't interfere with current sweep

**Cons**:
- New requests may wait longer
- Complex state management

### Algorithm Comparison

| Algorithm | Avg Seek | Starvation | Complexity | Best For |
|-----------|----------|------------|------------|----------|
| FCFS | High | No | O(1) | Teaching |
| SSTF | Low | Yes | O(n) | Optimization |
| SCAN | Medium | No | O(n) | General use |
| C-SCAN | Medium-High | No | O(n) | Uniform load |
| LOOK | Low-Medium | No | O(n) | Modern disks |
| C-LOOK | Low | No | O(n) | Random load |
| FSCAN | Variable | No | O(n) | Heavy load |

---

## Data Flow

### Adding Requests

```
User clicks "Add Request" or "Load Preset"
         ↓
  addRequests([tracks]) called
         ↓
  For each track:
    - Create Request object
    - Set arrivalTime = currentTime
    - Push to requestQueue
    - Emit REQUEST_QUEUED event
```

### Running Simulation

```
User clicks "Next Step" or "Play"
         ↓
  step() called
         ↓
  [If no active request]
    - Get algorithm from factory
    - Call selectNext() to choose request
    - Set as activeRequest
    - Remove from queue
    - Emit REQUEST_STARTED event
         ↓
  [If active request exists]
    - Calculate direction to target
    - Move head one track
    - Emit HEAD_MOVED event
         ↓
  [If head at target]
    - Calculate rotational latency
    - Complete request
    - Emit REQUEST_COMPLETED event
    - Clear activeRequest
         ↓
  Update platterAngle
  Emit PLATTER_ROTATED event
  Emit STEP_COMPLETE event
```

### Algorithm Selection

```
User selects algorithm from dropdown
         ↓
  setAlgorithm(newAlgorithm) called
         ↓
  State updated (algorithm field)
  Emit ALGORITHM_CHANGED event
         ↓
  Components react to event:
    - Update UI to show new algorithm
    - Future selectNext() calls use new algorithm
```

---

## Type Definitions

### SimulationState

```typescript
interface SimulationState {
  // Configuration
  algorithm: Algorithm           // Current scheduling algorithm
  diskSize: number              // Total tracks (0 to diskSize-1)
  trackSeekTime: number         // ms per track movement
  platterRPM: number            // Revolutions per minute

  // Disk state
  headPosition: number          // Current track (0 to diskSize-1)
  headDirection: 1 | -1         // Movement direction
  platterAngle: number           // Current rotation (0-360 degrees)

  // Queues
  requestQueue: Request[]       // Pending requests
  activeRequest?: Request        // Currently processing
  completedRequests: Request[]  // Finished requests

  // Time tracking
  currentTime: number           // Simulation time (ms)
  stepCount: number             // Total steps executed
}
```

### DiskAlgorithm Interface

```typescript
interface DiskAlgorithm {
  // Select next request from queue
  selectNext(queue: Request[], state: SimulationState): Request | null

  // Determine next head movement
  nextMovement(state: SimulationState): { 
    targetTrack: number
    reason: string 
  }

  getName(): string
  getDescription(): string
  reset?(): void
}
```

### Algorithm Factory

Located at `src/engine/algorithmFactory.ts`:

```typescript
import { FCFSAlgorithm } from './algorithms/fcfs'
import { SSTFAlgorithm } from './algorithms/sstf'
import { SCANAlgorithm } from './algorithms/scan'
import { CSCANAlgorithm } from './algorithms/cscan'
import { LOOKAlgorithm } from './algorithms/look'
import { CLOOKAlgorithm } from './algorithms/clook'
import { FSCANAlgorithm } from './algorithms/fscan'

export function getAlgorithm(name: Algorithm): DiskAlgorithm {
  switch (name) {
    case 'FCFS': return new FCFSAlgorithm()
    case 'SSTF': return new SSTFAlgorithm()
    case 'SCAN': return new SCANAlgorithm()
    case 'C-SCAN': return new CSCANAlgorithm()
    case 'LOOK': return new LOOKAlgorithm()
    case 'C-LOOK': return new CLOOKAlgorithm()
    case 'FSCAN': return new FSCANAlgorithm()
  }
}
```

---

## Extending the Simulator

### Adding a New Algorithm

1. Create file: `src/engine/algorithms/myAlgorithm.ts`

```typescript
import type { DiskAlgorithm, SimulationState, Request } from '@/engine/types'

export class MyAlgorithm implements DiskAlgorithm {
  selectNext(queue: Request[], state: SimulationState): Request | null {
    // Your algorithm logic here
  }

  nextMovement(state: SimulationState): { targetTrack: number; reason: string } {
    // Return next target and reason
  }

  getName(): string {
    return 'MY_ALGORITHM'
  }

  getDescription(): string {
    return 'Description of your algorithm'
  }
}
```

2. Register in `src/engine/algorithmFactory.ts`:

```typescript
import { MyAlgorithm } from './algorithms/myAlgorithm'

// Add to switch statement:
case 'MY_ALGORITHM': return new MyAlgorithm()
```

3. Add to `Algorithm` type in `src/engine/types.ts`:

```typescript
export type Algorithm = 'FCFS' | 'SSTF' | 'SCAN' | 'C-SCAN' | 'LOOK' | 'C-LOOK' | 'FSCAN' | 'MY_ALGORITHM'
```

4. Add tests in `tests/engine/algorithms/myAlgorithm.test.ts`

### Adding a New Event Type

1. Add to `EventType` in `src/engine/types.ts`:

```typescript
export type EventType = 
  | 'HEAD_MOVED'
  | // ... existing events
  | 'MY_NEW_EVENT'
```

2. Emit the event in `SimulationEngine.ts`:

```typescript
this.emit({
  type: 'MY_NEW_EVENT',
  payload: { /* your data */ },
  duration: 0,
  timestamp: this.state.currentTime,
})
```

3. Subscribe in components:

```typescript
engine.onEvent('MY_NEW_EVENT', (event) => {
  // Handle the event
})
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/engine/types.ts` | Core TypeScript interfaces |
| `src/engine/SimulationEngine.ts` | Main simulation logic |
| `src/engine/algorithmFactory.ts` | Algorithm instantiation |
| `src/utils/eventBus.ts` | Event pub/sub system |
| `src/utils/physics.ts` | Seek time calculations |
| `src/engine/algorithms/*.ts` | Individual algorithm implementations |
