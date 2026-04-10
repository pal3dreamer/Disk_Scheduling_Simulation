import React, { useState } from 'react';
import { useSimulation } from './SimulationProvider';

type SortColumn = 'id' | 'track' | 'arrival' | 'start' | 'complete' | 'waitTime' | 'serviceTime';
type SortDirection = 'asc' | 'desc';

export const AggregateStats: React.FC = () => {
  const { state } = useSimulation();

  // Calculate aggregate metrics
  const totalRequests = state.completedRequests.length;
  const totalSeekTime = state.completedRequests.reduce((sum, req) => {
    const waitTime = (req.startTime || 0) - req.arrivalTime;
    return sum + waitTime;
  }, 0);

  const avgWaitTime = totalRequests > 0 ? totalSeekTime / totalRequests : 0;

  const totalSimulationTime = state.currentTime;
  const throughput = totalSimulationTime > 0 ? totalRequests / totalSimulationTime : 0;

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    unit?: string;
    testId: string;
  }> = ({ title, value, unit = '', testId }) => (
    <div data-testid={testId} className="card-accent p-4 flex flex-col space-y-2">
      <h4 className="text-xs text-gray-400 uppercase tracking-wide font-medium">
        {title}
      </h4>
      <p className="text-2xl font-mono text-amber-400 font-bold">
        <span data-testid={`${testId}-value`}>{value}</span>
        {unit && <span className="text-sm ml-1">{unit}</span>}
      </p>
    </div>
  );

  return (
    <div
      data-testid="aggregate-stats-container"
      className="grid grid-cols-2 gap-4 md:grid-cols-4"
    >
      <StatCard
        title="Total Seek Time"
        value={totalSeekTime.toFixed(1)}
        unit="ms"
        testId="stat-total-seek-time"
      />
      <StatCard
        title="Avg Wait Time"
        value={avgWaitTime.toFixed(1)}
        unit="ms"
        testId="stat-avg-wait-time"
      />
      <StatCard
        title="Total Requests"
        value={totalRequests}
        testId="stat-total-requests"
      />
      <StatCard
        title="Throughput"
        value={throughput.toFixed(3)}
        unit="req/ms"
        testId="stat-throughput"
      />
    </div>
  );
};

