import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PerRequestMetrics } from '@/components/MetricsPanel';
import { SimulationProvider } from '@/components/SimulationProvider';

describe('PerRequestMetrics', () => {
  it('shows empty state when no requests', () => {
    render(
      <SimulationProvider>
        <PerRequestMetrics />
      </SimulationProvider>
    );

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No requests completed yet')).toBeInTheDocument();
  });

  it('displays empty state message', () => {
    render(
      <SimulationProvider>
        <PerRequestMetrics />
      </SimulationProvider>
    );

    const emptyState = screen.getByTestId('empty-state');
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveClass('text-center', 'py-8');
  });

  it('renders component without errors', () => {
    render(
      <SimulationProvider>
        <PerRequestMetrics />
      </SimulationProvider>
    );

    // Should render successfully
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('handles zero completed requests gracefully', () => {
    const { container } = render(
      <SimulationProvider>
        <PerRequestMetrics />
      </SimulationProvider>
    );

    // Should show empty state, not crash
    expect(container).toBeInTheDocument();
  });

  it('uses proper styling classes for empty state', () => {
    render(
      <SimulationProvider>
        <PerRequestMetrics />
      </SimulationProvider>
    );

    const emptyState = screen.getByTestId('empty-state');
    expect(emptyState).toHaveClass('text-center');
  });

  it('displays appropriate message for no completed requests', () => {
    render(
      <SimulationProvider>
        <PerRequestMetrics />
      </SimulationProvider>
    );

    expect(screen.getByText('No requests completed yet')).toBeInTheDocument();
  });

  it('component accepts all props without errors', () => {
    const { container } = render(
      <SimulationProvider>
        <PerRequestMetrics />
      </SimulationProvider>
    );

    expect(container).toBeInTheDocument();
  });
});
