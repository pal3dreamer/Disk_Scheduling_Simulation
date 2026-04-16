# Disk Scheduling Simulator

An educational web application for understanding and comparing disk I/O scheduling algorithms. Visualize how different algorithms handle request queues, see their performance trade-offs, and learn operating systems concepts interactively.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## What It Does

The simulator models how operating systems schedule disk I/O requests. When programs need to read or write data, their requests go into a queue. The disk scheduler decides which request to service next — and the choice matters.

**Different algorithms produce different results:**

| Algorithm | Average Seek | Starvation | When to Use |
|-----------|-------------|------------|-------------|
| FCFS | High | None | Teaching basics |
| SSTF | Low | Yes | Simple optimization |
| SCAN | Medium | None | General purpose |
| C-SCAN | Medium-High | None | Uniform workloads |
| LOOK | Low-Medium | None | Modern systems |
| C-LOOK | Low | None | Random workloads |
| FSCAN | Variable | None | Heavy loads |

## Features

- **7 scheduling algorithms**: FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK, FSCAN
- **Step-by-step execution**: See each request processed one at a time
- **Real-time metrics**: Track seek time, wait time, turnaround, and throughput
- **Algorithm comparison**: Run all algorithms on the same workload and compare
- **Preset scenarios**: Test with heavy load, clustered, or random request distributions
- **Random workload generator**: Create custom test cases

## Usage

### 1. Choose an Algorithm

Select from the algorithm dropdown. Each algorithm description explains its behavior:

- **FCFS**: Processes requests in arrival order
- **SSTF**: Always picks the nearest request to the head
- **SCAN**: Moves like an elevator — one direction to the end, then reverses
- **C-SCAN**: Moves one direction only, then wraps back to the start
- **LOOK**: Like SCAN but stops at the last request instead of the end
- **C-LOOK**: Like C-SCAN but wraps to the last request
- **FSCAN**: Freezes the queue at the start of each sweep

### 2. Add Requests

Add requests in three ways:

- **Add individual requests**: Enter a track number to add a single request
- **Load a preset**: Choose from predefined scenarios
- **Random**: Generate a random workload of N requests

### 3. Run the Simulation

- **Next Step**: Process one request (or one track movement)
- **Play**: Auto-run at adjustable speed
- **Reset**: Clear all state and start over

### 4. Analyze Results

Watch the request queue, active request, and completed requests update in real-time. Compare metrics across algorithms:

- **Total Seek Time**: Sum of all head movements
- **Average Seek Time**: Mean distance per request
- **Average Wait Time**: Time from arrival to service start
- **Average Turnaround**: Time from arrival to completion
- **Throughput**: Requests completed per time unit

## The Algorithms Explained

### FCFS (First Come First Served)

The simplest approach — requests are processed in the order they arrive. No optimization, no starvation.

```
Queue: [45, 22, 67, 12, 34]
Head at: 50
Order: 50 → 45 → 22 → 67 → 12 → 34
```

### SSTF (Shortest Seek Time First)

Always picks the request closest to the current head position. Reduces total seek time, but can starve distant requests.

```
Queue: [45, 22, 67, 12, 34]
Head at: 50
From 50: nearest is 45 (distance 5)
From 45: nearest is 34 (distance 11)
From 34: nearest is 22 (distance 12)
...and so on
```

### SCAN (Elevator Algorithm)

The head moves in one direction, servicing all requests, until it reaches an end. Then it reverses. Prevents starvation.

```
Head at: 50, direction: up
Queue: [45, 22, 67, 12, 34]
Order: 50 → 67 → (end) → 45 → 34 → 22 → 12
```

### C-SCAN (Circular SCAN)

Like SCAN, but when it reaches an end, it jumps back to the start immediately and begins again. This provides more uniform wait times.

```
Head at: 50, direction: up
Queue: [45, 22, 67, 12, 34]
Order: 50 → 67 → (jump to 0) → 12 → 22 → 34 → 45
```

### LOOK

Like SCAN, but the head only travels to the outermost request, not the actual end of the disk. Avoids unnecessary travel.

### C-LOOK

Like C-SCAN, but jumps to the minimum/maximum request instead of the disk edge. Best for random workloads.

### FSCAN (Freeze SCAN)

When the head reverses direction, the current queue is "frozen." New requests go into a separate queue and wait for the next sweep. Excellent for heavy loads.

## Project Structure

```
src/
├── engine/
│   ├── SimulationEngine.ts    # Core simulation logic
│   ├── algorithmFactory.ts     # Creates algorithm instances
│   ├── types.ts                # TypeScript interfaces
│   └── algorithms/
│       ├── fcfs.ts             # First Come First Served
│       ├── sstf.ts             # Shortest Seek Time First
│       ├── scan.ts             # Elevator algorithm
│       ├── cscan.ts            # Circular SCAN
│       ├── look.ts             # LOOK algorithm
│       ├── clook.ts            # Circular LOOK
│       └── fscan.ts            # Freeze SCAN
├── utils/
│   ├── eventBus.ts             # Event pub/sub system
│   └── physics.ts              # Timing calculations
└── data/
    └── scenarioPresets.ts      # Test scenarios

tests/
├── engine/algorithms/          # Algorithm unit tests
├── integration/               # End-to-end tests
└── components/                # Component tests
```

## Architecture

The simulator uses an event-driven architecture:

```
User Action → SimulationEngine → EventBus → UI Components
```

When you click "Next Step":
1. Engine calculates the next state
2. Engine emits events (HEAD_MOVED, REQUEST_COMPLETED, etc.)
3. Components subscribe to events and update their state
4. UI re-renders with new data

This separation allows the simulation logic to be independent of how it's displayed.

See [docs/INNER_WORKINGS.md](docs/INNER_WORKINGS.md) for detailed documentation of the internal workings.

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Testing

The test suite covers:
- Algorithm correctness (output validation)
- Simulation engine state transitions
- Integration workflows
- Component rendering

## License

MIT
