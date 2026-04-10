import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AlgorithmSelector } from '@/components/ControlPanel';
import { SimulationProvider } from '@/components/SimulationProvider';

describe('AlgorithmSelector', () => {
  it('renders algorithm selector container', () => {
    render(
      <SimulationProvider>
        <AlgorithmSelector />
      </SimulationProvider>
    );

    const selector = screen.getByTestId('algorithm-selector-container');
    expect(selector).toBeInTheDocument();
  });

  it('displays current algorithm name', () => {
    render(
      <SimulationProvider engineConfig={{ algorithm: 'FCFS' }}>
        <AlgorithmSelector />
      </SimulationProvider>
    );

    expect(screen.getByTestId('current-algorithm')).toHaveTextContent('FCFS');
  });

  it('renders all available algorithm options in dropdown', () => {
    render(
      <SimulationProvider>
        <AlgorithmSelector />
      </SimulationProvider>
    );

    // Open dropdown
    const chooseButton = screen.getByText('Choose Algorithm');
    fireEvent.click(chooseButton);

    const options = screen.getAllByTestId('algorithm-option');
    expect(options).toHaveLength(6);
  });

  it('displays algorithm options: FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK', () => {
    render(
      <SimulationProvider>
        <AlgorithmSelector />
      </SimulationProvider>
    );

    // Open dropdown
    const chooseButton = screen.getByText('Choose Algorithm');
    fireEvent.click(chooseButton);

    // Check that all algorithm buttons are present in the dropdown
    expect(screen.getByTestId('select-algorithm-FCFS')).toBeInTheDocument();
    expect(screen.getByTestId('select-algorithm-SSTF')).toBeInTheDocument();
    expect(screen.getByTestId('select-algorithm-SCAN')).toBeInTheDocument();
    expect(screen.getByTestId('select-algorithm-C-SCAN')).toBeInTheDocument();
    expect(screen.getByTestId('select-algorithm-LOOK')).toBeInTheDocument();
    expect(screen.getByTestId('select-algorithm-C-LOOK')).toBeInTheDocument();
  });

  it('displays algorithm description when selected', () => {
    render(
      <SimulationProvider engineConfig={{ algorithm: 'SSTF' }}>
        <AlgorithmSelector />
      </SimulationProvider>
    );

    const description = screen.getByTestId('algorithm-description');
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent('Shortest Seek Time First');
  });

  it('updates algorithm when option is selected', async () => {
    render(
      <SimulationProvider>
        <AlgorithmSelector />
      </SimulationProvider>
    );

    // Open dropdown
    const chooseButton = screen.getByText('Choose Algorithm');
    fireEvent.click(chooseButton);

    // Select SSTF
    const selectButton = screen.getByTestId('select-algorithm-SSTF');
    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(screen.getByTestId('current-algorithm')).toHaveTextContent('SSTF');
    });
  });

  it('applies industrial styling to selector', () => {
    render(
      <SimulationProvider>
        <AlgorithmSelector />
      </SimulationProvider>
    );

    const container = screen.getByTestId('algorithm-selector-container');
    expect(container).toHaveClass('card-accent');
  });
});
