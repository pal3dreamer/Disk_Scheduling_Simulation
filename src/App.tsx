import { ErrorBoundary } from './components/ErrorBoundary'
import { SimulationProvider } from './components/SimulationProvider'
import { TimelineVisualizer } from './components/TimelineVisualizer'

/**
 * Main App Component
 * 
 * Wraps the entire application with:
 * - ErrorBoundary: Catches and displays React errors gracefully
 * - SimulationProvider: Provides simulation engine and state context
 * - TimelineVisualizer: Main horizontal-scrolling timeline visualization
 */
export default function App() {
  return (
    <ErrorBoundary>
      <SimulationProvider>
        <TimelineVisualizer />
      </SimulationProvider>
    </ErrorBoundary>
  )
}
