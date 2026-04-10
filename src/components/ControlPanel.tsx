import React from 'react';

export const AlgorithmSelector: React.FC = () => <div data-testid="algorithm-selector" />;
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
