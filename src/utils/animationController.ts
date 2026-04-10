/**
 * Animation controller with physics-based easing for disk simulator
 * Provides smooth head movement and platter rotation with acceleration profiles
 */

import * as THREE from 'three'

/**
 * Calculate seek time based on distance and track seek time
 * 
 * @param distance Distance in tracks
 * @param trackSeekTime Time per track in milliseconds
 * @returns Seek time in milliseconds
 */
export function calculateSeekTime(
  distance: number,
  trackSeekTime: number
): number {
  return distance * trackSeekTime
}

/**
 * Calculate position with physics-based acceleration/deceleration
 * 
 * Movement profile:
 * - Phase 1 (0 → duration/2): Acceleration from 0 to vMax
 * - Phase 2 (duration/2 → duration): Deceleration from vMax to 0
 * 
 * @param startPos Starting position
 * @param endPos Ending position
 * @param duration Total animation duration in milliseconds
 * @param currentTime Elapsed time in milliseconds
 * @returns Interpolated position
 */
export function calculatePhysicsPosition(
  startPos: number,
  endPos: number,
  duration: number,
  currentTime: number
): number {
  const distance = endPos - startPos
  const halfDuration = duration / 2
  const acceleration = (2 * distance) / (duration * duration)

  let position: number

  if (currentTime <= halfDuration) {
    // Acceleration phase: s = 0.5 * a * t²
    position = startPos + 0.5 * acceleration * currentTime * currentTime
  } else {
    // Deceleration phase
    // Distance covered in accel phase
    const accelDistance = 0.5 * acceleration * halfDuration * halfDuration
    // Time into decel phase
    const decelTime = currentTime - halfDuration
    // Distance covered in decel phase: s = v*t - 0.5*a*t²
    // where v = a*halfDuration (velocity at end of accel)
    const velocity = acceleration * halfDuration
    const decelDistance =
      velocity * decelTime - 0.5 * acceleration * decelTime * decelTime
    position = startPos + accelDistance + decelDistance
  }

  // Clamp to end position
  return Math.min(Math.max(position, startPos), endPos)
}

/**
 * Calculate rotation angle for platter based on time and RPM
 * 
 * @param rpm Revolutions per minute (e.g., 7200)
 * @param durationMs Animation duration in milliseconds
 * @returns Rotation angle in degrees
 */
export function calculateRotationAngle(rpm: number, durationMs: number): number {
  const fullRotationTime = 60000 / rpm // Time for one full rotation in ms
  const rotations = durationMs / fullRotationTime
  return rotations * 360 // Return degrees
}

/**
 * Animation controller for managing smooth animations with promises
 */
export class AnimationController {
  private animationFrameId: number | null = null
  private isAnimating = false

  /**
   * Animate head movement from current position to target
   * 
   * @param armGroup Three.js group object with position.z property
   * @param fromTrack Starting track position
   * @param toTrack Ending track position
   * @param durationMs Animation duration in milliseconds
   * @returns Promise that resolves when animation completes
   */
  public animateHeadMovement(
    armGroup: any,
    fromTrack: number,
    toTrack: number,
    durationMs: number
  ): Promise<void> {
    return new Promise((resolve) => {
      if (this.isAnimating) {
        this.cancelAnimation()
      }

      this.isAnimating = true
      const startTime = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime

        if (elapsed >= durationMs) {
          // Animation complete
          armGroup.position.z = toTrack
          this.isAnimating = false
          this.animationFrameId = null
          resolve()
        } else {
          // Update position
          const fromZ = fromTrack
          const toZ = toTrack
          const newZ = calculatePhysicsPosition(
            fromZ,
            toZ,
            durationMs,
            elapsed
          )
          armGroup.position.z = newZ

          this.animationFrameId = requestAnimationFrame(animate)
        }
      }

      this.animationFrameId = requestAnimationFrame(animate)
    })
  }

  /**
   * Animate platter rotation
   * 
   * @param platterGroup Three.js group object with rotation.y property
   * @param startAngle Starting rotation angle in degrees
   * @param endAngle Ending rotation angle in degrees
   * @param durationMs Animation duration in milliseconds
   * @returns Promise that resolves when animation completes
   */
  public animatePlatterRotation(
    platterGroup: any,
    startAngle: number,
    endAngle: number,
    durationMs: number
  ): Promise<void> {
    return new Promise((resolve) => {
      if (this.isAnimating) {
        this.cancelAnimation()
      }

      this.isAnimating = true
      const startTime = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / durationMs, 1)

        // Linear rotation (not physics-based)
        const angle = startAngle + (endAngle - startAngle) * progress

        // Convert degrees to radians for Three.js
        platterGroup.rotation.y = THREE.MathUtils.degToRad(angle)

        if (progress >= 1) {
          this.isAnimating = false
          this.animationFrameId = null
          resolve()
        } else {
          this.animationFrameId = requestAnimationFrame(animate)
        }
      }

      this.animationFrameId = requestAnimationFrame(animate)
    })
  }

  /**
   * Cancel active animation
   */
  private cancelAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    this.isAnimating = false
  }

  /**
   * Cleanup - cancel any active animations
   */
  public cleanup(): void {
    this.cancelAnimation()
  }

  /**
   * Reset controller state
   */
  public reset(): void {
    this.cleanup()
  }
}
