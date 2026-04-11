/**
 * Helper utilities for DiskArmGeometry positioning and LED effects
 */

export type LEDState = 'idle' | 'active' | 'completed'

/**
 * Map track number to Z-axis position on arm
 * 
 * The disk has 200 tracks (0-199)
 * We map these to the disk radius, but CLAMP to stay within bounds
 * 
 * Formula: z = (trackNumber / 200) * diskSize * 0.95
 * - Track 0 → Z = 0 (pivot/center)
 * - Track 100 → Z = diskSize * 0.475 (halfway, with 5% margin)
 * - Track 199 → Z = diskSize * 0.9425 (near edge, with 5% margin)
 * 
 * The 0.95 factor ensures arm never goes past disk edge
 * 
 * @param trackNumber Track position (0-199)
 * @param diskSize Total disk size (e.g., 300)
 * @returns Z position in scene units (clamped to disk radius)
 */
export function trackToZPosition(trackNumber: number, diskSize: number): number {
  // Map track 0-199 to position 0 to (diskSize * 0.95) to stay within bounds
  const maxTrack = 200
  const maxPosition = diskSize * 0.95 // 95% of radius to ensure we don't exceed disk
  return (trackNumber / maxTrack) * maxPosition
}

/**
 * Calculate LED emissive intensity based on request state
 * 
 * @param state Request state: 'idle' | 'active' | 'completed'
 * @returns Emissive intensity (0-1)
 */
export function calculateLEDIntensity(state: LEDState): number {
  switch (state) {
    case 'idle':
      return 0.3 // Subtle glow when idle
    case 'active':
      return 1.0 // Bright glow when servicing request
    case 'completed':
      return 0.5 // Medium glow after completion
    default:
      return 0.3
  }
}

/**
 * Calculate point light intensity for LED glow
 * 
 * @param ledIntensity LED emissive intensity (0-1)
 * @returns Point light intensity for glow effect (0-1)
 */
export function calculateLightIntensity(ledIntensity: number): number {
  return ledIntensity * 0.5 // Point light is 50% of emissive intensity
}
