import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PresetScenarios } from '@/components/PresetScenarios';
import { SimulationProvider } from '@/components/SimulationProvider';

describe('PresetScenarios', () => {
  it('renders preset scenarios container', () => {
    render(
      <SimulationProvider>
        <PresetScenarios />
      </SimulationProvider>
    );

    expect(screen.getByTestId('preset-scenarios-container')).toBeInTheDocument();
  });

  it('renders all three preset buttons', () => {
    render(
      <SimulationProvider>
        <PresetScenarios />
      </SimulationProvider>
    );

    expect(screen.getByTestId('preset-button-heavy-load')).toBeInTheDocument();
    expect(screen.getByTestId('preset-button-clustered')).toBeInTheDocument();
    expect(screen.getByTestId('preset-button-random')).toBeInTheDocument();
  });

  it('displays correct button labels', () => {
    render(
      <SimulationProvider>
        <PresetScenarios />
      </SimulationProvider>
    );

    expect(screen.getByText('Heavy Load')).toBeInTheDocument();
    expect(screen.getByText('Clustered Access')).toBeInTheDocument();
    expect(screen.getByText('Random Access')).toBeInTheDocument();
  });

  it('has tooltips describing scenarios', () => {
    render(
      <SimulationProvider>
        <PresetScenarios />
      </SimulationProvider>
    );

    const heavyLoadBtn = screen.getByTestId('preset-button-heavy-load');
    expect(heavyLoadBtn).toHaveAttribute('title', expect.stringContaining('20 random requests'));
  });

  it('buttons are clickable', () => {
    render(
      <SimulationProvider>
        <PresetScenarios />
      </SimulationProvider>
    );

    const buttons = [
      screen.getByTestId('preset-button-heavy-load'),
      screen.getByTestId('preset-button-clustered'),
      screen.getByTestId('preset-button-random'),
    ];

    buttons.forEach((btn) => {
      expect(btn).not.toBeDisabled();
    });
  });

  it('applies industrial styling classes', () => {
    render(
      <SimulationProvider>
        <PresetScenarios />
      </SimulationProvider>
    );

    const container = screen.getByTestId('preset-scenarios-container');
    expect(container).toHaveClass('card-accent', 'p-4');
  });
});