export const PerRequestMetrics: React.FC = () => {
  const { state } = useSimulation();
  const [sortColumn, setSortColumn] = useState<SortColumn>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedRequests = [...state.completedRequests].sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;

    switch (sortColumn) {
      case 'id':
        aVal = a.id || '';
        bVal = b.id || '';
        break;
      case 'track':
        aVal = a.track;
        bVal = b.track;
        break;
      case 'arrival':
        aVal = a.arrivalTime;
        bVal = b.arrivalTime;
        break;
      case 'start':
        aVal = a.startTime || 0;
        bVal = b.startTime || 0;
        break;
      case 'complete':
        aVal = a.completionTime || 0;
        bVal = b.completionTime || 0;
        break;
      case 'waitTime':
        aVal = (a.startTime || 0) - a.arrivalTime;
        bVal = (b.startTime || 0) - b.arrivalTime;
        break;
      case 'serviceTime':
        aVal = (a.completionTime || 0) - (a.startTime || 0);
        bVal = (b.completionTime || 0) - (b.startTime || 0);
        break;
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    const numA = Number(aVal);
    const numB = Number(bVal);
    return sortDirection === 'asc' ? numA - numB : numB - numA;
  });

  if (state.completedRequests.length === 0) {
    return (
      <div data-testid="empty-state" className="text-center py-8">
        <p className="text-sm text-gray-400">No requests completed yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table data-testid="per-request-metrics-table" className="w-full text-sm">
        <thead>
          <tr className="border-b border-amber-600">
            <th className="px-4 py-2 text-left text-amber-500 font-semibold">
              <button
                data-testid="sort-header-id"
                onClick={() => handleSort('id')}
                data-sorted={sortColumn === 'id'}
                className="hover:text-amber-400 cursor-pointer"
              >
                Request ID
              </button>
            </th>
            <th className="px-4 py-2 text-left text-amber-500 font-semibold">
              <button
                data-testid="sort-header-Track"
                onClick={() => handleSort('track')}
                data-sorted={sortColumn === 'track'}
                className="hover:text-amber-400 cursor-pointer"
              >
                Track
              </button>
            </th>
            <th className="px-4 py-2 text-left text-amber-500 font-semibold">
              <button
                data-testid="sort-header-Arrival"
                onClick={() => handleSort('arrival')}
                data-sorted={sortColumn === 'arrival'}
                className="hover:text-amber-400 cursor-pointer"
              >
                Arrival
              </button>
            </th>
            <th className="px-4 py-2 text-left text-amber-500 font-semibold">
              <button
                data-testid="sort-header-Start"
                onClick={() => handleSort('start')}
                data-sorted={sortColumn === 'start'}
                className="hover:text-amber-400 cursor-pointer"
              >
                Start
              </button>
            </th>
            <th className="px-4 py-2 text-left text-amber-500 font-semibold">
              <button
                data-testid="sort-header-Complete"
                onClick={() => handleSort('complete')}
                data-sorted={sortColumn === 'complete'}
                className="hover:text-amber-400 cursor-pointer"
              >
                Complete
              </button>
            </th>
            <th className="px-4 py-2 text-left text-amber-500 font-semibold">
              <button
                data-testid="sort-header-WaitTime"
                onClick={() => handleSort('waitTime')}
                data-sorted={sortColumn === 'waitTime'}
                className="hover:text-amber-400 cursor-pointer"
              >
                Wait Time
              </button>
            </th>
            <th className="px-4 py-2 text-left text-amber-500 font-semibold">
              <button
                data-testid="sort-header-ServiceTime"
                onClick={() => handleSort('serviceTime')}
                data-sorted={sortColumn === 'serviceTime'}
                className="hover:text-amber-400 cursor-pointer"
              >
                Service Time
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRequests.map((req, idx) => {
            const waitTime = (req.startTime || 0) - req.arrivalTime;
            const serviceTime = (req.completionTime || 0) - (req.startTime || 0);
            return (
              <tr
                key={req.id}
                data-testid={`request-row-${req.id}`}
                className={`border-b border-gray-700 hover:bg-gray-800 ${
                  idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'
                }`}
              >
                <td className="px-4 py-2 text-gray-300 font-mono text-xs">{req.id}</td>
                <td className="px-4 py-2 text-gray-300 font-mono">{req.track}</td>
                <td className="px-4 py-2 text-gray-300 font-mono">
                  {req.arrivalTime.toFixed(1)}
                </td>
                <td className="px-4 py-2 text-gray-300 font-mono">
                  {(req.startTime || 0).toFixed(1)}
                </td>
                <td className="px-4 py-2 text-gray-300 font-mono">
                  {(req.completionTime || 0).toFixed(1)}
                </td>
                <td className="px-4 py-2 text-green-400 font-mono">{waitTime.toFixed(1)}</td>
                <td className="px-4 py-2 text-blue-400 font-mono">{serviceTime.toFixed(1)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export const MetricsPanel: React.FC = () => {
  const MemoAggregateStats = React.memo(AggregateStats)
  const MemoPerRequestMetrics = React.memo(PerRequestMetrics)

  return (
    <div
      data-testid="metrics-panel-container"
      className="w-full bg-gray-900 border-t border-amber-600 p-6"
    >
      <div className="flex flex-col space-y-6">
        <h2 className="text-lg font-semibold text-amber-500 uppercase tracking-wider">
          Simulation Metrics
        </h2>

        <MemoAggregateStats />
        <MemoPerRequestMetrics />
      </div>
    </div>
  );
};
