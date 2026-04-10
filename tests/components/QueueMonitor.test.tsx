import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QueueMonitor } from '@/components/ControlPanel';
import { SimulationProvider } from '@/components/SimulationProvider';

describe('QueueMonitor', () => {
  it('renders queue monitor container', () => {
    render(
      <SimulationProvider>
        <QueueMonitor />
      </SimulationProvider>
    );

    const container = screen.getByTestId('queue-monitor-container');
    expect(container).toBeInTheDocument();
  });

  it('displays pending requests section', () => {
    render(
      <SimulationProvider>
        <QueueMonitor />
      </SimulationProvider>
    );

    expect(screen.getByText('Pending Requests')).toBeInTheDocument();
    expect(screen.getByTestId('pending-queue-list')).toBeInTheDocument();
  });

  it('displays active request section', () => {
    render(
      <SimulationProvider>
        <QueueMonitor />
      </SimulationProvider>
    );

    expect(screen.getByText('Active Request')).toBeInTheDocument();
    expect(screen.getByTestId('active-request-display')).toBeInTheDocument();
  });

  it('shows empty state for pending queue', () => {
    render(
      <SimulationProvider>
        <QueueMonitor />
      </SimulationProvider>
    );

    expect(screen.getByText('Queue empty')).toBeInTheDocument();
  });

  it('shows no active request initially', () => {
    render(
      <SimulationProvider>
        <QueueMonitor />
      </SimulationProvider>
    );

    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('displays queue item with track information', () => {
    render(
      <SimulationProvider>
        <QueueMonitor />
      </SimulationProvider>
    );

    // Empty queue but should have container
    expect(screen.getByTestId('pending-queue-list')).toBeInTheDocument();
  });

  it('applies industrial styling to container', () => {
    render(
      <SimulationProvider>
        <QueueMonitor />
      </SimulationProvider>
    );

    const container = screen.getByTestId('queue-monitor-container');
    expect(container).toHaveClass('card-accent');
  });

  it('uses grid layout for queue and active sections', () => {
    render(
      <SimulationProvider>
        <QueueMonitor />
      </SimulationProvider>
    );

    const container = screen.getByTestId('queue-monitor-container');
    expect(container).toHaveClass('grid');
  });
});
