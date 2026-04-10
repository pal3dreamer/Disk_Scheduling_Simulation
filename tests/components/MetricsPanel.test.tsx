import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricsPanel } from '@/components/MetricsPanel';
import { SimulationProvider } from '@/components/SimulationProvider';

describe('MetricsPanel', () => {
  it('renders metrics panel container', () => {
    render(
      <SimulationProvider>
        <MetricsPanel />
      </SimulationProvider>
    );

    const container = screen.getByTestId('metrics-panel-container');
    expect(container).toBeInTheDocument();
  });

  it('renders aggregate stats section', () => {
    render(
      <SimulationProvider>
        <MetricsPanel />
      </SimulationProvider>
    );

    expect(screen.getByTestId('aggregate-stats')).toBeInTheDocument();
  });

  it('renders per-request metrics section', () => {
    render(
      <SimulationProvider>
        <MetricsPanel />
      </SimulationProvider>
    );

    expect(screen.getByTestId('per-request-metrics')).toBeInTheDocument();
  });

  it('displays metrics header', () => {
    render(
      <SimulationProvider>
        <MetricsPanel />
      </SimulationProvider>
    );

    expect(screen.getByText('Simulation Metrics')).toBeInTheDocument();
  });

  it('applies industrial styling to container', () => {
    render(
      <SimulationProvider>
        <MetricsPanel />
      </SimulationProvider>
    );

    const container = screen.getByTestId('metrics-panel-container');
    expect(container).toHaveClass('bg-gray-900', 'border-t', 'border-amber-600');
  });

  it('uses full width layout', () => {
    render(
      <SimulationProvider>
        <MetricsPanel />
      </SimulationProvider>
    );

    const container = screen.getByTestId('metrics-panel-container');
    expect(container).toHaveClass('w-full');
  });
});
