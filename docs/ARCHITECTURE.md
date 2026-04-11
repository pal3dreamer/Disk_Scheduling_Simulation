# Disk Scheduling Simulator Architecture

## Overview

The Disk Scheduling Simulator is a production-grade educational web application for visualizing and simulating disk I/O scheduling algorithms. Built with React 18, Three.js, and TypeScript, it provides real-time 3D visualization with step-by-step playback and comprehensive metrics.

**Technology Stack:**
- Frontend: React 18 + React Three Fiber
- 3D Engine: Three.js
- Type Safety: TypeScript
- Testing: Vitest + React Testing Library
- Styling: Tailwind CSS
- Build Tool: Vite

## Architecture Overview

### Event-Driven Architecture

The simulator uses an **event-driven pattern** where the SimulationEngine emits events that are consumed by independent listeners (Three.js renderer, React components, metrics tracker).

```
User Action (Click "Next Step")
    ↓
SimulationEngine calculates next state
    ↓
Engine emits event (HEAD_MOVED, PLATTER_ROTATED, etc.)
    ↓
EventBus distributes to all listeners
    ↓
Listeners update independently:
  - Three.js animations
  - React state updates
  - Metrics calculations
  - UI re-renders
    ↓
Next Step button re-enabled
```

### Event Types

| Event | Payload | Purpose |
|-------|---------|---------|
| `HEAD_MOVED` | `{ from, to, distance, duration }` | Disk arm moved to new track |
| `PLATTER_ROTATED` | `{ angle, duration }` | Disk platter rotated |
| `REQUEST_COMPLETED` | `{ request }` | I/O request completed |
| `REQUEST_QUEUED` | `{ request }` | New request added to queue |
| `REQUEST_STARTED` | `{ request }` | Request started processing |
| `ALGORITHM_CHANGED` | `{ algorithm }` | User switched algorithms |

## Component Hierarchy

```
App (main entry)
├── ErrorBoundary
│   └── SimulationProvider (provides engine, state, eventBus)
│       ├── DiskScene (Three.js Canvas)
│       │   ├── SceneContent
│       │   │   ├── DiskGeometry (platter, tracks, spindle)
│       │   │   └── DiskArmGeometry (mechanical arm, read head)
│       │   └── DiskSceneFallback (loading UI)
│       └── ControlPanel
│           ├── PlaybackControls (Next, Reset, Speed)
│           ├── AlgorithmSelector (dropdown with descriptions)
│           ├── DiskConfig (disk parameters)
│           └── PresetScenarios (load test cases)
│       └── MetricsPanel
│           ├── AggregateStats (total time, head moves, etc.)
│           ├── PerRequestMetrics (per-request breakdown)
│           └── QueueMonitor (queue visualization)
```

## Core Components

### 1. ErrorBoundary (`src/components/ErrorBoundary.tsx`)

**Purpose:** Catches React errors and displays graceful fallback UI

**Features:**
- Catches errors in child component tree
- Displays user-friendly error message
- Provides "Reload App" button for recovery
- Logs error details to console

