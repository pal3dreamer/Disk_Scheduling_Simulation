import { ErrorBoundary } from './components/ErrorBoundary'
import { SimulationProvider } from './components/SimulationProvider'
import { TimelineVisualizerV2 } from './components/TimelineVisualizerV2'

/**
 * Main App Component
 * 
 * Wraps the entire application with:
 * - ErrorBoundary: Catches and displays React errors gracefully
 * - SimulationProvider: Provides simulation engine and state context
 * - TimelineVisualizerV2: SVG-based horizontal-scrolling timeline visualization
 */
export default function App() {
  return (
    <ErrorBoundary>
      <SimulationProvider>
        <TimelineVisualizerV2 />
      </SimulationProvider>
    </ErrorBoundary>
  )
}
