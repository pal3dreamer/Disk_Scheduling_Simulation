# Disk Scheduling Simulator — Design Specification

**Date:** 2026-04-11  
**Status:** Approved  
**Scope:** Full-stack React + Three.js simulator for OS disk scheduling algorithms

---

## 1. Project Overview

A premium, production-grade web application simulating disk I/O scheduling algorithms (FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK). Built for educational clarity and industrial aesthetics—not a student project.

### Core Features
- Real-time algorithm switching (pause, switch, continue)
- Discrete step-by-step playback (educational focus)
- Manual request queue building + preset scenarios
- Detailed per-request metrics + aggregate statistics
- 3D disk visualization with mechanical arm animation
- Industrial UI with skeuomorphic design

---

## 2. Architecture: Event-Driven System

### High-Level Flow

```
┌─────────────────────────────────────────────────┐
│             React App (Main)                     │
│  - Routes, layout, keyboard shortcuts            │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────────┐  ┌───────────────────┐
│  Event Bus       │  │ Simulation        │
│ (EventEmitter)   │  │ Engine            │
└─────────┬────────┘  └────────┬──────────┘
          ▲                    │
          │    (emits events)  │
          └────────────────────┘
          
   ┌──────────┬────────────┬─────────────┐
   │          │            │             │
   ▼          ▼            ▼             ▼
┌──────┐ ┌─────────┐ ┌─────────┐  ┌──────────┐
│Three │ │React    │ │Metrics  │  │ Queue    │
│.js   │ │Control  │ │Display  │  │ Monitor  │
│View  │ │Panel    │ │Panel    │  │          │
└──────┘ └─────────┘ └─────────┘  └──────────┘
```

### Event Bus Pattern

**Purpose:** Decouple simulation logic from UI consumers. All state changes propagate via events; listeners (Three.js, React, metrics) respond independently.

**Event Types:**
- `HEAD_MOVED` — arm moved N tracks (with duration)
- `PLATTER_ROTATED` — disk rotated M degrees
- `REQUEST_QUEUED` — new I/O request added to queue
- `REQUEST_STARTED` — head positioned, service begins
- `REQUEST_COMPLETED` — request finished, metrics logged
- `ALGORITHM_CHANGED` — user switched algorithms
- `STEP_COMPLETE` — discrete step finished, next available

**Pros:**
- Three.js can animate independently without blocking React renders
- Algorithm switching doesn't require full restart
- Easy to add new listeners (export, replay, analysis tools)
- Clear event history for debugging

---

## 3. Data Flow: Step-by-Step Playback

**User clicks "NEXT STEP":**

1. React calls `simulationEngine.step()`
2. Engine computes next event based on current algorithm and state
3. Engine emits event (e.g., `HEAD_MOVED`)
4. Event Bus distributes to listeners:
   - **Three.js Renderer:** Animates arm movement/platter rotation
   - **React Metrics:** Updates seek distance, current track, time elapsed
   - **React Queue:** Highlights request being serviced, grays out completed
   - **Event Logger:** Appends to debug log
5. Engine waits for animation promise (tracks 3D animation duration)
6. Engine emits `STEP_COMPLETE`
7. Next Step button becomes enabled

**Real-time Algorithm Switch:**
- User selects new algorithm in control panel
- Engine calls `setAlgorithm(newAlgo)`
- Engine reinitializes algorithm state (decision tree, direction flag) but **preserves** disk state (head position, completed requests, current time)
- Next step pulls from new algorithm's decision logic
- No queue loss, no data reset

**Discrete vs. Continuous:**
- Each step = one logical event (one head movement, one rotation tick, one request completion)
- No time-based interpolation; explicit sequential progression
- Users see exact algorithm decision at each choice point

---

## 4. Component Structure

```
src/
├── App.tsx                          # Main layout, routing
├── providers/
│   └── SimulationProvider.tsx       # Engine + event emitter context
├── components/
│   ├── DiskVisualization.tsx        # Three.js canvas wrapper
│   ├── ControlPanel.tsx             # Master control container
│   │   ├── AlgorithmSelector.tsx    # Dropdown + description
│   │   ├── DiskConfig.tsx           # Tracks, RPM, seek speed sliders
│   │   ├── PlaybackControls.tsx     # Next, Reset, Add Request buttons
│   │   └── ScenarioPresets.tsx      # Load preset workloads
│   ├── MetricsPanel.tsx             # Statistics container
│   │   ├── PerRequestMetrics.tsx    # Sortable table
│   │   └── AggregateStats.tsx       # Summary cards
│   ├── QueueMonitor.tsx             # Active + pending requests
│   └── EventLogger.tsx              # Debug: live event stream
├── engine/
│   ├── SimulationEngine.ts          # Core state machine
│   ├── algorithms/
│   │   ├── fcfs.ts
│   │   ├── sstf.ts
│   │   ├── scan.ts
│   │   ├── cscan.ts
│   │   ├── look.ts
│   │   └── clook.ts
│   └── types.ts                     # Shared interfaces
├── three/
│   ├── DiskScene.ts                 # Three.js scene setup
│   ├── DiskGeometry.ts              # Platter, spindle, tracks
│   ├── DiskArmGeometry.ts           # Mechanical arm
│   └── animations.ts                # Head movement tweens
├── utils/
│   ├── eventBus.ts                  # Event emitter wrapper
│   ├── physics.ts                   # Seek/rotation calculations
│   └── scenarios.ts                 # Preset workload data
└── styles/
    ├── globals.css                  # Tailwind + custom properties
    └── theme.css                    # Industrial color palette
```

