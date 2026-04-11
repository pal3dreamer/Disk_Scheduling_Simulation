import { describe, it, expect } from 'vitest'
import { scenarios, getScenarioByKey } from '@/data/scenarioPresets'

describe('Scenario Presets', () => {
  it('should have heavy-load scenario with 20 requests', () => {
    const scenario = scenarios['heavy-load']
    expect(scenario).toBeDefined()
    expect(scenario.requests).toHaveLength(20)
  })

  it('should have clustered scenario with 15 requests', () => {
    const scenario = scenarios['clustered']
    expect(scenario).toBeDefined()
    expect(scenario.requests).toHaveLength(15)
  })

  it('should have random scenario with 10 requests', () => {
    const scenario = scenarios['random']
    expect(scenario).toBeDefined()
    expect(scenario.requests).toHaveLength(10)
  })

  it('getScenarioByKey should return scenario or null', () => {
    expect(getScenarioByKey('heavy-load')).toBeDefined()
    expect(getScenarioByKey('invalid')).toBeNull()
  })

  it('all requests should have valid track numbers (0-500)', () => {
    for (const scenario of Object.values(scenarios)) {
      for (const req of scenario.requests) {
        expect(req.track).toBeGreaterThanOrEqual(0)
        expect(req.track).toBeLessThanOrEqual(500)
      }
    }
  })
})
