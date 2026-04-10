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

export const DiskConfig: React.FC = () => <div data-testid="disk-config" />;
export const PlaybackControls: React.FC = () => <div data-testid="playback-controls" />;
export const QueueMonitor: React.FC = () => <div data-testid="queue-monitor" />;

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