---

## 5. Simulation Engine: Core Logic

### State Interface

```typescript
interface SimulationState {
  // Configuration
  algorithm: Algorithm
  diskSize: number          // total tracks (0 to diskSize-1)
  trackSeekTime: number     // milliseconds per track
  platterRPM: number        // rotations per minute
  
  // Disk state
  headPosition: number      // current track (0 to diskSize-1)
  headDirection: 1 | -1     // for SCAN/LOOK variants
  platterAngle: number      // degrees (0-360)
  
  // Queues
  requestQueue: Request[]   // waiting for service
  activeRequest?: Request   // currently being serviced
  completedRequests: Request[]
  
  // Time tracking
  currentTime: number       // milliseconds since start
  stepCount: number         // how many steps executed
}

interface Request {
  id: string
  track: number
  arrivalTime: number      // when queued
  startTime?: number        // when service began
  completionTime?: number   // when finished
  seekTime?: number         // computed
  rotationalLatency?: number
  totalServiceTime?: number
}

interface SimulationEvent {
  type: 'HEAD_MOVED' | 'PLATTER_ROTATED' | 'REQUEST_QUEUED' 
      | 'REQUEST_STARTED' | 'REQUEST_COMPLETED' | 'ALGORITHM_CHANGED' | 'STEP_COMPLETE'
  payload: Record<string, any>
  duration: number          // milliseconds for animation
  timestamp: number
}
```

### Step Logic

```typescript
function step(): Promise<void> {
  // 1. Determine next action based on algorithm
  if (state.activeRequest) {
    // Currently servicing: compute next movement
    const nextAction = algorithm.nextMovement(state)
  } else if (state.requestQueue.length > 0) {
    // Start new request
    const request = algorithm.selectNext(state.requestQueue, state)
    state.activeRequest = request
    emit('REQUEST_STARTED', { request, headPosition: state.headPosition })
  } else {
    // Idle
    emit('STEP_COMPLETE', { reason: 'idle' })
    return
  }
  
  // 2. Execute movement or service completion
  if (distanceRemaining === 0 && rotationDone) {
    // Request complete
    state.activeRequest.completionTime = state.currentTime
    emit('REQUEST_COMPLETED', { request: state.activeRequest })
    state.completedRequests.push(state.activeRequest)
    state.activeRequest = null
  } else {
    // Move head or rotate platter
    emit('HEAD_MOVED', { from, to, distance, duration })
    await animationPromise
  }
  
  // 3. Signal step complete
  emit('STEP_COMPLETE', { stepCount: state.stepCount++ })
}
```

### Algorithm Interface

Each algorithm (FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK) implements:

```typescript
interface DiskAlgorithm {
  selectNext(queue: Request[], state: SimulationState): Request
  nextMovement(state: SimulationState): { 
    targetTrack: number
    reason: string 
  }
  getName(): string
  getDescription(): string
}
```

---

## 6. Physics Simulation

### Seek Time Model

**Formula:** `seekTime = distance × trackSeekTime`

- Distance: `|headPosition - targetTrack|`
- trackSeekTime: default 0.1 ms per track (user-adjustable)
- Accounts for arm acceleration (simplified; not modeled explicitly)

### Rotational Latency

**Formula:** `latency = (360 / rotationsPerMinute) × randomDegree`

- Platter speed: 7200 RPM (default, adjustable)
- Full rotation time: 60,000 / 7200 ≈ 8.33 ms
- Latency: uniformly random 0 to full_rotation_time
- Discrete steps tick rotation by 1° increments (≈ 0.023 ms per degree at 7200 RPM)

### Service Time

**Formula:** `totalServiceTime = seekTime + rotationalLatency`

---

## 7. UI / UX Design

### Layout (Split Screen)

**LEFT (70%):** Three.js Disk Visualization
- 3/4 isometric view of platter + arm
- Platter rotates continuously (visual feedback)
- Arm moves smoothly to target track
- Head has amber LED indicator

**RIGHT (30%):** Control + Metrics Dashboard
- Algorithm selector (dropdown + description text)
- Disk config (sliders: tracks, RPM, seek speed)
- Playback: NEXT, RESET, ADD REQUEST buttons
- Scenario presets (buttons: Heavy Load, Random, etc.)
- Queue monitor (table: pending + active requests)
- Metrics panel (per-request table + aggregate cards)

### Visual Design (Industrial)

