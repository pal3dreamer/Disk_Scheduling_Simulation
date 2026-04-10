import React, { useState } from 'react';
import { useSimulation } from './SimulationProvider';
import { Algorithm } from '@/engine/types';

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
        <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider">
          Disk Scheduling Algorithm
        </h3>

        <div className="flex items-center space-x-4">
          <div data-testid="current-algorithm" className="text-xl font-mono text-gray-200 font-bold">
            {currentAlgorithm}
          </div>

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="btn-industrial px-4 py-2 text-sm"
            >
              Choose Algorithm
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
        <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider">
          Disk Configuration
        </h3>

        {/* Disk Size Slider */}
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs text-gray-300 font-medium">Disk Size (tracks)</label>
            <span data-testid="disk-size-value" className="text-xs font-mono text-amber-400">
              {state.diskSize}
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
            <label className="text-xs text-gray-300 font-medium">Platter RPM</label>
            <span data-testid="rpm-value" className="text-xs font-mono text-amber-400">
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
            className="w-full cursor-pointer"
            disabled
          />
        </div>

        {/* Seek Time Slider */}
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs text-gray-300 font-medium">Seek Time (ms/track)</label>
            <span data-testid="seek-time-value" className="text-xs font-mono text-amber-400">
              {state.trackSeekTime.toFixed(2)}
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
            className="w-full cursor-pointer"
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

  const handleNextStep = async () => {
    await engine.step();
  };

  const handleReset = () => {
    engine.reset();
  };

  const handleAddRequest = () => {
    const track = parseInt(requestTrack, 10);

    if (!requestTrack || isNaN(track)) {
      return;
    }

    if (track < 0 || track >= state.diskSize) {
      return;
    }

    const requestId = `req-${state.currentTime}-${Math.random()}`;
    engine.queueRequest({ id: requestId, track, arrivalTime: state.currentTime });
    setRequestTrack('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddRequest();
    }
  };

  return (
    <div data-testid="playback-controls-container" className="card-accent p-4">
      <div className="flex flex-col space-y-4">
        <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider">
          Playback Control
        </h3>

        {/* Step Control */}
        <div className="flex space-x-2">
          <button
            data-testid="btn-next-step"
            onClick={handleNextStep}
            className="btn-industrial px-4 py-2 text-sm flex-1"
          >
            Next Step
          </button>
          <button
            data-testid="btn-reset"
            onClick={handleReset}
            className="btn-industrial px-4 py-2 text-sm flex-1 bg-red-900 hover:bg-red-800"
          >
            Reset
          </button>
        </div>

        {/* Add Request */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs text-gray-300 font-medium">Queue Request (track #)</label>
          <div className="flex space-x-2">
            <input
              data-testid="input-request-track"
              type="number"
              min="0"
              max={state.diskSize - 1}
              value={requestTrack}
              onChange={(e) => setRequestTrack(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`0-${state.diskSize - 1}`}
              className="flex-1 px-3 py-2 bg-gray-800 border border-amber-600 text-gray-200 text-sm focus:outline-none focus:border-amber-400"
            />
            <button
              data-testid="btn-add-request"
              onClick={handleAddRequest}
              className="btn-industrial px-4 py-2 text-sm"
            >
              Add Request
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 italic">
          {state.requestQueue.length} request(s) queued • {state.completedRequests.length} completed
        </p>
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
        <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider">
          Pending Requests
        </h3>
        <div data-testid="pending-queue-list" className="flex flex-col space-y-2 max-h-48 overflow-y-auto">
          {state.requestQueue.length === 0 ? (
            <p className="text-xs text-gray-500 italic">Queue empty</p>
          ) : (
            state.requestQueue.map((req) => (
              <div
                key={req.id}
                data-testid={`queue-item-${req.id}`}
                className="px-3 py-2 bg-gray-800 border-l-2 border-amber-500 text-gray-300 text-xs font-mono"
              >
                <div>Track: {req.track}</div>
                <div className="text-gray-500">ID: {req.id}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Request */}
      <div className="flex flex-col space-y-3">
        <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider">
          Active Request
        </h3>
        <div data-testid="active-request-display" className="px-3 py-4 bg-gray-800 border-l-2 border-green-500">
          {state.activeRequest ? (
            <div className="text-xs font-mono space-y-1">
              <div className="text-green-400 font-bold">ACTIVE</div>
              <div className="text-gray-300">Track: {state.activeRequest.track}</div>
              <div className="text-gray-500">ID: {state.activeRequest.id}</div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">None</p>
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
      <PlaybackControls />
      <QueueMonitor />
    </div>
  );
};
