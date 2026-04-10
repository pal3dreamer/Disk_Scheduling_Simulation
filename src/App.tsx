import { useEffect, useRef } from 'react'

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Canvas initialization will happen here
    console.log('App mounted')
  }, [])

  return (
    <div className="split-container">
      {/* 3D Canvas Viewport */}
      <div className="canvas-viewport">
        <canvas
          ref={canvasRef}
          id="canvas"
          className="w-full h-full"
        />
      </div>

      {/* Control Panel */}
      <div className="control-panel">
        <div className="panel-section">
          <div className="panel-header">Simulator Control</div>
          <div className="space-y-3">
            <button className="btn-industrial btn-industrial-primary w-full">
              Start Simulation
            </button>
            <button className="btn-industrial w-full">
              Pause
            </button>
            <button className="btn-industrial btn-industrial-danger w-full">
              Reset
            </button>
          </div>
        </div>

        <div className="panel-section">
          <div className="panel-header">Algorithm</div>
          <select className="input-industrial">
            <option>FCFS</option>
            <option>SSTF</option>
            <option>SCAN</option>
            <option>C-SCAN</option>
            <option>LOOK</option>
            <option>C-LOOK</option>
          </select>
        </div>

        <div className="panel-section">
          <div className="panel-header">Metrics</div>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Total Time</div>
              <div className="metric-value">0.0s</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Head Moves</div>
              <div className="metric-value">0</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Avg Wait</div>
              <div className="metric-value">0.0ms</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Queue Size</div>
              <div className="metric-value">0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
