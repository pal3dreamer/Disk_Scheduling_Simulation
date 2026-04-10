/**
 * Helper utilities for DiskArmGeometry positioning and LED effects
 */

export type LEDState = 'idle' | 'active' | 'completed'

/**
 * Map track number to Z-axis position on arm
 * 
 * Formula: z = (trackNumber / diskSize) * (diskSize / 2)
 * - Track 0 → Z = 0 (pivot/center)
 * - Track 250 → Z = 125 (halfway)
 * - Track 500 → Z = 250 (edge)
 * 
 * @param trackNumber Track position (0-diskSize)
 * @param diskSize Total disk size (e.g., 500)
 * @returns Z position in scene units
 */
export function trackToZPosition(trackNumber: number, diskSize: number): number {
  return (trackNumber / diskSize) * (diskSize / 2)
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
