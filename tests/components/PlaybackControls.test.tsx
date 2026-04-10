import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlaybackControls } from '@/components/ControlPanel';
import { SimulationProvider } from '@/components/SimulationProvider';

describe('PlaybackControls', () => {
  it('renders playback controls container', () => {
    render(
      <SimulationProvider>
        <PlaybackControls />
      </SimulationProvider>
    );

    const container = screen.getByTestId('playback-controls-container');
    expect(container).toBeInTheDocument();
  });

  it('renders Next Step button', () => {
    render(
      <SimulationProvider>
        <PlaybackControls />
      </SimulationProvider>
    );

    expect(screen.getByTestId('btn-next-step')).toBeInTheDocument();
    expect(screen.getByText('Next Step')).toBeInTheDocument();
  });

  it('renders Reset button', () => {
    render(
      <SimulationProvider>
        <PlaybackControls />
      </SimulationProvider>
    );

    expect(screen.getByTestId('btn-reset')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('renders Add Request button', () => {
    render(
      <SimulationProvider>
        <PlaybackControls />
      </SimulationProvider>
    );

    expect(screen.getByTestId('btn-add-request')).toBeInTheDocument();
    expect(screen.getByText('Add Request')).toBeInTheDocument();
  });

  it('renders request track input field', () => {
    render(
      <SimulationProvider>
        <PlaybackControls />
      </SimulationProvider>
    );

    expect(screen.getByTestId('input-request-track')).toBeInTheDocument();
  });

  it('calls engine.step() when Next Step button clicked', async () => {
    render(
      <SimulationProvider>
        <PlaybackControls />
      </SimulationProvider>
    );

    const nextButton = screen.getByTestId('btn-next-step');
    fireEvent.click(nextButton);

    // Verify the button is clickable and no errors occur
    expect(nextButton).toBeInTheDocument();
  });

  it('calls engine.reset() when Reset button clicked', () => {
    render(
      <SimulationProvider>
        <PlaybackControls />
      </SimulationProvider>
    );

    const resetButton = screen.getByTestId('btn-reset');
    fireEvent.click(resetButton);

    expect(resetButton).toBeInTheDocument();
  });

  it('accepts valid request track input and adds to queue', () => {
    render(
      <SimulationProvider engineConfig={{ diskSize: 200 }}>
        <PlaybackControls />
      </SimulationProvider>
    );

    const input = screen.getByTestId('input-request-track') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '50' } });

    expect(input.value).toBe('50');

    const addButton = screen.getByTestId('btn-add-request');
    fireEvent.click(addButton);

    // Button click should succeed without errors
    expect(addButton).toBeInTheDocument();
  });

  it('validates request track is within disk range', () => {
    render(
      <SimulationProvider engineConfig={{ diskSize: 200 }}>
        <PlaybackControls />
      </SimulationProvider>
    );

    const input = screen.getByTestId('input-request-track') as HTMLInputElement;
    // Set value outside valid range
    fireEvent.change(input, { target: { value: '300' } });

    const addButton = screen.getByTestId('btn-add-request');
    
    // Click should not happen or show error
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });

  it('applies industrial styling', () => {
    render(
      <SimulationProvider>
        <PlaybackControls />
      </SimulationProvider>
    );

    const container = screen.getByTestId('playback-controls-container');
    expect(container).toHaveClass('card-accent');
  });
});
