import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useSimulation } from './SimulationProvider';
import { algorithmColors } from '@/utils/canvasColors';
import type { Algorithm } from '@/engine/types';

interface HeadTrailEntry {
  step: number;
  position: number;
}

export const TimelineVisualizerV2: React.FC = () => {
  const { state, engine } = useSimulation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [newRequestTrack, setNewRequestTrack] = useState('');
  const [diskSizeInput, setDiskSizeInput] = useState(state.diskSize.toString());
  const [headPositionInput, setHeadPositionInput] = useState(state.headPosition.toString());
  const [randomCount, setRandomCount] = useState('5');
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const headTrailRef = useRef<HeadTrailEntry[]>([]);
  const prevStepRef = useRef(0);
  const queuedRequestsRef = useRef<Array<{id: string, track: number}>>([]);
  const [algoResults, setAlgoResults] = useState<Record<string, {totalSeek: number, avgSeek: number, steps: number, completed: number}>>({}); // Store for replay

  // Visual constants - auto-scale based on data
  const allTracks = useMemo(() => [
    ...state.completedRequests.map(r => r.track),
    ...state.requestQueue.map(r => r.track),
    state.activeRequest?.track ?? -1,
    Math.ceil(state.headPosition),
  ], [state.completedRequests, state.requestQueue, state.activeRequest, state.headPosition]);
  
  const maxTrackInData = Math.max(...allTracks);
  const dynamicDiskSize = Math.max(state.diskSize, maxTrackInData + 5);
  
  const rowHeight = 28;
  const pixelsPerStep = 40;
  const startX = 80;
  const startY = 50;
  const totalHeight = Math.max(500, (dynamicDiskSize + 8) * rowHeight);

  const algoColor = algorithmColors[state.algorithm];

  // Compute metrics
  const metrics = useMemo(() => {
    let totalSeekDistance = 0;
    let prevTrack = 0;
    
    state.completedRequests.forEach((req) => {
      totalSeekDistance += Math.abs(req.track - prevTrack);
      prevTrack = req.track;
    });

    const avgSeekDistance = state.completedRequests.length > 0
      ? totalSeekDistance / state.completedRequests.length
      : 0;

    const avgTurnaround = state.completedRequests.length > 0
      ? state.completedRequests.reduce((sum, req) => {
          const turnaround = (req.completionTime || 0) - req.arrivalTime;
          return sum + turnaround;
        }, 0) / state.completedRequests.length
      : 0;

    const avgWaiting = state.completedRequests.length > 0
      ? state.completedRequests.reduce((sum, req) => {
          const waiting = (req.startTime || 0) - req.arrivalTime;
          return sum + waiting;
        }, 0) / state.completedRequests.length
      : 0;

    return {
      totalSeekDistance,
      avgSeekDistance: avgSeekDistance.toFixed(1),
      avgTurnaround: avgTurnaround.toFixed(1),
      avgWaiting: avgWaiting.toFixed(1),
      throughput: state.completedRequests.length > 0 && state.currentTime > 0
        ? (state.completedRequests.length / state.currentTime * 100).toFixed(2)
        : '0.00',
    };
  }, [state.completedRequests, state.currentTime]);

  // Algorithm explanation - why was this request chosen?
  const algorithmExplanation = useMemo(() => {
    if (!state.activeRequest) return null;
    
    const selectedTrack = state.activeRequest.track;
    const currentHead = state.headPosition;
    
    switch (state.algorithm) {
      case 'FCFS':
        return `FCFS selected track ${selectedTrack} because it arrived first (FIFO order)`;
      case 'SSTF':
        const distances = state.requestQueue.map(r => ({
          track: r.track,
          distance: Math.abs(r.track - currentHead)
        }));
        const minDist = Math.min(...distances.map(d => d.distance));
        return `SSTF selected track ${selectedTrack} (seek distance: ${minDist}) - nearest to head at ${currentHead}`;
      case 'SCAN':
      case 'LOOK':
        const direction = state.headDirection === 1 ? 'increasing' : 'decreasing';
        return `${state.algorithm} moving ${direction} - selected track ${selectedTrack} in current scan direction`;
      case 'C-SCAN':
      case 'C-LOOK':
        return `${state.algorithm} moving forward wrap - selected track ${selectedTrack}`;
      case 'FSCAN':
        return `FSCAN frozen queue - selected track ${selectedTrack} during scan`;
      case 'Deadline':
        return `Deadline - serving track ${selectedTrack} with earliest deadline`;
      default:
        return `Selected track ${selectedTrack}`;
    }
  }, [state.algorithm, state.activeRequest, state.requestQueue, state.headPosition, state.headDirection]);

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
  }, [state.stepCount, state.completedRequests, state.requestQueue, state.activeRequest, state.diskSize, startX, pixelsPerStep]);

  // Load preset handler - uses current algorithm, stores for replay
  const loadPreset = () => {
    engine.reset();
    engine.setAlgorithm(state.algorithm);
    queuedRequestsRef.current = [
      { id: '1', track: 2 },
      { id: '2', track: 8 },
      { id: '3', track: 4 },
      { id: '4', track: 9 },
    ];
    queuedRequestsRef.current.forEach(req => {
      engine.queueRequest({ ...req, arrivalTime: 0 });
    });
    setIsPlaying(true);
  };

  // Replay with same requests
  const replay = () => {
    engine.reset();
    engine.setAlgorithm(state.algorithm);
    headTrailRef.current = [];
    prevStepRef.current = 0;
    queuedRequestsRef.current.forEach(req => {
      engine.queueRequest({ ...req, arrivalTime: 0 });
    });
    setIsPlaying(true);
  };

  // Simple step loop - advance only when there's real work
  useEffect(() => {
    if (!isPlaying) return;
    
    const tick = () => {
      const s = engine.getState();
      
      // Completed - stop playing
      if (s.requestQueue.length === 0 && !s.activeRequest && s.completedRequests.length > 0) {
        setIsPlaying(false);
        return;
      }
      
      // Only step when there's work
      if (s.requestQueue.length > 0 || s.activeRequest) {
        engine.step();
      }
    };
    
    const interval = setInterval(tick, Math.max(50, 200 / playbackSpeed));
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, engine]);

  // Track head movement for trail
  useEffect(() => {
    if (state.stepCount > prevStepRef.current) {
      headTrailRef.current.push({
        step: state.stepCount,
        position: state.headPosition,
      });
      // Keep only last 50 positions for trail
      if (headTrailRef.current.length > 50) {
        headTrailRef.current = headTrailRef.current.slice(-50);
      }
      prevStepRef.current = state.stepCount;
    }
  }, [state.stepCount, state.headPosition]);

  // No auto-scroll during animation - let user scroll manually

  const resetSimulation = (algo: Algorithm = state.algorithm) => {
    engine.reset();
    engine.setAlgorithm(algo);
    
    // Clear head trail
    headTrailRef.current = [];
    prevStepRef.current = 0;
    
    // Do NOT auto-start - user will press Play manually
  };

  const handleAlgorithmChange = (algo: Algorithm) => {
    // Reset head trail and simulation when changing algorithm
    headTrailRef.current = [];
    prevStepRef.current = 0;
    engine.reset();
    engine.setAlgorithm(algo);
    // User must press Play to start
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col" style={{background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)'}}>
      {/* Header */}
      <div className="px-8 pt-8 pb-4">
        <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Disk Scheduling</h1>
          <p className="text-xs text-slate-500 font-medium">Visualize and compare disk I/O algorithms</p>
          <div className="flex items-center justify-between mt-2">
          <p className="text-slate-400">Algorithm: {state.algorithm} | Step: {state.stepCount}</p>
          
          {/* Algorithm Switcher */}
          <div className="flex gap-2">
            {(['FCFS', 'SSTF', 'SCAN', 'C-SCAN', 'LOOK', 'C-LOOK', 'FSCAN', 'Deadline'] as Algorithm[]).map((algo) => (
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
      <div className="px-8 pb-4 flex gap-4 items-center flex-wrap">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-6 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all font-medium"
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        
        <button
          onClick={() => resetSimulation()}
          className="px-6 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all font-medium"
        >
          ⟲ Reset
        </button>

        <button
          onClick={() => loadPreset()}
          className="px-6 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-300 hover:bg-amber-500/30 font-medium"
        >
          Load Preset
        </button>

        <button
          onClick={() => replay()}
          className="px-6 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 font-medium"
        >
          Replay
        </button>

        <button
          onClick={async () => {
            const algos: Algorithm[] = ['FCFS', 'SSTF', 'SCAN', 'C-SCAN', 'LOOK', 'C-LOOK', 'FSCAN', 'Deadline'];
            
            for (const algo of algos) {
              engine.reset();
              engine.setAlgorithm(algo);
              queuedRequestsRef.current.forEach(req => {
                engine.queueRequest({ ...req, arrivalTime: 0 });
              });
              
              // Run to completion
              while (true) {
                const s = engine.getState();
                if (s.requestQueue.length === 0 && !s.activeRequest && s.completedRequests.length > 0) break;
                if (s.requestQueue.length > 0 || s.activeRequest) {
                  engine.step();
                }
                await new Promise(r => setTimeout(r, 10));
              }
              
              // Save results
              const s = engine.getState();
              let totalSeek = 0;
              let prevTrack = 0;
              s.completedRequests.forEach(req => {
                totalSeek += Math.abs(req.track - prevTrack);
                prevTrack = req.track;
              });
              
              setAlgoResults(prev => ({
                ...prev,
                [algo]: {
                  totalSeek,
                  avgSeek: s.completedRequests.length > 0 ? totalSeek / s.completedRequests.length : 0,
                  steps: s.stepCount,
                  completed: s.completedRequests.length
                }
              }));
            }
          }}
          className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-300 hover:bg-cyan-500/30 font-medium text-sm"
        >
          Compare All
        </button>

        {/* Random Generator */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="50"
            value={randomCount}
            onChange={(e) => setRandomCount(e.target.value)}
            className="w-16 px-2 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm text-center"
            placeholder="N"
          />
          <button
            onClick={() => {
              engine.reset();
              engine.setAlgorithm(state.algorithm);
              const count = parseInt(randomCount) || 5;
              const tracks: Array<{id: string, track: number}> = [];
              for (let i = 0; i < count; i++) {
                const track = Math.floor(Math.random() * state.diskSize);
                tracks.push({ id: `req-${Date.now()}-${i}`, track });
              }
              queuedRequestsRef.current = tracks;
              tracks.forEach(req => {
                engine.queueRequest({ ...req, arrivalTime: 0 });
              });
              setIsPlaying(true);
            }}
            className="px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 hover:bg-emerald-500/30 text-sm"
          >
            Load Random
          </button>
        </div>

        {/* Add Single Request */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max={state.diskSize - 1}
            value={newRequestTrack}
            onChange={(e) => setNewRequestTrack(e.target.value)}
            className="w-20 px-2 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm text-center"
            placeholder="Track"
          />
          <button
            onClick={() => {
              const track = parseInt(newRequestTrack);
              if (!isNaN(track) && track >= 0 && track < state.diskSize) {
                engine.queueRequest({
                  id: `req-${Date.now()}`,
                  track,
                  arrivalTime: state.currentTime,
                });
                setNewRequestTrack('');
              }
            }}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:bg-white/10 text-sm"
          >
            +Add
          </button>
        </div>

        {/* Clear Queue */}
        <button
          onClick={() => engine.clearQueue()}
          className="px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 text-sm"
        >
          Clear
        </button>

        {/* Disk Settings */}
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-slate-400 text-sm">Disk:</label>
          <input
            type="number"
            min="10"
            max="500"
            value={diskSizeInput}
            onChange={(e) => setDiskSizeInput(e.target.value)}
            className="w-16 px-2 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm text-center"
          />
          <button
            onClick={() => {
              const size = parseInt(diskSizeInput);
              if (!isNaN(size) && size >= 10 && size <= 500) {
                engine.setDiskSize(size);
              }
            }}
            className="px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:bg-white/10 text-xs"
          >
            Set
          </button>
        </div>

        {/* Head Position */}
        <div className="flex items-center gap-2">
          <label className="text-slate-400 text-sm">Head:</label>
          <input
            type="number"
            min="0"
            max={state.diskSize - 1}
            value={headPositionInput}
            onChange={(e) => setHeadPositionInput(e.target.value)}
            className="w-16 px-2 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm text-center"
          />
          <button
            onClick={() => {
              const pos = parseInt(headPositionInput);
              if (!isNaN(pos) && pos >= 0 && pos < state.diskSize) {
                engine.setHeadPosition(pos);
              }
            }}
            className="px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:bg-white/10 text-xs"
          >
            Set
          </button>
        </div>

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

        {/* Request Queue Panel */}
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Queue:</span>
            <div className="flex flex-wrap gap-1 max-w-xs">
              {state.requestQueue.slice(0, 8).map((req) => (
                <span
                  key={req.id}
                  className={`px-2 py-1 rounded text-xs font-mono ${
                    state.activeRequest?.id === req.id
                      ? 'bg-white/30 text-white'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {req.track}
                </span>
              ))}
              {state.requestQueue.length > 8 && (
                <span className="text-slate-500 text-xs">+{state.requestQueue.length - 8}</span>
              )}
            </div>
          </div>

          {/* Algorithm Explanation */}
          {algorithmExplanation && (
            <div className="px-3 py-1 rounded-lg bg-slate-800/60 border border-white/10 text-xs text-slate-300 max-w-xs truncate" title={algorithmExplanation}>
              {algorithmExplanation}
            </div>
          )}

          {/* Direction indicator */}
          <div className={`px-2 py-1 rounded text-sm font-medium ${
            state.headDirection === 1 ? 'text-cyan-400' : 'text-orange-400'
          }`}>
            {state.headDirection === 1 ? '→' : '←'}
          </div>

          {/* Disk Range */}
          <div className="text-xs text-slate-500">
            [0 - {dynamicDiskSize}]
          </div>
        </div>
      </div>

      {/* Main Timeline Container */}
      <div className="flex-1 px-8 pb-8 overflow-hidden">
        {/* Enhanced Container - Graph Hero */}
        <div className="rounded-xl p-1 h-full flex flex-col" style={{
          background: 'linear-gradient(135deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.6) 100%)',
          boxShadow: '0 0 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(59,130,246,0.05)'
        }}>
          {/* Scrollable SVG Container */}
          <div
            ref={svgContainerRef}
            className="flex-1 overflow-scroll rounded-lg"
            style={{ background: 'rgba(2,6,23,0.6)' }}
          >
            <svg
              width={startX + timelineData.endX + 50}
              height={totalHeight}
              viewBox={`0 0 ${startX + timelineData.endX + 50} ${totalHeight}`}
              className="min-w-max"
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
                <filter id="trailGlow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Background fills */}
              <rect x={startX} y={startY} width={timelineData.endX} height={totalHeight - startY} fill="url(#gridh)" />
              <rect x={startX} y={startY} width={timelineData.endX} height={totalHeight - startY} fill="url(#gridv)" />

              {/* Y-axis labels (track numbers) */}
              {Array.from({ length: dynamicDiskSize + 1 }).map((_, i) => (
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

              {/* Disk boundaries */}
              <text
                x={startX + timelineData.endX + 20}
                y={startY + rowHeight / 2}
                fontSize="10"
                fill="#64748b"
              >
                0 (inner)
              </text>
              <text
                x={startX + timelineData.endX + 20}
                y={startY + dynamicDiskSize * rowHeight + rowHeight / 2}
                fontSize="10"
                fill="#64748b"
              >
                {dynamicDiskSize} (outer)
              </text>

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

              {/* Head trail - glowing path */}
              {headTrailRef.current.length > 1 && (
                <g filter="url(#trailGlow)" className="trail-glow-path" style={{opacity: 0.8}}>
                  <polyline
                    points={headTrailRef.current.map((entry) =>
                      `${startX + entry.step * pixelsPerStep},${startY + entry.position * rowHeight + rowHeight / 2}`
                    ).join(' ')}
                    fill="none"
                    stroke={algoColor}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
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

              {/* Head position - always visible, no pulse animation */}
              <g>
                <circle
                  cx={startX + state.stepCount * pixelsPerStep}
                  cy={startY + state.headPosition * rowHeight + rowHeight / 2}
                  r="12"
                  fill={algoColor}
                  opacity="0.3"
                />
                <circle
                  cx={startX + state.stepCount * pixelsPerStep}
                  cy={startY + state.headPosition * rowHeight + rowHeight / 2}
                  r="8"
                  fill={algoColor}
                  stroke="white"
                  strokeWidth="2"
                  opacity="1"
                />
              </g>

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

      {/* Completion Message */}
      {state.requestQueue.length === 0 && state.completedRequests.length > 0 && !isPlaying && (
        <div className="px-8 pb-4">
          <div className="backdrop-blur-md bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
            <span className="text-green-400 font-bold text-lg">All requests serviced!</span>
          </div>
        </div>
      )}

      {/* Stats Cards - Elevated */}
      <div className="px-8 pb-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 shadow-lg">
          <div className="text-slate-400 text-xs font-medium mb-1">Step</div>
          <div className="text-2xl font-bold text-white">{state.stepCount}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 shadow-lg">
          <div className="text-slate-400 text-xs font-medium mb-1">Head</div>
          <div className="text-2xl font-bold text-cyan-400">{Math.round(state.headPosition)}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 shadow-lg">
          <div className="text-slate-400 text-xs font-medium mb-1">Total Seek</div>
          <div className="text-2xl font-bold text-blue-400">{metrics.totalSeekDistance}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 shadow-lg">
          <div className="text-slate-400 text-xs font-medium mb-1">Avg Seek</div>
          <div className="text-2xl font-bold text-blue-300">{metrics.avgSeekDistance}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 shadow-lg">
          <div className="text-slate-400 text-xs font-medium mb-1">Turnaround</div>
          <div className="text-2xl font-bold text-emerald-400">{metrics.avgTurnaround}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 shadow-lg">
          <div className="text-slate-400 text-xs font-medium mb-1">Waiting</div>
          <div className="text-2xl font-bold text-amber-400">{metrics.avgWaiting}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 shadow-lg">
          <div className="text-slate-400 text-xs font-medium mb-1">Throughput</div>
          <div className="text-2xl font-bold text-green-400">{metrics.throughput}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 shadow-lg">
          <div className="text-slate-400 text-xs font-medium mb-1">Done</div>
          <div className="text-2xl font-bold text-slate-200">{state.completedRequests.length}</div>
        </div>
      </div>

      {/* Comparison Table */}
      {Object.keys(algoResults).length > 0 && (
        <div className="px-8 pb-8">
          <div className="rounded-xl p-4" style={{
            background: 'linear-gradient(135deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.6) 100%)',
            boxShadow: '0 0 40px rgba(0,0,0,0.5)'
          }}>
            <h3 className="text-lg font-bold text-white mb-3">Algorithm Comparison</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-2">Algorithm</th>
                  <th className="text-right py-2">Total Seek</th>
                  <th className="text-right py-2">Avg Seek</th>
                  <th className="text-right py-2">Steps</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(algoResults).sort((a, b) => a[1].totalSeek - b[1].totalSeek).map(([algo, result]) => (
                  <tr key={algo} className="border-b border-slate-800">
                    <td className="py-2 text-white font-medium">{algo}</td>
                    <td className="py-2 text-right text-blue-400">{result.totalSeek}</td>
                    <td className="py-2 text-right text-cyan-400">{result.avgSeek.toFixed(1)}</td>
                    <td className="py-2 text-right text-slate-300">{result.steps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
