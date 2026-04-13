# Timeline-Based Disk Scheduling Visualizer

**Date:** April 14, 2025  
**Status:** Design Approved  
**Scope:** Replace 3D DiskScene with gorgeous horizontal-scrolling timeline visualization

---

## Executive Summary

Replace the existing 3D disk visualization (`DiskScene.tsx`) with a modern, interactive **horizontal-scrolling timeline** that displays the complete execution history of disk scheduling algorithms. The visualization uses **glassmorphic design** (frosted glass aesthetic with blur effects) and auto-plays the simulation from start to finish, with playback controls for speed adjustment. A **floating metrics sidebar** provides detailed per-request statistics without cluttering the main view.

This change makes algorithm differences immediately visible—users can see how FCFS, SSTF, SCAN, and others handle the same workload differently by watching the patterns emerge in real-time.

---

## Vision & Goals

### Primary Goals
1. **Visual Clarity:** Make disk scheduling algorithm behavior obvious through animated visualization
2. **Educational Impact:** Differences between algorithms become immediately apparent through visual patterns
3. **Production Quality:** Glassmorphic design, smooth 60fps animations, responsive on all devices
4. **Automatic Playback:** Simulations run automatically without manual step-by-step interaction

### Success Criteria
- All 6 algorithms render correctly with color-coded request handling
- Horizontal scroll shows complete execution history without lag
- Auto-play runs smoothly at target 60fps
- Floating metrics sidebar toggles cleanly without affecting canvas
- Mobile-responsive with touch scroll support
- Users immediately understand algorithm differences visually

---

## Architecture

### System Overview

```
App.tsx
├── ErrorBoundary
└── SimulationProvider (existing context—unchanged)
    ├── TimelineVisualizer (NEW)
    │   ├── CanvasRenderer (Canvas + animation loop)
    │   ├── PlaybackControls (Play/Pause/Speed)
    │   └── ScrollContainer (horizontal scroll management)
    ├── ControlPanel (minimal changes—algorithm selector, presets)
    └── MetricsPanel (converts to floating sidebar—new behavior)
```

**Key Design Decision:** Keep `SimulationProvider` as single source of truth. The Canvas layer subscribes to simulation events and renders them. This preserves existing state management and testing infrastructure.

### Component Responsibilities

| Component | Responsibility | Status |
|-----------|---|---|
| `TimelineVisualizer` | Main wrapper, coordinates canvas & controls | NEW |
| `CanvasRenderer` | Low-level canvas drawing, animation loop | NEW |
| `PlaybackControls` | Play/Pause/Speed UI, state | NEW |
| `ScrollContainer` | Horizontal scroll handling with easing | NEW |
| `SimulationProvider` | State management (unchanged) | EXISTING |
| `ControlPanel` | Algorithm/preset selection (unchanged) | EXISTING |
| `MetricsPanel` | Floating sidebar with stats (refactored) | MODIFIED |
| `DiskScene.tsx` | Removed entirely | DELETED |

---

## Visual Design

### Timeline Structure

**Coordinate System:**
- **X-axis (horizontal):** Time progression, left-to-right
  - Each simulation step = fixed pixel width (e.g., 40px per step)
  - Canvas scrolls horizontally to show full history
- **Y-axis (vertical):** Disk tracks, top-to-bottom
  - Track 0 (outer) at top
  - Track N (inner/center) at bottom
  - Spacing: uniform with gridlines every 50px

**Visual Elements:**

1. **Background & Grid**
   - Dark glassmorphic background: `rgba(15, 23, 42, 0.8)` with `backdrop-filter: blur(8px)`
   - Subtle horizontal gridlines for tracks (opacity: 0.15)
   - Vertical time grid every 10 steps (opacity: 0.1)
   - Faded gradient at left/right edges for scroll peek effect

