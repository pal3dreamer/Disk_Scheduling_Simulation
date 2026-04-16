const fs = require('fs');

let content = fs.readFileSync('src/components/TimelineVisualizerV2.tsx', 'utf8');

// Global keyboard shortcuts
const keyboardEffect = `
  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (document.activeElement?.tagName === 'INPUT') return;

      switch (e.key) {
        case ' ':
          e.preventDefault(); // Prevent page scroll
          setIsPlaying(prev => !prev);
          break;
        case 'r':
        case 'R':
          resetSimulation();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setPlaybackSpeed(prev => Math.min(4, prev + 0.25));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setPlaybackSpeed(prev => Math.max(0.25, prev - 0.25));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetSimulation]);
`;

// Insert keyboard shortcuts before the resetSimulation definition
content = content.replace('const resetSimulation = (algo: Algorithm = state.algorithm) => {', keyboardEffect + '\n  const resetSimulation = (algo: Algorithm = state.algorithm) => {');

// We need to completely replace the Playback Controls block and the Stats Cards block
// Let's do this via regex or string splitting

const startControlsIndex = content.indexOf('{/* Playback Controls */}');
const endControlsIndex = content.indexOf('{/* Main Timeline Container */}');

if (startControlsIndex !== -1 && endControlsIndex !== -1) {
  const newControls = `{/* Grouped Controls Area */}
      <div className="px-8 pb-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Panel 1: Execution */}
        <div className="border border-slate-800 bg-slate-900/50 rounded-lg p-4 flex flex-col gap-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Playback</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md font-semibold transition-colors shadow-sm"
              title="Spacebar to toggle"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={() => resetSimulation()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md font-medium transition-colors"
              title="Press 'R' to reset"
            >
              Reset
            </button>
          </div>
          <div className="flex items-center justify-between gap-2 mt-1">
            <label className="text-slate-400 text-xs" title="Up/Down arrows to adjust">Speed:</label>
            <input
              type="range"
              min="0.25"
              max="4"
              step="0.25"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <span className="text-slate-400 text-xs w-8 text-right">{playbackSpeed.toFixed(2)}x</span>
          </div>
        </div>

        {/* Panel 2: Request Queue */}
        <div className="border border-slate-800 bg-slate-900/50 rounded-lg p-4 flex flex-col gap-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between">
            <span>Requests</span>
            <button
              onClick={() => engine.clearQueue()}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              Clear All
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max={state.diskSize - 1}
              value={newRequestTrack}
              onChange={(e) => setNewRequestTrack(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const track = parseInt(newRequestTrack);
                  if (!isNaN(track) && track >= 0 && track < state.diskSize) {
                    engine.queueRequest({
                      id: \`req-\${Date.now()}\`,
                      track,
                      arrivalTime: state.currentTime,
                    });
                    setNewRequestTrack('');
                  }
                }
              }}
              className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              placeholder="Track (Enter to add)"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="50"
              value={randomCount}
              onChange={(e) => setRandomCount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  engine.reset();
                  engine.setAlgorithm(state.algorithm);
                  const count = parseInt(randomCount) || 5;
                  const tracks: Array<{id: string, track: number}> = [];
                  for (let i = 0; i < count; i++) {
                    const track = Math.floor(Math.random() * state.diskSize);
                    tracks.push({ id: \`req-\${Date.now()}-\${i}\`, track });
                  }
                  queuedRequestsRef.current = tracks;
                  tracks.forEach(req => {
                    engine.queueRequest({ ...req, arrivalTime: 0 });
                  });
                  setIsPlaying(true);
                }
              }}
              className="w-16 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              placeholder="N"
              title="Number of random requests"
            />
            <button
              onClick={() => {
                engine.reset();
                engine.setAlgorithm(state.algorithm);
                const count = parseInt(randomCount) || 5;
                const tracks: Array<{id: string, track: number}> = [];
                for (let i = 0; i < count; i++) {
                  const track = Math.floor(Math.random() * state.diskSize);
                  tracks.push({ id: \`req-\${Date.now()}-\${i}\`, track });
                }
                queuedRequestsRef.current = tracks;
                tracks.forEach(req => {
                  engine.queueRequest({ ...req, arrivalTime: 0 });
                });
                setIsPlaying(true);
              }}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md text-sm transition-colors"
            >
              Random
            </button>
          </div>
        </div>

        {/* Panel 3: Environment */}
        <div className="border border-slate-800 bg-slate-900/50 rounded-lg p-4 flex flex-col gap-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Environment</div>
          
          <div className="flex items-center gap-3">
            <label className="text-slate-400 text-sm w-10">Disk:</label>
            <input
              type="number"
              min="10"
              max="500"
              value={diskSizeInput}
              onChange={(e) => setDiskSizeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const size = parseInt(diskSizeInput);
                  if (!isNaN(size) && size >= 10 && size <= 500) {
                    engine.setDiskSize(size);
                  }
                }
              }}
              className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              title="Press Enter to apply"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-slate-400 text-sm w-10">Head:</label>
            <input
              type="number"
              min="0"
              max={state.diskSize - 1}
              value={headPositionInput}
              onChange={(e) => setHeadPositionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const pos = parseInt(headPositionInput);
                  if (!isNaN(pos) && pos >= 0 && pos < state.diskSize) {
                    engine.setHeadPosition(pos);
                  }
                }
              }}
              className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              title="Press Enter to apply"
            />
          </div>
        </div>

        {/* Panel 4: Scenarios */}
        <div className="border border-slate-800 bg-slate-900/50 rounded-lg p-4 flex flex-col gap-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scenarios</div>
          
          <div className="flex gap-2">
            <button
              onClick={() => loadPreset()}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md text-sm transition-colors"
            >
              Preset 1
            </button>
            <button
              onClick={() => replay()}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md text-sm transition-colors"
            >
              Replay Last
            </button>
          </div>

          <button
            onClick={async () => {
              const algos: Algorithm[] = ['FCFS', 'SSTF', 'SCAN', 'C-SCAN', 'LOOK', 'C-LOOK', 'FSCAN', 'Deadline'];
              for (const algo of algos) {
                engine.reset();
                engine.setAlgorithm(algo);
                queuedRequestsRef.current.forEach(req => {
                  engine.queueRequest({ ...req, arrivalTime: 0 });
                });
                while (true) {
                  const s = engine.getState();
                  if (s.requestQueue.length === 0 && !s.activeRequest && s.completedRequests.length > 0) break;
                  if (s.requestQueue.length > 0 || s.activeRequest) {
                    engine.step();
                  }
                  await new Promise(r => setTimeout(r, 10));
                }
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
            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md text-sm transition-colors"
          >
            Compare All Algorithms
          </button>
        </div>
      </div>

      {/* Queue Info Bar */}
      <div className="px-8 pb-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium">Queue:</span>
          <div className="flex flex-wrap gap-1">
            {state.requestQueue.slice(0, 10).map((req) => (
              <span
                key={req.id}
                className={\`px-2 py-0.5 rounded text-xs font-mono \${
                  state.activeRequest?.id === req.id
                    ? 'bg-cyan-900 text-cyan-100 border border-cyan-700'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }\`}
              >
                {req.track}
              </span>
            ))}
            {state.requestQueue.length === 0 && (
              <span className="text-slate-600 italic">Empty</span>
            )}
            {state.requestQueue.length > 10 && (
              <span className="text-slate-500 text-xs">+\${state.requestQueue.length - 10}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {algorithmExplanation && (
            <div className="px-3 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300 max-w-md truncate" title={algorithmExplanation}>
              {algorithmExplanation}
            </div>
          )}
          <div className={\`px-2 py-1 rounded text-sm font-medium \${
            state.headDirection === 1 ? 'text-cyan-400' : 'text-amber-400'
          }\`} title="Head Direction">
            {state.headDirection === 1 ? '→ Increasing' : '← Decreasing'}
          </div>
          <div className="text-xs text-slate-500">
            [0 - {dynamicDiskSize}]
          </div>
        </div>
      </div>

      `;
  
  content = content.substring(0, startControlsIndex) + newControls + content.substring(endControlsIndex);
}

