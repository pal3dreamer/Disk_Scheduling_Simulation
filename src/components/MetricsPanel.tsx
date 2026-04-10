import React from 'react';

export const AggregateStats: React.FC = () => <div data-testid="aggregate-stats" />;
export const PerRequestMetrics: React.FC = () => <div data-testid="per-request-metrics" />;

export const MetricsPanel: React.FC = () => {
  return (
    <div
      data-testid="metrics-panel-container"
      className="w-full bg-gray-900 border-t border-amber-600 p-6"
    >
      <div className="flex flex-col space-y-6">
        <h2 className="text-lg font-semibold text-amber-500 uppercase tracking-wider">
          Simulation Metrics
        </h2>

        <AggregateStats />
        <PerRequestMetrics />
      </div>
    </div>
  );
};