2. **Request Markers**
   - Colored dots at (track, arrival_time) position
   - Algorithm-specific colors:
     - FCFS: Blue (#3b82f6)
     - SSTF: Green (#10b981)
     - SCAN: Purple (#a855f7)
     - C-SCAN: Orange (#f97316)
     - LOOK: Cyan (#06b6d4)
     - C-LOOK: Pink (#ec4899)
   - Size: 8px radius, grows to 10px when active, shrinks when completed
   - Glow effect when pending/active

3. **Head Position Indicator**
   - Vertical line at current disk head position
   - Bright neon color (white or algorithm color with glow)
   - Width: 3px with shadow blur
   - Label showing current track number

4. **Movement Paths**
   - Smooth curved lines connecting head movements
   - Color matches algorithm
   - Opacity fades over time (completed movements are dimmer)
   - Animated stroke animation during active movement

5. **Completed Requests**
   - Fade to 50% opacity once processing completes
   - Retain on canvas for history visibility
   - Optional: X mark overlay after fade time

### Glassmorphism Styling

**Container:**
```css
background: rgba(15, 23, 42, 0.8);
backdrop-filter: blur(8px);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 12px;
```

**Floating Sidebar:**
```css
background: rgba(30, 41, 59, 0.85);
backdrop-filter: blur(12px);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
border: 1px solid rgba(255, 255, 255, 0.15);
```

**Playback Controls:**
```css
background: rgba(15, 23, 42, 0.9);
backdrop-filter: blur(6px);
border-radius: 8px;
padding: 12px 16px;
```

---

## Interaction Model

### Auto-Play Behavior

**Default State:**
- Simulation auto-starts when algorithm is selected
- Canvas animates continuously at selected speed
- Horizontal scroll follows the head position (keep head visible)

**Playback Controls:**

| Control | Function | Behavior |
|---------|----------|----------|
| Play/Pause | Toggle simulation | Pauses animation, preserves state |
| Speed Slider | 0.5x → 3x | Real-time speed adjustment |
| Step Indicator | Shows current step | e.g., "Step 47/150" |
| Reset Button | Restart simulation | Clears canvas, resets scroll |
| Algorithm Label | Display current algo | e.g., "FCFS - First Come First Serve" |

**Scroll Behavior:**
- Canvas auto-scrolls horizontally to keep head position visible (center-ish of viewport)
- User can manually scroll to inspect past execution history
- Smooth easing on auto-scroll (spring animation or cubic easing)
- Mobile: Touch drag to scroll, browser handles native scrolling

### Floating Metrics Sidebar

**Toggle Button:**
- Located top-right of canvas
- Icon: chevron left/right to indicate expand/collapse
- Always visible and clickable

**Sidebar Content (when visible):**

1. **Summary Stats (sticky header)**
   - Total execution time
   - Total head movements
   - Average wait time
   - Average response time
   - Algorithm description (1 sentence)

2. **Per-Request Table (scrollable body)**
   - Columns: ID, Arrival, Start, Completion, Wait Time
   - Color-coded rows (algorithm color)
   - Sortable by any column (optional)
   - Click row to highlight corresponding request on canvas (optional)

3. **Animation**
   - Slides in from right (smooth CSS transition)
   - Width: ~320px when visible, 0px when hidden
   - Backdrop blur remains on canvas behind sidebar

---

## Data Flow & State Management

### Simulation State (SimulationProvider)

The existing provider manages:
```typescript
interface SimulationState {
  algorithm: AlgorithmType;
  diskConfig: DiskConfig;
  requests: DiskRequest[];
  currentStep: number;
  isRunning: boolean;
  speed: number; // 0.5 to 3.0
  // ... existing metrics
}
```

### Canvas Event Subscription

TimelineVisualizer subscribes to simulation events:

```typescript
// Pseudo-code
useEffect(() => {
  const unsubscribe = simulationEngine.on('step', (event) => {
    // Queue new data for canvas rendering
    bufferNewStep(event);
    // Request animation frame for next render
    scheduleRender();
  });
  return unsubscribe;
}, [simulationEngine]);
```

### Rendering Pipeline

1. **Step event fires** → new request processed or head moved
2. **Data buffered** → canvas renderer queues the change
3. **requestAnimationFrame** → next frame render
4. **Canvas draws** → read buffer, render all visual elements
5. **Scroll** → auto-scroll canvas to keep head visible (if auto-play enabled)
6. **Sidebar updates** → metrics derived from simulation state (separate effect)

---

## Canvas Rendering Details

### Drawing Order (bottom to top)

1. Background & grid (static once, redraw only on resize)
2. Historical movement paths (faded)
3. Request markers (colored dots)
4. Current head position line (animated)
5. Overlay effects (glow, edge fading)

### Performance Optimizations

- **Dirty-rectangle rendering:** Only redraw canvas region that changed (if performance permits, start simple and optimize)
- **Buffering:** Maintain rolling buffer of last N steps (e.g., 500 steps, ~20KB)
- **Worker (future):** Offload rendering calculations to Web Worker if frame rate drops
- **Throttling:** Cap render frequency to 60fps even if events fire faster
- **Resize debouncing:** Debounce resize events by 150ms

### Responsive Sizing

```typescript
// On mount and resize
const canvas = canvasRef.current;
const container = canvas.parentElement;
canvas.width = container.clientWidth * devicePixelRatio;
canvas.height = container.clientHeight * devicePixelRatio;
ctx.scale(devicePixelRatio, devicePixelRatio); // Account for retina displays
```

---

## Algorithm-Specific Rendering

Each algorithm uses its color scheme but renders the same timeline structure:

| Algorithm | Color | Pattern |
|-----------|-------|---------|
| FCFS | Blue (#3b82f6) | Linear left-to-right, no seeking pattern |
| SSTF | Green (#10b981) | Chaotic seeking, clusters to nearest |
| SCAN | Purple (#a855f7) | Sweeping pattern, reverses at edges |
| C-SCAN | Orange (#f97316) | Sweeping one direction, wraps |
| LOOK | Cyan (#06b6d4) | Like SCAN but stops at last request |
| C-LOOK | Pink (#ec4899) | Like C-SCAN but with lookahead stops |

---

## Responsive Design

### Desktop (1024px+)
- Full canvas width, metrics sidebar always available
- Playback controls floating above canvas, right-aligned
- Smooth 60fps rendering

### Tablet (600px–1023px)
- Canvas fills viewport
- Metrics sidebar overlays canvas (semi-transparent)
- Playback controls compact (smaller buttons, horizontal layout)

### Mobile (< 600px)
- Canvas full-screen, rotated to landscape preferred
- Metrics sidebar collapses to minimal header
- Touch scroll native
- Playback controls compact, stacked if needed

---

## Testing Strategy

### Unit Tests
- **Canvas utility functions:** coordinate transforms, color generation, timing calculations
- **PlaybackControls:** speed changes, play/pause state transitions
- **MetricsPanel:** sidebar toggle, data formatting

### Integration Tests
- Canvas renders correctly with different algorithms
- Playback controls affect simulation speed
- Sidebar metrics stay in sync with canvas
- Scroll position tracks head movement

### Visual Regression Tests
- Screenshot each algorithm at step 50 (midway execution)
- Compare against baseline (run once, commit baseline)
- Alert on visual changes

---

## File Structure (New)

```
src/
├── components/
│   ├── TimelineVisualizer.tsx (NEW - main wrapper)
│   ├── CanvasRenderer.tsx (NEW - canvas & animation)
│   ├── PlaybackControls.tsx (NEW - controls UI)
│   ├── ScrollContainer.tsx (NEW - scroll logic)
│   ├── MetricsPanel.tsx (MODIFIED - now floating sidebar)
│   ├── ControlPanel.tsx (unchanged)
│   └── [DiskScene.tsx - DELETED]
├── utils/
│   ├── canvasRenderer/ (NEW)
│   │   ├── colors.ts (algorithm colors)
│   │   ├── drawing.ts (primitive drawing functions)
│   │   ├── layout.ts (coordinate calculations)
│   │   └── animations.ts (easing, scroll smoothing)
│   └── [animationController.ts - may be refactored]
└── [rest unchanged]
```

---

## Implementation Phases

### Phase 1: Canvas Foundation
- Create `CanvasRenderer.tsx` with basic grid & markers
- Render static timeline with dummy data
- Test responsive sizing

### Phase 2: Simulation Integration
- Connect to `SimulationProvider` events
- Render actual algorithm execution
- Implement auto-scroll following head position

### Phase 3: Playback & Controls
- Add `PlaybackControls` (speed, play/pause)
- Implement pause/resume logic
- Add speed multiplier

### Phase 4: Metrics Sidebar
- Convert `MetricsPanel` to floating sidebar
- Add toggle animation
- Sync with canvas data

### Phase 5: Polish & Performance
- Glassmorphism styling refinement
- Animation smoothing (easing functions)
- Performance optimization (if needed)
- Mobile responsiveness

---

## Success Metrics

✅ Canvas renders all 6 algorithms correctly  
✅ Horizontal scroll shows full 200+ step histories without lag  
✅ Auto-play maintains 60fps with smooth animations  
✅ Metrics sidebar toggles smoothly, no layout shift  
✅ Mobile scroll works intuitively  
✅ Visual differences between algorithms obvious at a glance  
✅ All existing tests pass (SimulationProvider behavior unchanged)  
✅ No TypeScript errors or console warnings  

---

## Appendix: Color Palette

```typescript
const algorithmColors = {
  FCFS: '#3b82f6',    // Blue
  SSTF: '#10b981',    // Green
  SCAN: '#a855f7',    // Purple
  C_SCAN: '#f97316',  // Orange
  LOOK: '#06b6d4',    // Cyan
  C_LOOK: '#ec4899',  // Pink
};

const uiColors = {
  background: 'rgba(15, 23, 42, 0.8)',
  gridLine: 'rgba(148, 163, 184, 0.1)',
  text: '#e2e8f0',
  accent: '#fbbf24', // Amber for highlights
};
```

---

## Appendix: Dependencies (Existing)

No new external dependencies required. Uses:
- React 18 (existing)
- TypeScript (existing)
- Tailwind CSS (existing, for sidebar styling)
- Canvas API (browser native)

---

