import React, { useState, useEffect } from 'react';
import { useSimulation } from './SimulationProvider';
import { Algorithm } from '@/engine/types';
import { PresetScenarios } from './PresetScenarios';

const algorithmDescriptions: Record<Algorithm, string> = {
  FCFS: 'First-Come-First-Served: processes requests in arrival order. Simple but can cause starvation.',
  SSTF: 'Shortest Seek Time First: selects the nearest pending request. Minimizes seek time but can starve outer tracks.',
  SCAN: 'Elevator algorithm: moves in one direction, then reverses. Prevents starvation but creates periodic delays.',
  'C-SCAN': 'Circular SCAN: moves in one direction and wraps to the start. More uniform wait times than SCAN.',
  LOOK: 'Like SCAN but stops at the last request, avoiding unnecessary end traversal.',
  'C-LOOK': 'Like C-SCAN but stops at the last request in each direction.',
};

export const AlgorithmSelector: React.FC = () => {
  const { engine, state } = useSimulation();
  const [isOpen, setIsOpen] = useState(false);

  const currentAlgorithm: Algorithm = state.algorithm;

  const handleSelectAlgorithm = (algorithm: Algorithm) => {
    engine.setAlgorithm(algorithm);
    setIsOpen(false);
  };

  return (
    <div data-testid="algorithm-selector-container" className="card-accent p-4">
      <div className="flex flex-col space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Scheduling Algorithm
        </h3>

        <div className="flex items-center justify-between">
          <div data-testid="current-algorithm" className="text-xl font-mono text-cyan-400 font-bold">
            {currentAlgorithm}
          </div>

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="btn-industrial px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 border-slate-700"
            >
              Change
            </button>

            {isOpen && (
              <div className="absolute top-full mt-2 left-0 bg-gray-900 border border-amber-600 rounded shadow-lg z-10">
                {Object.keys(algorithmDescriptions).map((algo) => (
                  <button
                    key={algo}
                    data-testid={`select-algorithm-${algo}`}
                    onClick={() => handleSelectAlgorithm(algo as Algorithm)}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-800 ${
                      algo === currentAlgorithm ? 'bg-amber-500 text-black' : 'text-gray-200'
                    }`}
                  >
                    <div data-testid="algorithm-option">{algo}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p
          data-testid="algorithm-description"
          className="text-xs text-gray-400 italic leading-relaxed"
        >
          {algorithmDescriptions[currentAlgorithm]}
        </p>
      </div>
    </div>
  );
};

export const DiskConfig: React.FC = () => {
  const { state } = useSimulation();

  return (
    <div data-testid="disk-config-container" className="card-accent p-4">
      <div className="flex flex-col space-y-4">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Disk Configuration
        </h3>

        {/* Disk Size Slider */}
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Disk Size</label>
            <span data-testid="disk-size-value" className="text-xs font-mono text-cyan-400">
              {state.diskSize} tracks
            </span>
          </div>
          <input
            data-testid="disk-size-slider"
            type="range"
            min="100"
            max="500"
            value={state.diskSize}
            onChange={() => {}} // Disabled - config immutable
            className="w-full cursor-pointer"
            disabled
          />
        </div>

        {/* RPM Slider */}
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Platter RPM</label>
            <span data-testid="rpm-value" className="text-xs font-mono text-cyan-400">
              {state.platterRPM}
            </span>
          </div>
          <input
            data-testid="rpm-slider"
            type="range"
            min="3600"
            max="15000"
            step="600"
            value={state.platterRPM}
            onChange={() => {}} // Disabled - config immutable
            className="w-full cursor-pointer opacity-50"
            disabled
          />
        </div>

        {/* Seek Time Slider */}
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Seek Time</label>
            <span data-testid="seek-time-value" className="text-xs font-mono text-cyan-400">
              {state.trackSeekTime.toFixed(2)} ms/track
            </span>
          </div>
          <input
            data-testid="seek-time-slider"
            type="range"
            min="0.05"
            max="0.5"
            step="0.05"
            value={state.trackSeekTime}
            onChange={() => {}} // Disabled - config immutable
            className="w-full cursor-pointer opacity-50"
            disabled
          />
        </div>

        <p className="text-xs text-gray-500 italic">
          Configuration is immutable after simulation starts. Reset to change parameters.
        </p>
      </div>
    </div>
  );
};
export const PlaybackControls: React.FC = () => {
  const { engine, state } = useSimulation();
  const [requestTrack, setRequestTrack] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: 'error' | 'info' | null }>({
    message: '',
    type: null,
  });

  // Play loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && (state.requestQueue.length > 0 || state.activeRequest)) {
      timer = setTimeout(async () => {
        try {
          await engine.step();
        } catch (err) {
          setIsPlaying(false);
          setStatus({ message: err instanceof Error ? err.message : 'Simulation error', type: 'error' });
        }
      }, 100);
    } else if (isPlaying) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, state.requestQueue.length, state.activeRequest, engine]);

  const handleNextStep = async () => {
    try {
      setStatus({ message: '', type: null });
      await engine.step();
    } catch (error) {
      setStatus({ message: error instanceof Error ? error.message : 'Unknown error', type: 'error' });
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStatus({ message: '', type: null });
    engine.reset();
  };

  const handleAddRequest = () => {
    const track = parseInt(requestTrack, 10);

    if (!requestTrack || isNaN(track)) {
      return;
    }

    if (track < 0 || track >= state.diskSize) {
      setStatus({ message: `Track must be between 0 and ${state.diskSize - 1}`, type: 'error' });
      return;
    }

    const requestId = `req-${state.currentTime.toFixed(0)}-${Math.floor(Math.random() * 1000)}`;
    engine.queueRequest({ id: requestId, track, arrivalTime: state.currentTime });
    setRequestTrack('');
    setStatus({ message: '', type: null });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddRequest();
    }
  };

  return (
    <div data-testid="playback-controls-container" className="card-accent p-4">
      <div className="flex flex-col space-y-4">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Playback Control
        </h3>

        {/* Status Message */}
        {status.type && (
          <div className={`text-[10px] px-2 py-1 rounded font-mono ${
            status.type === 'error' ? 'bg-red-900/40 text-red-400 border border-red-800' : 'bg-blue-900/40 text-blue-400 border border-blue-800'
          }`}>
            {status.message}
          </div>
        )}

        {/* Step Control */}
        <div className="grid grid-cols-3 gap-2">
          <button
            data-testid="btn-play-pause"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`btn-industrial px-2 py-2 text-xs font-bold uppercase tracking-wider ${
              isPlaying ? 'bg-amber-600 text-black border-amber-500' : 'bg-slate-800'
            }`}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            data-testid="btn-next-step"
            onClick={handleNextStep}
            disabled={isPlaying}
            className="btn-industrial px-2 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-30"
          >
            Step
          </button>
          <button
            data-testid="btn-reset"
            onClick={handleReset}
            className="btn-industrial px-2 py-2 text-xs font-bold uppercase tracking-wider bg-red-900/20 hover:bg-red-900/40 border-red-900/50 text-red-400"
          >
            Reset
          </button>
        </div>

        {/* Add Request */}
        <div className="flex flex-col space-y-2">
          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Queue Request</label>
          <div className="flex space-x-2">
            <input
              data-testid="input-request-track"
              type="number"
              min="0"
              max={state.diskSize - 1}
              value={requestTrack}
              onChange={(e) => setRequestTrack(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Track 0-${state.diskSize - 1}`}
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 text-cyan-400 text-xs font-mono focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              data-testid="btn-add-request"
              onClick={handleAddRequest}
              className="btn-industrial px-3 py-1.5 text-xs font-bold"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export const QueueMonitor: React.FC = () => {
  const { state } = useSimulation();

  return (
    <div data-testid="queue-monitor-container" className="card-accent p-4 grid grid-cols-2 gap-4">
      {/* Pending Queue */}
      <div className="flex flex-col space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Pending
        </h3>
        <div data-testid="pending-queue-list" className="flex flex-col space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {state.requestQueue.length === 0 ? (
            <p className="text-[10px] text-slate-600 italic">Queue empty</p>
          ) : (
            state.requestQueue.map((req) => (
              <div
                key={req.id}
                data-testid={`queue-item-${req.id}`}
                className="px-2 py-1.5 bg-slate-900/50 border-l-2 border-slate-600 text-slate-300 text-[10px] font-mono flex justify-between items-center"
              >
                <span>Track {req.track}</span>
                <span className="text-slate-600 text-[8px] uppercase">{req.id.split('-')[0]}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Request */}
      <div className="flex flex-col space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Active
        </h3>
        <div data-testid="active-request-display" className="px-3 py-4 bg-slate-900 border-l-2 border-cyan-500 rounded">
          {state.activeRequest ? (
            <div className="text-[10px] font-mono space-y-1">
              <div className="text-cyan-400 font-bold flex items-center">
                <span className="status-active mr-2"></span>
                PROCESSING
              </div>
              <div className="text-slate-200">Track: {state.activeRequest.track}</div>
              <div className="text-slate-600 text-[8px]">ID: {state.activeRequest.id}</div>
            </div>
          ) : (
            <p className="text-[10px] text-slate-600 italic">Idle</p>
          )}
        </div>
      </div>
    </div>
  );
};

export const ControlPanel: React.FC = () => {
  return (
    <div
      data-testid="control-panel"
      className="flex flex-col space-y-4 p-6"
    >
      <AlgorithmSelector />
      <DiskConfig />
      <PresetScenarios />
      <PlaybackControls />
      <QueueMonitor />
    </div>
  );
};