**Color Palette:**
| Element | Color | Usage |
|---------|-------|-------|
| Base Background | `#0a0e27` | Page, panels |
| Secondary | `#1a1f3a` | Cards, sections |
| Tertiary | `#2a2f4a` | Hover states |
| Primary Accent | `#d4af37` (amber) | Active, warnings, highlights |
| Success | `#10b981` (green) | Completed requests |
| Error | `#ef4444` (red) | Errors, conflicts |
| Text Primary | `#e5e7eb` | Headers, body |
| Text Secondary | `#9ca3af` | Labels, metadata |

**Typography:**
- **Headers:** IBM Plex Sans, 600 weight, `#e5e7eb`
- **Body:** Source Sans 3, 400 weight, `#9ca3af`
- **Monospace (metrics):** JetBrains Mono, 400 weight, `#d4af37`

**Component Details:**
- **Buttons:** Inset shadow (tactile press), no rounded corners (kept sharp/industrial), amber border on hover
- **Sliders:** Thick handle (20px), fine track (4px), amber thumb on active
- **Toggles:** Physical flip animation (90° rotation), 300ms duration
- **Cards:** Subtle top border (1px amber), drop shadow (0 4px 12px rgba(0,0,0,0.5))
- **Active states:** 1-2px amber glow (box-shadow), no neon

**Three.js Disk Aesthetics:**
- **Platter:** Brushed metal texture (procedural or subtle noise map), rim lighting (soft directional light from top-left)
- **Tracks:** Concentric circles with fine grooves (normal map detail, 0.1mm depth)
- **Spindle:** Cylindrical hub, metallic finish, rotation indicator groove
- **Arm:** Matte black steel, slight beveled edge
- **Head:** Amber LED (0.5cm sphere, glowing), retractable guide post
- **Camera:** Isometric 3/4 view, 60° yaw, 30° pitch, distance to keep platter in frame

---

## 8. Request Scenarios (Presets)

### Scenario 1: Heavy Load
- 20 requests, uniformly distributed across tracks
- Demonstrates algorithm efficiency under high I/O pressure

### Scenario 2: Clustered Access
- 15 requests clustered in tracks 20-40 (locality of reference)
- Shows SSTF/LOOK efficiency vs. SCAN

### Scenario 3: Edge Case
- Requests at track 0, 250, 500 (spread across disk)
- Stresses direction reversal in C-SCAN/LOOK

### Scenario 4: Random Worst Case
- 10 requests, randomly generated
- Reproducible seed for consistent comparison

### Scenario 5: Elevator Effect
- Requests arriving in rapid sequence to single track
- Demonstrates queue buildup and batching

---

## 9. Metrics & Analytics

### Per-Request Metrics (Table)
| Column | Definition |
|--------|-----------|
| ID | Request identifier |
| Track | Target cylinder |
| Arrival | When queued (time) |
| Start | When service began |
| Completion | When finished |
| Seek Time | Distance × trackSeekTime |
| Rotation | Random 0 to full rotation |
| Total Service | Seek + Rotation |
| Wait Time | (Start - Arrival) |
| Turnaround | (Completion - Arrival) |

### Aggregate Statistics (Cards)
- **Total Seek Distance:** Sum of all seek movements
- **Average Seek Time:** Total seek / request count
- **Average Wait Time:** (Sum of wait times) / request count
- **Average Turnaround:** (Sum of turnarounds) / request count
- **Throughput:** Requests completed / total simulation time
- **CPU Utilization:** (Service time) / (idle time) %

---

## 10. Implementation Roadmap

**Phase 1: Core Engine**
- SimulationEngine state machine
- All 6 algorithm implementations (pure logic)
- Event bus infrastructure

**Phase 2: React UI**
- Control panel (algorithm selector, config, buttons)
- Queue monitor
- Metrics panels (per-request + aggregate)

**Phase 3: Three.js Visualization**
- Platter geometry + materials
- Arm and head geometry
- Camera + lighting setup

**Phase 4: Animation & Polish**
- Head movement animations (easeInOut tweens)
- Platter rotation
- Micro-interactions (button press, toggle flip)
- Scenario presets

**Phase 5: Testing & Optimization**
- Unit tests for algorithms
- Performance profiling
- Visual refinement

---

## 11. Success Criteria

✅ All 6 algorithms implemented and testable  
✅ Real-time algorithm switching (no restart required)  
✅ Discrete step-by-step playback (not continuous)  
✅ Manual + preset request scenarios  
✅ 3D visualization with smooth animations  
✅ Industrial aesthetic (no AI-looking gradients)  
✅ Per-request + aggregate metrics accurate  
✅ Production-quality code (reusable, tested)  
✅ Handles 100+ requests without performance degradation  

---

## 12. Assumptions & Constraints

- **Simplified Physics:** Seek time is linear; acceleration/deceleration not explicitly modeled
- **Rotation Model:** Random latency; actual platter doesn't track command history
- **No Real Disk:** Purely simulation; no actual hardware access
- **Browser-based:** WebGL requirement for Three.js
- **Discrete Steps Only:** No real-time continuous playback (user must click Next manually)

---

## 13. Future Enhancements (Out of Scope)

- Export simulation trace to CSV
- Replay saved traces
- Batch compare algorithms across multiple scenarios
- Custom algorithm builder (user-defined heuristics)
- Network mode (multiple clients viewing same simulation)
