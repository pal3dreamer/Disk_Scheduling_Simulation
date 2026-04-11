import { Request } from '@/engine/types'

export interface Scenario {
  name: string
  description: string
  requests: Omit<Request, 'id' | 'arrivalTime'>[]
}

export const heavyLoadScenario: Scenario = {
  name: 'Heavy Load',
  description: '20 random requests, high queue pressure',
  requests: Array.from({ length: 20 }, () => ({
    track: Math.floor(Math.random() * 200),
  })),
}

export const clusteredScenario: Scenario = {
  name: 'Clustered Access',
  description: '15 requests in 3 regions (0-66, 67-133, 134-199)',
  requests: [
    ...Array.from({ length: 5 }, () => ({ track: Math.floor(Math.random() * 67) })),
    ...Array.from({ length: 5 }, () => ({ track: Math.floor(Math.random() * 67) + 67 })),
    ...Array.from({ length: 5 }, () => ({ track: Math.floor(Math.random() * 66) + 134 })),
  ],
}

export const randomScenario: Scenario = {
  name: 'Random Access',
  description: '10 random requests, uniform distribution',
  requests: Array.from({ length: 10 }, () => ({
    track: Math.floor(Math.random() * 200),
  })),
}

export const scenarios: Record<string, Scenario> = {
  'heavy-load': heavyLoadScenario,
  'clustered': clusteredScenario,
  'random': randomScenario,
}

export function getScenarioByKey(key: string): Scenario | null {
  return scenarios[key] || null
}