// Fix the main wrapper background gradient glow
content = content.replace(
  '<div className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col" style={{background: \'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)\'}}>',
  '<div className="w-full h-screen bg-slate-950 flex flex-col">'
);

// Fix inner timeline container gradient glow
content = content.replace(
  'background: \'linear-gradient(135deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.6) 100%)\',\n          boxShadow: \'0 0 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(59,130,246,0.05)\'',
  'background: \'#0f172a\',\n          border: \'1px solid #1e293b\''
);

// Remove scrollable container weird background
content = content.replace(
  'style={{ background: \'rgba(2,6,23,0.6)\' }}',
  ''
);

// Replace Stats Cards block
const startStatsIndex = content.indexOf('{/* Stats Cards - Elevated */}');
const endStatsIndex = content.indexOf('{/* Comparison Table */}');

if (startStatsIndex !== -1 && endStatsIndex !== -1) {
  const newStats = `{/* Stats Cards - Clean */}
      <div className="px-8 pb-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">State</div>
          <div className="flex justify-between items-baseline">
            <div className="text-slate-400 text-sm">Step <span className="text-white text-lg font-bold ml-1">{state.stepCount}</span></div>
            <div className="text-slate-400 text-sm">Head <span className="text-white text-lg font-bold ml-1">{Math.round(state.headPosition)}</span></div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4" title="Total distance the disk head has traveled">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Seek Distance</div>
          <div className="flex justify-between items-baseline">
            <div className="text-slate-400 text-sm">Total <span className="text-white text-lg font-bold ml-1">{metrics.totalSeekDistance}</span></div>
            <div className="text-slate-400 text-sm">Avg <span className="text-white text-lg font-bold ml-1">{metrics.avgSeekDistance}</span></div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4" title="Average time from request arrival to completion">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Time Metrics</div>
          <div className="flex justify-between items-baseline">
            <div className="text-slate-400 text-sm" title="Turnaround Time">Turnaround <span className="text-white text-lg font-bold ml-1">{metrics.avgTurnaround}</span></div>
            <div className="text-slate-400 text-sm" title="Waiting Time">Wait <span className="text-white text-lg font-bold ml-1">{metrics.avgWaiting}</span></div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Progress</div>
          <div className="flex justify-between items-baseline">
            <div className="text-slate-400 text-sm">Done <span className="text-white text-lg font-bold ml-1">{state.completedRequests.length}</span></div>
            <div className="text-slate-400 text-sm">Throughput <span className="text-white text-lg font-bold ml-1">{metrics.throughput}</span></div>
          </div>
        </div>
      </div>

      `;
  content = content.substring(0, startStatsIndex) + newStats + content.substring(endStatsIndex);
}

// Fix algorithm switcher buttons colors
content = content.replace(
  `className={\`px-4 py-2 rounded-lg font-medium transition-all \${
                  state.algorithm === algo
                    ? 'bg-white/20 border border-white/30 text-white'
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                }\`}`,
  `className={\`px-4 py-1.5 rounded-md font-medium text-sm transition-all \${
                  state.algorithm === algo
                    ? 'bg-cyan-900 text-cyan-100 border border-cyan-700'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                }\`}`
);

fs.writeFileSync('src/components/TimelineVisualizerV2.tsx', content);
