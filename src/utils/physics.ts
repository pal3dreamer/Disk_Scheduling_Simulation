export function calculateSeekTime(
  fromTrack: number,
  toTrack: number,
  trackSeekTime: number
): number {
  const distance = Math.abs(toTrack - fromTrack)
  return distance * trackSeekTime
}

export function getFullRotationTime(rpm: number): number {
  return 60000 / rpm // milliseconds
}

export function calculateRotationalLatency(rpm: number): number {
  const fullRot = getFullRotationTime(rpm)
  return Math.random() * fullRot
}

export function getDegreesPerMs(rpm: number): number {
  return 360 / getFullRotationTime(rpm)
}

export function calculateTotalServiceTime(
  fromTrack: number,
  toTrack: number,
  trackSeekTime: number,
  rpm: number
): number {
  const seekTime = calculateSeekTime(fromTrack, toTrack, trackSeekTime)
  const rotLatency = calculateRotationalLatency(rpm)
  return seekTime + rotLatency
}
