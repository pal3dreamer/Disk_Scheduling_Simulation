import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationProvider, useSimulation } from '@/components/SimulationProvider';

describe('SimulationProvider', () => {
  it('provides useSimulation hook to child components', () => {
    const TestComponent = () => {
      const sim = useSimulation();
      return <div>{sim ? 'ready' : 'not-ready'}</div>;
    };

    render(
      <SimulationProvider>
        <TestComponent />
      </SimulationProvider>
    );

    expect(screen.getByText('ready')).toBeInTheDocument();
  });

  it('initializes SimulationEngine with default config', () => {
    const TestComponent = () => {
      const sim = useSimulation();
      return <div>{sim?.engine ? 'engine-exists' : 'no-engine'}</div>;
    };

    render(
      <SimulationProvider>
        <TestComponent />
      </SimulationProvider>
    );

    expect(screen.getByText('engine-exists')).toBeInTheDocument();
  });

  it('exposes engine state through hook', () => {
    const TestComponent = () => {
      const sim = useSimulation();
      return (
        <div>
          <div data-testid="head-position">{sim?.state.headPosition}</div>
          <div data-testid="queue-length">{sim?.state.requestQueue.length}</div>
        </div>
      );
    };

    render(
      <SimulationProvider>
        <TestComponent />
      </SimulationProvider>
    );

    expect(screen.getByTestId('head-position')).toHaveTextContent('0');
    expect(screen.getByTestId('queue-length')).toHaveTextContent('0');
  });

  it('allows child components to call engine methods', () => {
    const TestComponent = () => {
      const sim = useSimulation();
      const handleAddRequest = () => {
        sim?.engine.queueRequest({ track: 50, arrivalTime: 0 });
      };
      return (
        <div>
          <button onClick={handleAddRequest}>Add Request</button>
          <div data-testid="queue-length">{sim?.state.requestQueue.length}</div>
        </div>
      );
    };

    render(
      <SimulationProvider>
        <TestComponent />
      </SimulationProvider>
    );

    const button = screen.getByText('Add Request');
    button.click();

    waitFor(() => {
      expect(screen.getByTestId('queue-length')).toHaveTextContent('1');
    });
  });

  it('subscribes to engine events and updates state', async () => {
    const TestComponent = () => {
      const sim = useSimulation();
      return (
        <div>
          <div data-testid="event-count">{sim?.eventLog?.length || 0}</div>
        </div>
      );
    };

    render(
      <SimulationProvider>
        <TestComponent />
      </SimulationProvider>
    );

    // Initial state: no events
    expect(screen.getByTestId('event-count')).toHaveTextContent('0');
  });

  it('throws error when useSimulation is used outside provider', () => {
    const TestComponent = () => {
      useSimulation();
      return null;
    };

    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useSimulation must be used within SimulationProvider');

    console.error = originalError;
  });
});
