import React from 'react';
import { useSimulation } from './SimulationProvider';

export interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPauseToggle: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onPlayPauseToggle,
  speed,
  onSpeedChange,
  onReset,
}) => {
  const { state } = useSimulation();

  return (
    <div className="absolute top-4 left-4 z-40 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-lg p-4 shadow-lg">
      <div className="flex items-center gap-6">
        {/* Algorithm Label */}
        <div className="text-sm text-slate-300">
          <div className="font-semibold text-white">{state.algorithm}</div>
          <div className="text-xs text-slate-400">
            Step {state.stepCount}
          </div>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={onPlayPauseToggle}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        {/* Speed Control */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Speed:</label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="w-24 cursor-pointer"
          />
          <span className="text-xs text-slate-300 w-8">{speed.toFixed(1)}x</span>
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors font-medium text-sm"
        >
          ↻ Reset
        </button>
      </div>
    </div>
  );
};
