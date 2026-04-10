import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ControlPanel } from '@/components/ControlPanel';
import { SimulationProvider } from '@/components/SimulationProvider';

describe('ControlPanel', () => {
  it('renders control panel container', () => {
    render(
      <SimulationProvider>
        <ControlPanel />
      </SimulationProvider>
    );

    const panel = screen.getByTestId('control-panel');
    expect(panel).toBeInTheDocument();
  });

  it('renders algorithm selector section', () => {
    render(
      <SimulationProvider>
        <ControlPanel />
      </SimulationProvider>
    );

    expect(screen.getByTestId('algorithm-selector-container')).toBeInTheDocument();
  });

  it('renders disk configuration section', () => {
    render(
      <SimulationProvider>
        <ControlPanel />
      </SimulationProvider>
    );

    expect(screen.getByTestId('disk-config-container')).toBeInTheDocument();
  });

  it('renders playback controls section', () => {
    render(
      <SimulationProvider>
        <ControlPanel />
      </SimulationProvider>
    );

    expect(screen.getByTestId('playback-controls-container')).toBeInTheDocument();
  });

  it('renders queue monitor section', () => {
    render(
      <SimulationProvider>
        <ControlPanel />
      </SimulationProvider>
    );

    expect(screen.getByTestId('queue-monitor-container')).toBeInTheDocument();
  });

  it('applies industrial styling classes', () => {
    render(
      <SimulationProvider>
        <ControlPanel />
      </SimulationProvider>
    );

    const panel = screen.getByTestId('control-panel');
    expect(panel).toHaveClass('flex', 'flex-col', 'space-y-4', 'p-6');
  });
});
