/**
 * Animation handle for imperative control of disk scene elements
 * Allows parent components to trigger head/platter animations
 */
export interface DiskSceneHandle {
  /**
   * Animate disk head movement from current track to target track
   * @param fromTrack Current track position (0-500)
   * @param toTrack Target track position (0-500)
   * @param durationMs Animation duration in milliseconds
   * @returns Promise that resolves when animation completes
   */
  animateHeadMovement(
    fromTrack: number,
    toTrack: number,
    durationMs: number
  ): Promise<void>

  /**
   * Animate disk platter rotation
   * @param angle Rotation angle in degrees
   * @param durationMs Animation duration in milliseconds
   * @returns Promise that resolves when animation completes
   */
  animatePlatterRotation(angle: number, durationMs: number): Promise<void>

  /**
   * Reset scene to initial state (camera, lights, positions)
   */
  reset(): void
}

/**
 * Props for DiskScene component
 */
export interface DiskSceneProps {
  /**
   * Container width in pixels for canvas
   * Canvas renders at fixed 1280×720, scaled to fill container
   */
  containerWidth?: number
  /**
   * Container height in pixels for canvas
   * Canvas renders at fixed 1280×720, scaled to fill container
   */
  containerHeight?: number
}