**Usage:**
```tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 2. SimulationProvider (`src/components/SimulationProvider.tsx`)

**Purpose:** Context provider for simulation engine and state

**Exposes:**
- `engine`: SimulationEngine instance
- `state`: Current SimulationState
- `eventLog`: Array of all simulation events (for debugging)

**Usage:**
```tsx
const { engine, state, eventLog } = useSimulation()
```

### 3. DiskScene (`src/components/DiskScene.tsx`)

**Purpose:** Main Three.js visualization component

**Features:**
- Fixed 1280×720 internal resolution, scales to container
- Isometric 3/4 camera view
- Three-point lighting (ambient + directional)
- Linear fog for depth cueing
- Event subscription for animation coordination
- Loading fallback UI during initialization

**Camera Setup:**
- Position: (600, 800, 600) - isometric view
- Look At: (250, 0, 250) - platter center
- FOV: 45°
- Aspect: Dynamic based on container

### 4. ControlPanel (`src/components/ControlPanel.tsx`)

**Sections:**
1. **PlaybackControls** - Next Step, Reset, Speed adjustment
2. **AlgorithmSelector** - Dropdown with algorithm descriptions
3. **DiskConfig** - Editable disk parameters (RPM, seek time)
4. **PresetScenarios** - Load predefined test cases

### 5. MetricsPanel (`src/components/MetricsPanel.tsx`)

**Sections:**
1. **AggregateStats** - Total time, head moves, average wait time
2. **PerRequestMetrics** - Table with per-request breakdown
3. **QueueMonitor** - Current queue visualization

## Physics Model

### Seek Time Calculation

```
seekTime (ms) = trackDistance × trackSeekTime (ms/track)
Default: 10ms per track
```

### Rotational Latency

```
rotationalLatency (ms) = random(0, 60000 / diskRPM)
Default RPM: 7200
Maximum rotational latency: ~8.3ms
```

### Animation Easing

Head movements and platter rotations use physics-based easing:
- **Acceleration Phase** (0 → duration/2): quadratic ease-in
- **Deceleration Phase** (duration/2 → duration): quadratic ease-out

## Disk Scheduling Algorithms

All algorithms implemented in `src/engine/algorithms/`:

### 1. FCFS (First Come First Served)
- Simplest algorithm
- Processes requests in arrival order
- Issue: Can cause starvation if requests cluster on one side

### 2. SSTF (Shortest Seek Time First)
- Selects nearest pending request
- Minimizes seek time per step
- Issue: Can starve requests on outer tracks

### 3. SCAN (Elevator Algorithm)
- Moves in one direction until end, then reverses
- Prevents starvation
- Issue: Creates periodic delays at endpoints

### 4. C-SCAN (Circular SCAN)
- Moves in one direction and wraps to start
- More uniform wait times than SCAN
- Better suited for uniform request distribution

### 5. LOOK
- Like SCAN but stops at last request
- Avoids unnecessary end traversal
- Reduces seek time vs. pure SCAN

### 6. C-LOOK
- Combines C-SCAN and LOOK benefits
- Stops at last request in each direction
- Generally best performance for random workloads

## Testing Strategy

### Test Coverage (150+ tests)

| Category | Count | Focus |
|----------|-------|-------|
| Engine | 50+ | Algorithm correctness, state transitions |
| Components | 60+ | React rendering, user interactions |
| Integration | 20+ | E2E workflows, algorithm switching |
| Utils | 20+ | Animations, math utilities |

### Testing Patterns

**Unit Tests:**
- Algorithm correctness (input/output validation)
- Component rendering and interactions
- State calculations

**Integration Tests:**
- Complete workflow (load scenario → run steps → verify metrics)
- Algorithm switching with state reset
- Event emission and handling

**Test Infrastructure:**
```
vitest.config.ts          // Vitest configuration
tests/
├── components/           // Component tests with React Testing Library
├── engine/              // Engine and algorithm tests
├── integration/         // E2E workflow tests
├── data/               // Data validation tests
└── utils/              // Utility function tests
```

### Example: Algorithm Test

```typescript
describe('SSTF Algorithm', () => {
  it('selects shortest seek time request', () => {
    const algorithm = new SSTFAlgorithm()
    const queue = [
      { trackId: 100, arrivalTime: 0 },
      { trackId: 50, arrivalTime: 5 },
      { trackId: 150, arrivalTime: 10 },
    ]
    const currentTrack = 75
    
    const next = algorithm.selectNext(currentTrack, queue)
    
    // Should select track 50 (distance: 25) over 100 (distance: 25) or 150 (distance: 75)
    expect(next.trackId).toBe(50)
  })
})
```

## Error Handling

### Error Boundary
- Catches React component errors
- Displays user-friendly UI with reload option
- Logs full error details to console

### Engine Error Handling
- Validates input parameters before simulation
- Returns informative error messages
- Prevents invalid state transitions

### Component Error Handling
- Three.js scene initialization errors caught by boundary
- Event listener errors don't crash application
- Metric calculation errors logged without crashing

## Performance Optimizations

### Rendering
- React.memo on expensive components
- Canvas render target at fixed 1280×720 (GPU efficient)
- Three.js frustum culling enabled
- Defer geometry computation to setup phase

### State Management
- Minimal re-renders via context splitting
- Event-driven updates prevent unnecessary calculations
- Animation controller uses requestAnimationFrame

### Animation
- Physics-based easing (no heavy calculations)
- Cancellation support for interrupted animations
- GPU-accelerated transformations

## Development

### Running the Project

```bash
# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests in UI mode
npm test -- --ui

# Run tests with coverage
npm test -- --coverage
```

### Project Structure

```
src/
├── App.tsx                    # Main app component
├── main.tsx                   # Entry point
├── index.css                  # Global styles
├── components/                # React components
│   ├── ErrorBoundary.tsx
│   ├── SimulationProvider.tsx
│   ├── DiskScene.tsx
│   ├── ControlPanel.tsx
│   ├── MetricsPanel.tsx
│   ├── DiskGeometry.tsx       # Three.js disk rendering
│   ├── DiskArmGeometry.tsx    # Three.js arm rendering
│   └── ...
├── engine/                    # Simulation engine
│   ├── SimulationEngine.ts    # Main engine class
│   ├── algorithms/            # 6 scheduling algorithms
│   ├── types.ts               # TypeScript definitions
│   └── EventBus.ts            # Event publishing system
├── utils/                     # Utility functions
│   ├── animationController.ts # Animation physics
│   └── ...
├── types/                     # TypeScript type definitions
└── data/                      # Preset scenarios and data
```

## Debugging

### Browser DevTools

1. **React DevTools** - Inspect component tree and props
2. **Three.js DevTools** - Inspect scene graph
3. **Network Tab** - Check asset loading
4. **Console** - View error logs and engine events

### Simulation Debugging

```typescript
const { engine, state, eventLog } = useSimulation()

// Inspect current state
console.log(state)

// View all events that occurred
console.log(eventLog)

// Check engine configuration
console.log(engine.getConfig())
```

### Adding Debug Output

Enable event logging:
```typescript
// In any component
const { eventLog } = useSimulation()
console.table(eventLog)
```

## Future Enhancements

1. **Algorithm Comparison** - Run multiple algorithms simultaneously
2. **Custom Workload Generator** - Create arbitrary request patterns
3. **Export Metrics** - Save results as CSV/JSON
4. **Replay System** - Save and replay simulations
5. **Performance Profiling** - Detailed timing breakdowns
6. **Multi-Disk Support** - Simulate RAID-like configurations

## References

- React 18: https://react.dev
- Three.js: https://threejs.org
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber
- Vitest: https://vitest.dev
- Tailwind CSS: https://tailwindcss.com
