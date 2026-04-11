# Disk Scheduling Simulator

A production-grade web application for visualizing and simulating disk I/O scheduling algorithms with real-time 3D visualization and step-by-step playback.

## Features

- **6 Disk Scheduling Algorithms**
  - FCFS (First Come First Served)
  - SSTF (Shortest Seek Time First)
  - SCAN (Elevator Algorithm)
  - C-SCAN (Circular SCAN)
  - LOOK (SCAN with lookahead)
  - C-LOOK (Circular LOOK)

- **Real-time 3D Disk Visualization**
  - Three.js-powered rendering
  - Isometric camera view
  - Animated disk arm and platter
  - Track visualization with live updates

- **Comprehensive Metrics**
  - Aggregate statistics (total time, head moves, average wait)
  - Per-request breakdown with timing details
  - Queue monitoring and visualization
  - Real-time updates as simulation progresses

- **Flexible Simulation Control**
  - Step-by-step playback for educational clarity
  - Adjustable disk parameters (RPM, seek time)
  - Preset scenarios (Heavy Load, Clustered, Random)
  - Speed control for animations

- **Responsive Design**
  - Supports desktop, tablet, and mobile
  - Fluid layout adapts to container size
  - Touch-friendly controls

- **Production Quality**
  - 150+ automated tests (all passing)
  - Error boundary for graceful error handling
  - Loading UI with feedback
  - TypeScript for type safety

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/disk-scheduling-simulator.git
cd disk-scheduling-simulator

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Testing

```bash
# Run all tests
npm test

# Run tests in UI mode with visualization
npm test -- --ui

# Run tests with coverage report
npm test -- --coverage

# Run specific test file
npm test -- SimulationProvider.test.tsx
```

**Test Coverage:** 150+ tests across:
- Engine algorithms (50+ tests)
- React components (60+ tests)
- Integration workflows (20+ tests)
- Utility functions (20+ tests)

## Documentation

### Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for comprehensive architecture documentation including:
- Event-driven pattern explanation
- Component hierarchy and responsibilities
- Physics model for disk operations
- Algorithm implementations
- Testing strategy
- Performance optimizations
- Debugging guide

### Project Structure

```
src/
├── App.tsx                    # Main app component
├── components/                # React components
│   ├── ErrorBoundary.tsx     # Error handling
│   ├── SimulationProvider.tsx # State provider
│   ├── DiskScene.tsx         # 3D visualization
│   ├── ControlPanel.tsx      # Controls & selectors
│   ├── MetricsPanel.tsx      # Metrics display
│   └── ...
├── engine/                    # Simulation engine
│   ├── SimulationEngine.ts    # Core engine
│   ├── algorithms/            # 6 scheduling algorithms
│   ├── types.ts              # Type definitions
│   └── EventBus.ts           # Event system
├── utils/                     # Utilities
└── types/                     # TypeScript types

tests/
├── components/               # Component tests
├── engine/                  # Engine tests
├── integration/             # E2E tests
└── data/                    # Data tests
```

## How to Use

### 1. Select an Algorithm

Click "Choose Algorithm" in the control panel and select from the 6 available algorithms. Each shows a description of how it works.

### 2. Configure Disk Parameters

Adjust disk parameters in the "Disk Configuration" section:
- **Platter RPM:** Affects rotational latency
- **Track Seek Time:** Time to move between adjacent tracks

### 3. Load a Preset Scenario

Choose from preset workload distributions:
- **Heavy Load:** Many requests, clustered distribution
- **Clustered:** Requests grouped near specific tracks
- **Random:** Uniformly distributed random requests

### 4. Run Simulation

Click "Next Step" to execute one step of the algorithm:
- Disk arm animates to next track
- Read/write operation occurs
- Metrics update in real-time

### 5. Analyze Results

Review metrics in the right panel:
- Total seek time and head moves
- Average wait and response times
- Per-request performance breakdown

## Algorithm Details

### FCFS (First Come First Served)
- **Behavior:** Processes requests in order of arrival
- **Pros:** Simple, no starvation of requests
- **Cons:** High seek time, poor average wait time
- **Best for:** Teaching basic concepts

### SSTF (Shortest Seek Time First)
- **Behavior:** Always selects nearest pending request
- **Pros:** Minimizes seek time per step
- **Cons:** Can starve outer tracks
- **Best for:** Understanding seek optimization

### SCAN (Elevator Algorithm)
- **Behavior:** Moves in one direction until end, then reverses
- **Pros:** Prevents starvation, uniform response times
- **Cons:** Extra latency at endpoints
- **Best for:** Production systems

### C-SCAN (Circular SCAN)
- **Behavior:** Moves one direction and wraps to start
- **Pros:** More uniform wait times than SCAN
- **Cons:** Slightly longer seek times
- **Best for:** High-load systems

### LOOK
- **Behavior:** Like SCAN but stops at last request
- **Pros:** Reduces unnecessary travel
- **Cons:** Requires lookahead information
- **Best for:** Modern disk controllers

### C-LOOK
- **Behavior:** Combines C-SCAN and LOOK
- **Pros:** Best performance for random workloads
- **Cons:** Most complex algorithm
- **Best for:** Advanced study

## Performance Metrics Explained

### Total Time
Sum of all seek times and rotational latencies for completing all requests.

### Head Moves
Total number of track movements made by the disk arm.

### Average Wait Time
Mean time from request arrival to start of processing.

### Average Response Time
Mean time from request arrival to completion.

### Average Turnaround Time
Mean time from request arrival to completion, including processing time.

## Error Handling

The application includes comprehensive error handling:

1. **Error Boundary** - Catches React component errors and displays graceful UI
2. **Engine Validation** - Validates input parameters before simulation
3. **Animation Recovery** - Automatically recovers from interrupted animations
4. **Console Logging** - Detailed error logging for debugging

If an error occurs:
1. Error message displays with details
2. "Reload App" button available to recover
3. Full error logged to browser console

## Development

### Code Style

- TypeScript for type safety
- ESLint + Prettier for consistent formatting
- TSC type checking enabled

### Testing

- Vitest for test running
- React Testing Library for component tests
- 150+ tests with >90% coverage

### Build System

- Vite for fast development and builds
- React 18 with concurrent features
- Production-optimized builds

## Browser Support

- Chrome 90+
- Firefox 87+
- Safari 14+
- Edge 90+

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass: `npm test`
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## References

- **Operating Systems Textbooks**
  - Operating System Concepts (Silberschatz, Galvin, Gagne)
  - Modern Operating Systems (Tanenbaum & Bos)

- **Technology Stack**
  - [React 18 Documentation](https://react.dev)
  - [Three.js Documentation](https://threejs.org)
  - [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
  - [Vitest](https://vitest.dev)
  - [Tailwind CSS](https://tailwindcss.com)

## FAQ

**Q: Why 3D visualization?**
A: 3D makes disk operations more intuitive - you can see arm movement, platter rotation, and track positions simultaneously.

**Q: Can I modify disk parameters during simulation?**
A: Yes, but changes take effect after pressing Reset or loading a new scenario.

**Q: Are the physics calculations realistic?**
A: The seek time model is realistic (linear based on track distance). Rotational latency uses realistic RPM values.

**Q: Which algorithm should I use?**
A: For learning, start with FCFS → SSTF → SCAN → C-SCAN → LOOK → C-LOOK. Each builds on concepts from previous.

**Q: Can I export results?**
A: Currently metrics are displayed in-app. Export feature planned for future release.

## Support

Found a bug or have a suggestion? Please open an issue on GitHub or contact the development team.

---

Built with ❤️ for computer science education
