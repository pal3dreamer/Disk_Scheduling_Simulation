import React from 'react';
import { useSimulation } from './SimulationProvider';
import { scenarios } from '@/data/scenarioPresets';

export const PresetScenarios: React.FC = () => {
  const { engine, state } = useSimulation();

  const handleLoadScenario = (scenarioKey: string) => {
    const scenario = scenarios[scenarioKey];
    if (!scenario) return;

    // Add each request from the scenario
    scenario.requests.forEach((req) => {
      const requestId = `req-${state.currentTime}-${Math.random()}`;
      engine.queueRequest({
        id: requestId,
        track: req.track,
        arrivalTime: state.currentTime,
      });
    });
  };

  return (
    <div data-testid="preset-scenarios-container" className="card-accent p-4">
      <div className="flex flex-col space-y-3">
        <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider">
          Preset Scenarios
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(scenarios).map(([key, scenario]) => (
            <button
              key={key}
              data-testid={`preset-button-${key}`}
              onClick={() => handleLoadScenario(key)}
              className="btn-industrial text-xs py-2"
              title={scenario.description}
            >
              {scenario.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
