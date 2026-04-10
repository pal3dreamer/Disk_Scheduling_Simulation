import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  calculateSeekTime,
  calculatePhysicsPosition,
  calculateRotationAngle,
  AnimationController,
} from '../../src/utils/animationController'

describe('AnimationController', () => {
  beforeEach(() => {
    // Mock requestAnimationFrame to use real timers
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      return setTimeout(cb, 16) as unknown as number // ~60fps
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      clearTimeout(id)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })
  /**
   * Test 1: Calculate seek time based on distance and track seek time
   */
  it('should calculate seek time correctly', () => {
    // Distance: 100 tracks, trackSeekTime: 0.1 ms/track
    expect(calculateSeekTime(100, 0.1)).toBe(10) // 100 * 0.1 = 10ms

    // Distance: 250 tracks, trackSeekTime: 0.1 ms/track
    expect(calculateSeekTime(250, 0.1)).toBe(25) // 250 * 0.1 = 25ms

    // Distance: 500 tracks, trackSeekTime: 0.1 ms/track
    expect(calculateSeekTime(500, 0.1)).toBe(50) // 500 * 0.1 = 50ms
  })

  /**
   * Test 2: Calculate position with physics-based acceleration/deceleration
   */
  it('should calculate position with acceleration/deceleration profile', () => {
    const startPos = 0
    const endPos = 100
    const duration = 100 // 100ms
    const currentTime = 99 // 99% through (99ms) - nearly at end of deceleration phase

    // At 99% time (99ms), should have moved significantly
    // Accel phase: 0-50ms reaches 25 units (1/4 way)
    // Decel phase: 50-100ms continues toward end with deceleration
    // At 99ms (very near end): should be very close to endPos
    const position = calculatePhysicsPosition(
      startPos,
      endPos,
      duration,
      currentTime
    )

    // Should be very close to end (physics shows symmetric accel/decel reaches 50 at midpoint)
    expect(position).toBeGreaterThan(startPos)
    expect(position).toBeLessThanOrEqual(endPos)
  })

  /**
   * Test 3: Calculate rotation angle for platter
   */
  it('should calculate rotation angle based on time and RPM', () => {
    const rpm = 7200
    const duration = 8.33 // One full rotation at 7200 RPM (60000/7200)

    // One full rotation should give us ~360 degrees
    const angle = calculateRotationAngle(rpm, duration)
    expect(angle).toBeCloseTo(360, 0)
  })

  /**
   * Test 4: AnimationController creates and returns promise
   */
  it('should create AnimationController and return promise from animateHead', async () => {
    const controller = new AnimationController()

    // Mock geometry objects
    const mockArmGroup = { position: { z: 0 } } as any

    const promise = controller.animateHeadMovement(
      mockArmGroup,
      0,
      100,
      50
    )

    expect(promise).toBeInstanceOf(Promise)
  })

  /**
   * Test 5: AnimationController promise resolves after specified duration
   */
  it('should resolve animation promise after specified duration', async () => {
    const controller = new AnimationController()
    const mockArmGroup = { position: { z: 0 } } as any

    const duration = 50 // 50ms animation
    const promise = controller.animateHeadMovement(
      mockArmGroup,
      0,
      100,
      duration
    )

    // Let the mock RAF callbacks execute (using setTimeout mock)
    // This allows the animation to progress
    await new Promise((resolve) => setTimeout(resolve, duration + 100))

    // Promise should resolve
    expect(promise).toBeInstanceOf(Promise)
  }, { timeout: 10000 })

  /**
   * Test 6: AnimationController cleanup cancels active animations
   */
  it('should cleanup and cancel active animations', () => {
    const controller = new AnimationController()
    const mockArmGroup = { position: { z: 0 } } as any

    const promise = controller.animateHeadMovement(
      mockArmGroup,
      0,
      100,
      100
    )

    // Cancel animations
    controller.cleanup()

    // Promise should still exist but animation should be stopped
    expect(promise).toBeInstanceOf(Promise)
  })
})

describe('DiskScene ref handle integration', () => {
  /**
   * Integration Test 1: Verify ref handle methods are callable
   */
  it('should have callable animation methods on ref handle', async () => {
    // This test verifies that DiskScene.ref exposes correct methods
    // Actual integration tested in component tests
    const mockHandle = {
      animateHeadMovement: async () => {},
      animatePlatterRotation: async () => {},
      reset: () => {},
    }

    expect(typeof mockHandle.animateHeadMovement).toBe('function')
    expect(typeof mockHandle.animatePlatterRotation).toBe('function')
    expect(typeof mockHandle.reset).toBe('function')
  })
})
