/**
 * Helper utilities for DiskGeometry track generation
 */

export interface TrackRing {
  trackNumber: number
  radius: number
  color: string
}

export interface GradientZone {
  zone: number
  trackStart: number
  trackEnd: number
  color: string
  innerRadius: number
  outerRadius: number
}

/**
 * Generate major track rings at intervals
 * @param diskSize Total disk size (e.g., 500 for 500 tracks)
 * @returns Array of track ring definitions
 */
export function generateTrackRings(diskSize: number): TrackRing[] {
  const rings: TrackRing[] = []
  const interval = diskSize / 5 // 5 major rings for 500 tracks = every 100

  for (let i = 0; i < 5; i++) {
    const trackNumber = Math.round(i * interval)
    const radius = (trackNumber / diskSize) * diskSize // Map track to radius
    
    rings.push({
      trackNumber,
      radius,
      color: '#d4af37', // Bright amber for visibility
    })
  }

  return rings
}

/**
 * Generate gradient zones between major tracks
 * @param diskSize Total disk size
 * @returns Array of gradient zone definitions
 */
export function generateGradientZones(diskSize: number): GradientZone[] {
  const zones: GradientZone[] = []
  const zoneColors = [
    '#0d3d66', // Zone 1 (tracks 0-100): deep blue
    '#1a5a99', // Zone 2 (tracks 100-200): medium-deep blue
    '#2a7fcc', // Zone 3 (tracks 200-300): bright blue
    '#3a9dff', // Zone 4 (tracks 300-400): very bright blue
    '#4daaff', // Zone 5 (tracks 400-500): bright cyan-blue
  ]

  for (let z = 0; z < 5; z++) {
    const trackStart = (z * diskSize) / 5
    const trackEnd = ((z + 1) * diskSize) / 5
    const innerRadius = (trackStart / diskSize) * diskSize
    const outerRadius = (trackEnd / diskSize) * diskSize

    zones.push({
      zone: z + 1,
      trackStart,
      trackEnd,
      color: zoneColors[z],
      innerRadius,
      outerRadius,
    })
  }

  return zones
}

/**
 * Calculate radius for a given track number
 * @param trackNumber Track position (0-diskSize)
 * @param diskSize Total disk size
 * @returns 3D radius in scene units
 */
export function trackToRadius(trackNumber: number, diskSize: number): number {
  return (trackNumber / diskSize) * diskSize
}
