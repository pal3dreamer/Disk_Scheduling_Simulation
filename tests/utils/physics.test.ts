import { describe, it, expect } from 'vitest'
import { calculateSeekTime, calculateRotationalLatency, getFullRotationTime } from '@/utils/physics'

describe('Physics Calculations', () => {
  it('should calculate seek time correctly', () => {
    const seekTime = calculateSeekTime(0, 100, 0.1)
    expect(seekTime).toBe(10) // 100 tracks * 0.1 ms/track
  })

  it('should handle zero distance seek', () => {
    const seekTime = calculateSeekTime(50, 50, 0.1)
    expect(seekTime).toBe(0)
  })

  it('should calculate full rotation time', () => {
    const rotTime = getFullRotationTime(7200)
    expect(rotTime).toBeCloseTo(8.333, 2) // 60000 / 7200
  })

  it('should generate rotational latency between 0 and full rotation', () => {
    for (let i = 0; i < 10; i++) {
      const latency = calculateRotationalLatency(7200)
      const fullRot = getFullRotationTime(7200)
      expect(latency).toBeGreaterThanOrEqual(0)
      expect(latency).toBeLessThanOrEqual(fullRot)
    }
  })
})
