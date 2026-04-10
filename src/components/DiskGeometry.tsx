import React, { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useSimulation } from './SimulationProvider'
import {
  generateTrackRings,
  generateGradientZones,
} from '../utils/diskGeometryHelpers'

export interface DiskGeometryProps {
  /** Disk size in track units (default 500) */
  diskSize?: number
  /** Show track detail (gradient bands and rings) */
  showTrackDetail?: boolean
  /** Optional: current track position for highlighting */
  currentTrack?: number
}

/**
 * DiskGeometry: Three.js component rendering disk platter and spindle hub
 * 
 * Features:
 * - Flat cylinder platter with metallic material
 * - 5 major track rings at intervals (0, 100, 200, 300, 400, 500)
 * - 5 gradient zones showing track density
 * - Decorative spindle hub with beveled edges and rotation indicator
 * - Amber metallic spindle for industrial aesthetic
 * - Continuous rotation on Y-axis based on engine platterAngle
 * - Event subscription to PLATTER_ROTATED for animation coordination
 */
export const DiskGeometry = React.memo(function DiskGeometry({
  diskSize = 500,
  showTrackDetail = true,
}: DiskGeometryProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { state, engine } = useSimulation()

  // Generate track rings and gradient zones
  const trackRings = useMemo(() => generateTrackRings(diskSize), [diskSize])
  const gradientZones = useMemo(
    () => generateGradientZones(diskSize),
    [diskSize]
  )

  // Subscribe to platter rotation events
  useEffect(() => {
    const eventBus = engine.getEventBus()
    const unsubscribe = eventBus.on('PLATTER_ROTATED', () => {
      // Rotation angle will be applied via group rotation
      // Updated on each PLATTER_ROTATED event
    })

    return () => unsubscribe()
  }, [engine])

  // Update group rotation based on engine state
  useEffect(() => {
    if (
      groupRef.current &&
      state.platterAngle !== undefined &&
      'rotation' in groupRef.current
    ) {
      groupRef.current.rotation.y = THREE.MathUtils.degToRad(state.platterAngle)
    }
  }, [state.platterAngle])

  return (
    <group ref={groupRef}>
      {/* PLATTER BASE */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[diskSize, diskSize, 2, 64]} />
        <meshStandardMaterial
          color={0x888888}
          metalness={0.7}
          roughness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* GRADIENT ZONES (visible bands showing track density) */}
      {showTrackDetail &&
        gradientZones.map((zone) => (
          <mesh
            key={`zone-${zone.zone}`}
            position={[0, 0.01, 0]}
          >
            <cylinderGeometry
              args={[
                zone.outerRadius,
                zone.outerRadius,
                1,
                64,
                1,
                true,
                0,
                Math.PI * 2,
              ]}
            />
            <meshBasicMaterial
              color={zone.color}
              side={THREE.DoubleSide}
              transparent
              opacity={0.6}
            />
          </mesh>
        ))}

      {/* TRACK RINGS (concentric lines at major tracks) */}
      {showTrackDetail &&
        trackRings.map((ring) => {
          // Create line geometry for each track ring
          const geometry = new THREE.BufferGeometry()
          const points = []
          const segments = 64

          for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2
            const x = Math.cos(angle) * ring.radius
            const z = Math.sin(angle) * ring.radius
            points.push(new THREE.Vector3(x, 0.02, z))
          }

          geometry.setFromPoints(points)

          return (
            <lineSegments key={`ring-${ring.trackNumber}`} geometry={geometry}>
              <lineBasicMaterial color={ring.color} linewidth={2} />
            </lineSegments>
          )
        })}

      {/* SPINDLE HUB (decorative center hub with rotation indicator) */}
      <group position={[0, 1, 0]}>
        {/* Hub base cylinder */}
        <mesh>
          <cylinderGeometry args={[50, 50, 20, 32]} />
          <meshStandardMaterial
            color={0xd4af37}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Rotation indicator groove (vertical rectangle) */}
        <mesh position={[0, 10, 0]}>
          <boxGeometry args={[4, 12, 2]} />
          <meshStandardMaterial
            color={0xa0860f}
            metalness={0.85}
            roughness={0.15}
          />
        </mesh>

        {/* Beveled edge indicator (slight visual tapering) */}
        <mesh>
          <cylinderGeometry args={[52, 50, 1, 32]} />
          <meshStandardMaterial
            color={0xf0c040}
            metalness={0.95}
            roughness={0.05}
          />
        </mesh>
      </group>
    </group>
  )
})

DiskGeometry.displayName = 'DiskGeometry'
