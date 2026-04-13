import React, { useRef, useState, useEffect } from 'react';
import { useSimulation } from './SimulationProvider';
import { CanvasRenderer } from './CanvasRenderer';
import { PlaybackControls } from './PlaybackControls';
import { MetricsPanel } from './MetricsPanel';
import { AlgorithmSelector } from './ControlPanel';
import { PresetScenarios } from './PresetScenarios';
import { scenarios } from '@/data/scenarioPresets';

export const TimelineVisualizer: React.FC = () => {
  const { engine, state } = useSimulation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [metricsOpen, setMetricsOpen] = useState(true);
  const [scenarioLoaded, setScenarioLoaded] = useState(false);
  const animationRef = useRef<NodeJS.Timeout>();

  // Auto-load initial scenario on mount
  useEffect(() => {
    if (!scenarioLoaded && state.requestQueue.length === 0) {
      const randomScenario = scenarios['random'];
      if (randomScenario) {
        randomScenario.requests.forEach((req) => {
          const requestId = `req-${state.currentTime}-${Math.random()}`;
          engine.queueRequest({
            id: requestId,
            track: req.track,
            arrivalTime: state.currentTime,
          });
        });
        setScenarioLoaded(true);
        // Auto-play immediately
        setIsPlaying(true);
      }
    }
  }, [scenarioLoaded, state.currentTime, state.requestQueue.length, engine]);

  // Auto-advance simulation based on speed
  useEffect(() => {
    if (!isPlaying) return;

    const interval = Math.max(50, 100 / speed); // Clamp min to 50ms
    animationRef.current = setInterval(() => {
      engine.step();
    }, interval);

    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [isPlaying, speed, engine]);

  const handlePlayPauseToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    engine.reset();
    setScenarioLoaded(false);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col overflow-hidden">
      {/* Main Canvas Area */}
      <div className="relative flex-1 overflow-hidden">
        <CanvasRenderer ref={canvasRef} isPlaying={isPlaying} />

        {/* Playback Controls */}
        <PlaybackControls
          isPlaying={isPlaying}
          onPlayPauseToggle={handlePlayPauseToggle}
          speed={speed}
          onSpeedChange={setSpeed}
          onReset={handleReset}
        />

        {/* Control Panel (Top-Right) */}
        <div className="absolute top-20 right-4 z-40 w-80 max-h-96 overflow-y-auto space-y-4">
          <AlgorithmSelector />
          <PresetScenarios />
        </div>

        {/* Metrics Toggle Button */}
        <button
          onClick={() => setMetricsOpen(!metricsOpen)}
          className="absolute bottom-4 right-4 z-40 px-3 py-2 bg-slate-900/90 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-lg text-slate-300 hover:text-white transition-colors text-sm font-medium"
        >
          {metricsOpen ? '▶ Metrics' : '◀ Metrics'}
        </button>
      </div>

      {/* Floating Metrics Sidebar */}
      {metricsOpen && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-md border-l border-white/10 overflow-y-auto shadow-2xl z-30 transition-all duration-300">
          <div className="p-6">
            <MetricsPanel />
          </div>
        </div>
      )}
    </div>
  );
};
