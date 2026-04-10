import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AggregateStats } from '@/components/MetricsPanel';
import { SimulationProvider } from '@/components/SimulationProvider';

describe('AggregateStats', () => {
  it('renders aggregate stats container', () => {
    render(
      <SimulationProvider>
        <AggregateStats />
      </SimulationProvider>
    );

    const container = screen.getByTestId('aggregate-stats-container');
    expect(container).toBeInTheDocument();
  });

  it('displays total seek time stat', () => {
    render(
      <SimulationProvider>
        <AggregateStats />
      </SimulationProvider>
    );

    expect(screen.getByTestId('stat-total-seek-time')).toBeInTheDocument();
    expect(screen.getByText('Total Seek Time')).toBeInTheDocument();
  });

  it('displays average wait time stat', () => {
    render(
      <SimulationProvider>
        <AggregateStats />
      </SimulationProvider>
    );

    expect(screen.getByTestId('stat-avg-wait-time')).toBeInTheDocument();
    expect(screen.getByText('Avg Wait Time')).toBeInTheDocument();
  });

  it('displays total requests processed stat', () => {
    render(
      <SimulationProvider>
        <AggregateStats />
      </SimulationProvider>
    );

    expect(screen.getByTestId('stat-total-requests')).toBeInTheDocument();
    expect(screen.getByText('Total Requests')).toBeInTheDocument();
  });

  it('displays throughput stat', () => {
    render(
      <SimulationProvider>
        <AggregateStats />
      </SimulationProvider>
    );

    expect(screen.getByTestId('stat-throughput')).toBeInTheDocument();
    expect(screen.getByText('Throughput')).toBeInTheDocument();
  });

  it('shows zero values initially', () => {
    render(
      <SimulationProvider>
        <AggregateStats />
      </SimulationProvider>
    );

    const totalRequests = screen.getByTestId('stat-total-requests-value');
    expect(totalRequests).toHaveTextContent('0');
  });

  it('uses industrial card styling', () => {
    render(
      <SimulationProvider>
        <AggregateStats />
      </SimulationProvider>
    );

    const container = screen.getByTestId('aggregate-stats-container');
    expect(container).toHaveClass('grid');
  });

  it('displays stats in grid layout', () => {
    render(
      <SimulationProvider>
        <AggregateStats />
      </SimulationProvider>
    );

    const container = screen.getByTestId('aggregate-stats-container');
    expect(container).toHaveClass('grid', 'gap-4');
  });
});
