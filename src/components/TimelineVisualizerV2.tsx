import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useSimulation } from './SimulationProvider';
import { algorithmColors } from '@/utils/canvasColors';
import type { Algorithm } from '@/engine/types';

export const TimelineVisualizerV2: React.FC = () => {
  const { state, engine } = useSimulation();
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  // Visual constants
  const rowHeight = 35;
  const pixelsPerStep = 50;
  const startX = 100;
  const startY = 60;
  const totalHeight = Math.max(400, (state.diskSize + 2) * rowHeight);

  const algoColor = algorithmColors[state.algorithm];

  // Build timeline data
  const timelineData = useMemo(() => {
    const maxStep = Math.max(state.stepCount + 20, 50);

    return {
      maxStep,
      endX: startX + maxStep * pixelsPerStep,
      requests: [
        ...state.completedRequests.map(r => ({ ...r, status: 'completed' as const })),
        ...state.requestQueue.map(r => ({ ...r, status: 'pending' as const })),
        ...(state.activeRequest ? [{ ...state.activeRequest, status: 'active' as const }] : []),
      ],
    };
  }, [state.stepCount, state.completedRequests, state.requestQueue, state.activeRequest, state.diskSize]);

  // Auto-load demo scenario on mount (only once)
  useEffect(() => {
    if (!loadedRef.current && state.completedRequests.length === 0 && state.requestQueue.length === 0 && state.activeRequest === null) {
      loadedRef.current = true;
      // Load preset scenario: Small Workload
      engine.queueRequest({ id: '1', track: 2, arrivalTime: 0 });
      engine.queueRequest({ id: '2', track: 8, arrivalTime: 0 });
      engine.queueRequest({ id: '3', track: 4, arrivalTime: 0 });
      engine.queueRequest({ id: '4', track: 9, arrivalTime: 0 });
    }
  }, []);

  // Auto-play animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      engine.step();
    }, Math.max(50, 200 / playbackSpeed)); // Adjust frame rate based on speed

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, engine]);

  // Auto-scroll to keep current step in view
  useEffect(() => {
    if (svgContainerRef.current) {
      const currentStepX = startX + state.stepCount * pixelsPerStep / 10;
      const containerWidth = svgContainerRef.current.clientWidth;
      const targetScroll = Math.max(0, currentStepX - containerWidth / 2);
      svgContainerRef.current.scrollLeft = targetScroll;
    }
  }, [state.stepCount]);

  const handleAlgorithmChange = (algo: Algorithm) => {
    engine.setAlgorithm(algo);
    // Reset simulation
    // Note: We'd need a reset method on the engine
    window.location.reload();
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-4">
        <h1 className="text-4xl font-bold text-white mb-2">Disk Scheduling Simulator</h1>
        <div className="flex items-center justify-between">
          <p className="text-slate-400">Algorithm: {state.algorithm} | Step: {state.stepCount}</p>
          
          {/* Algorithm Switcher */}
          <div className="flex gap-2">
            {(['FCFS', 'SSTF', 'SCAN', 'C-SCAN', 'LOOK', 'C-LOOK'] as Algorithm[]).map((algo) => (
              <button
                key={algo}
                onClick={() => handleAlgorithmChange(algo)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  state.algorithm === algo
                    ? 'bg-white/20 border border-white/30 text-white'
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                {algo}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="px-8 pb-4 flex gap-4 items-center">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-6 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all font-medium"
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all font-medium"
        >
          ⟲ Reset
        </button>

        <div className="flex items-center gap-2">
          <label className="text-slate-300 font-medium">Speed:</label>
          <input
            type="range"
            min="0.25"
            max="4"
            step="0.25"
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="w-32 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-slate-400 w-12">{playbackSpeed.toFixed(2)}x</span>
        </div>
      </div>

      {/* Main Timeline Container */}
      <div className="flex-1 px-8 pb-8 overflow-hidden">
        {/* Glassmorphic Container */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl h-full flex flex-col">
          {/* Scrollable SVG Container */}
          <div
            ref={svgContainerRef}
            className="flex-1 overflow-x-auto overflow-y-hidden border border-white/5 rounded-lg bg-slate-900/40"
          >
            <svg
              viewBox={`0 0 ${startX + timelineData.endX + 50} ${totalHeight}`}
              className="min-w-full h-full"
              preserveAspectRatio="none"
            >
              {/* Grid background */}
              <defs>
                <pattern id="gridh" x="0" y={rowHeight} width="100%" height={rowHeight} patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="100%" y2="0" stroke="rgba(148,163,184,0.1)" strokeWidth="1" />
                </pattern>
                <pattern id="gridv" x={pixelsPerStep} y="0" width={pixelsPerStep} height="100%" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="100%" stroke="rgba(148,163,184,0.08)" strokeWidth="1" />
                </pattern>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Background fills */}
              <rect x={startX} y={startY} width={timelineData.endX} height={totalHeight - startY} fill="url(#gridh)" />
              <rect x={startX} y={startY} width={timelineData.endX} height={totalHeight - startY} fill="url(#gridv)" />

              {/* Y-axis labels (track numbers) */}
              {Array.from({ length: state.diskSize + 1 }).map((_, i) => (
                <g key={`track-${i}`}>
                  <text
                    x={startX - 10}
                    y={startY + i * rowHeight + rowHeight / 2}
                    textAnchor="end"
                    fontSize="12"
                    fill="rgba(226,232,240,0.6)"
                    dominantBaseline="middle"
                  >
                    {i}
                  </text>
                </g>
              ))}

              {/* X-axis labels (steps) */}
              {Array.from({ length: Math.ceil(timelineData.maxStep / 10) + 1 }).map((_, i) => {
                const step = i * 10;
                const x = startX + step * pixelsPerStep;
                return (
                  <g key={`step-${step}`}>
                    <text
                      x={x}
                      y={startY - 10}
                      textAnchor="middle"
                      fontSize="11"
                      fill="rgba(226,232,240,0.5)"
                    >
                      {step}
                    </text>
                  </g>
                );
              })}

              {/* Request Markers */}
              {/* Completed requests (very faded) */}
              {timelineData.requests
                .filter(r => r.status === 'completed')
                .map((req, idx) => (
                  <circle
                    key={`completed-${idx}`}
                    cx={startX + Math.max(10, (req.arrivalTime || 0) * pixelsPerStep)}
                    cy={startY + req.track * rowHeight + rowHeight / 2}
                    r="4"
                    fill={algoColor}
                    opacity="0.2"
                    className="transition-opacity"
                  />
                ))}

              {/* Pending requests (semi-transparent) */}
              {timelineData.requests
                .filter(r => r.status === 'pending')
                .map((req, idx) => (
                  <circle
                    key={`pending-${idx}`}
                    cx={startX + Math.max(10, (req.arrivalTime || 0) * pixelsPerStep)}
                    cy={startY + req.track * rowHeight + rowHeight / 2}
                    r="5"
                    fill={algoColor}
                    opacity="0.6"
                    className="transition-opacity"
                  />
                ))}

              {/* Active request (bright with glow) */}
              {state.activeRequest && (
                <g filter="url(#glow)">
                  <circle
                    cx={startX + Math.max(10, (state.activeRequest.arrivalTime || 0) * pixelsPerStep)}
                    cy={startY + state.activeRequest.track * rowHeight + rowHeight / 2}
                    r="8"
                    fill={algoColor}
                    opacity="0.3"
                  />
                  <circle
                    cx={startX + Math.max(10, (state.activeRequest.arrivalTime || 0) * pixelsPerStep)}
                    cy={startY + state.activeRequest.track * rowHeight + rowHeight / 2}
                    r="6"
                    fill={algoColor}
                    opacity="1"
                  />
                </g>
              )}

              {/* Head position line */}
              <line
                x1={startX + state.stepCount * pixelsPerStep}
                y1={startY}
                x2={startX + state.stepCount * pixelsPerStep}
                y2={totalHeight}
                stroke={algoColor}
                strokeWidth="3"
                opacity="0.7"
                strokeDasharray="5,5"
              />

              {/* Head position marker */}
              <circle
                cx={startX + state.stepCount * pixelsPerStep}
                cy={startY + state.headPosition * rowHeight + rowHeight / 2}
                r="8"
                fill={algoColor}
                stroke="white"
                strokeWidth="2"
                opacity="1"
              />

              {/* Head label */}
              <text
                x={startX + state.stepCount * pixelsPerStep}
                y={startY - 25}
                textAnchor="middle"
                fontSize="13"
                fontWeight="bold"
                fill={algoColor}
              >
                Head: {Math.round(state.headPosition)}
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-6 flex gap-6 justify-center text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: algoColor, opacity: 0.2 }}></div>
              <span className="text-slate-300">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full" style={{ backgroundColor: algoColor, opacity: 0.6 }}></div>
              <span className="text-slate-300">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: algoColor }}></div>
              <span className="text-slate-300">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8 pb-8 grid grid-cols-4 gap-4">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4 shadow-xl">
          <div className="text-slate-400 text-sm font-medium mb-1">Current Step</div>
          <div className="text-3xl font-bold text-white">{state.stepCount}</div>
        </div>
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4 shadow-xl">
          <div className="text-slate-400 text-sm font-medium mb-1">Head Position</div>
          <div className="text-3xl font-bold text-white">{Math.round(state.headPosition)}</div>
        </div>
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4 shadow-xl">
          <div className="text-slate-400 text-sm font-medium mb-1">Pending Requests</div>
          <div className="text-3xl font-bold text-white">{state.requestQueue.length}</div>
        </div>
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4 shadow-xl">
          <div className="text-slate-400 text-sm font-medium mb-1">Completed</div>
          <div className="text-3xl font-bold text-white">{state.completedRequests.length}</div>
        </div>
      </div>
    </div>
  );
};
