import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SimulationEngine, EngineConfig } from '@/engine/SimulationEngine';
import { SimulationState, SimulationEvent, EventType } from '@/engine/types';

interface SimulationContextType {
  engine: SimulationEngine;
  state: SimulationState;
  eventLog: SimulationEvent[];
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export interface SimulationProviderProps {
  children: ReactNode;
  engineConfig?: Partial<EngineConfig>;
}

export const SimulationProvider: React.FC<SimulationProviderProps> = ({
  children,
  engineConfig = {},
}) => {
  const [engine] = useState(() => {
    const config: EngineConfig = {
      algorithm: 'FCFS',
      diskSize: 200,
      trackSeekTime: 0.1,
      platterRPM: 7200,
      ...engineConfig,
    };
    return new SimulationEngine(config);
  });

  const [state, setState] = useState<SimulationState>(engine.getState());
  const [eventLog, setEventLog] = useState<SimulationEvent[]>([]);

  useEffect(() => {
    // Subscribe to simulation events
    const eventBus = engine.getEventBus();

    // Create handlers for each event type to update state
    const handleStateChange = (event: SimulationEvent) => {
      setEventLog((prev) => [...prev, event]);
      setState(engine.getState());
    };

    // Subscribe to all relevant event types
    const eventTypes: EventType[] = [
      'REQUEST_QUEUED',
      'HEAD_MOVED',
      'REQUEST_COMPLETED',
      'REQUEST_STARTED',
      'PLATTER_ROTATED',
    ];

    const unsubscribers = eventTypes.map((eventType) => eventBus.on(eventType, handleStateChange));

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [engine]);

  const value: SimulationContextType = {
    engine,
    state,
    eventLog,
  };

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
};

export const useSimulation = (): SimulationContextType => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within SimulationProvider');
  }
  return context;
};
