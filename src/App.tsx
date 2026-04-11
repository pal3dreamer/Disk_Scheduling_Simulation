import { ErrorBoundary } from './components/ErrorBoundary'
import { SimulationProvider } from './components/SimulationProvider'
import { DiskScene } from './components/DiskScene'
import { ControlPanel } from './components/ControlPanel'
import { MetricsPanel } from './components/MetricsPanel'

/**
 * Main App Component
 * 
 * Wraps the entire application with:
 * - ErrorBoundary: Catches and displays React errors gracefully
 * - SimulationProvider: Provides simulation engine and state context
 * 
 * Layout:
 * - Left: 3D disk visualization (DiskScene)
 * - Right: Control panel and metrics
 */
export default function App() {
  return (
    <ErrorBoundary>
      <SimulationProvider>
        <div className="split-container">
          {/* 3D Canvas Viewport */}
          <div className="canvas-viewport">
            <DiskScene containerWidth={1280} containerHeight={720} />
          </div>

          {/* Control Panel & Metrics */}
          <div className="control-panel">
            <ControlPanel />
            <MetricsPanel />
          </div>
        </div>
      </SimulationProvider>
    </ErrorBoundary>
  )
}
