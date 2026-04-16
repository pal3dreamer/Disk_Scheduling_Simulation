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
    <div data-testid={testId} className="card-accent p-3 flex flex-col space-y-1">
      <h4 className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
        {title}
      </h4>
      <p className="text-xl font-mono text-cyan-400 font-bold">
        <span data-testid={`${testId}-value`}>{value}</span>
        {unit && <span className="text-[10px] ml-1 text-slate-500 font-normal">{unit}</span>}
      </p>
    </div>
  );

  return (
    <div
      data-testid="aggregate-stats-container"
      className="grid grid-cols-2 gap-3"
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
      <div data-testid="empty-state" className="text-center py-4 border border-dashed border-slate-800 rounded">
        <p className="text-[10px] text-slate-500 italic">No requests completed yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Completed Requests</span>
        <div className="flex space-x-2">
           <button onClick={() => handleSort('track')} className={`text-[8px] uppercase font-bold ${sortColumn === 'track' ? 'text-cyan-400' : 'text-slate-600'}`}>Track</button>
           <button onClick={() => handleSort('waitTime')} className={`text-[8px] uppercase font-bold ${sortColumn === 'waitTime' ? 'text-cyan-400' : 'text-slate-600'}`}>Wait</button>
        </div>
      </div>
      <div className="flex flex-col space-y-2 max-h-64 overflow-y-auto pr-1">
        {sortedRequests.map((req) => {
          const waitTime = (req.startTime || 0) - req.arrivalTime;
          return (
            <div
              key={req.id}
              data-testid={`request-row-${req.id}`}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded flex justify-between items-center group hover:border-slate-600 transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-xs font-mono text-slate-200">Track {req.track}</span>
                <span className="text-[8px] text-slate-600 uppercase font-mono">{req.id.split('-')[0]}</span>
              </div>
              <div className="flex space-x-4 text-right">
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-500 uppercase font-bold">Wait</span>
                  <span className="text-[10px] font-mono text-green-400">{waitTime.toFixed(1)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-500 uppercase font-bold">Time</span>
                  <span className="text-[10px] font-mono text-blue-400">{req.completionTime?.toFixed(1)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const MetricsPanel: React.FC = () => {
  const MemoAggregateStats = React.memo(AggregateStats)
  const MemoPerRequestMetrics = React.memo(PerRequestMetrics)

  return (
    <div
      data-testid="metrics-panel-container"
      className="w-full bg-slate-900 border-t border-slate-700 p-6 mt-auto"
    >
      <div className="flex flex-col space-y-6">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
          Simulation Metrics
        </h2>

        <MemoAggregateStats />
        <MemoPerRequestMetrics />
      </div>
    </div>
  );
};
