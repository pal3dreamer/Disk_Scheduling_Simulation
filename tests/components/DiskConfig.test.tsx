import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DiskConfig } from '@/components/ControlPanel';
import { SimulationProvider } from '@/components/SimulationProvider';

describe('DiskConfig', () => {
  it('renders disk config container', () => {
    render(
      <SimulationProvider>
        <DiskConfig />
      </SimulationProvider>
    );

    const container = screen.getByTestId('disk-config-container');
    expect(container).toBeInTheDocument();
  });

  it('renders disk size slider', () => {
    render(
      <SimulationProvider>
        <DiskConfig />
      </SimulationProvider>
    );

    expect(screen.getByTestId('disk-size-slider')).toBeInTheDocument();
    expect(screen.getByText(/Disk Size/i)).toBeInTheDocument();
  });

  it('renders RPM slider', () => {
    render(
      <SimulationProvider>
        <DiskConfig />
      </SimulationProvider>
    );

    expect(screen.getByTestId('rpm-slider')).toBeInTheDocument();
    expect(screen.getByText(/RPM/i)).toBeInTheDocument();
  });

  it('renders seek time slider', () => {
    render(
      <SimulationProvider>
        <DiskConfig />
      </SimulationProvider>
    );

    expect(screen.getByTestId('seek-time-slider')).toBeInTheDocument();
    expect(screen.getByText(/Seek Time/i)).toBeInTheDocument();
  });

  it('displays current disk size value', () => {
    render(
      <SimulationProvider engineConfig={{ diskSize: 250 }}>
        <DiskConfig />
      </SimulationProvider>
    );

    expect(screen.getByTestId('disk-size-value')).toHaveTextContent('250');
  });

  it('displays current RPM value', () => {
    render(
      <SimulationProvider engineConfig={{ platterRPM: 5400 }}>
        <DiskConfig />
      </SimulationProvider>
    );

    expect(screen.getByTestId('rpm-value')).toHaveTextContent('5400');
  });

  it('displays current seek time value', () => {
    render(
      <SimulationProvider engineConfig={{ trackSeekTime: 0.15 }}>
        <DiskConfig />
      </SimulationProvider>
    );

    expect(screen.getByTestId('seek-time-value')).toHaveTextContent('0.15');
  });

  it('applies industrial styling', () => {
    render(
      <SimulationProvider>
        <DiskConfig />
      </SimulationProvider>
    );

    const container = screen.getByTestId('disk-config-container');
    expect(container).toHaveClass('card-accent');
  });
});
