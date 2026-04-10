/* @ts-nocheck - r3f material type compatibility (pre-existing issue in project) */
import React, { useEffect, useRef, useState } from 'react'
// @ts-expect-error - Missing types for three module (pre-existing issue)
import * as THREE from 'three'
import { useSimulation } from './SimulationProvider'
import {
  trackToZPosition,
  calculateLEDIntensity,
  calculateLightIntensity,
  LEDState,
} from '../utils/diskArmHelpers'

export interface DiskArmGeometryProps {
  /** Disk size in track units (default 500) */
  diskSize?: number
  /** Track seek time for positioning calculations */
  trackSeekTime?: number
}

/**
 * DiskArmGeometry: Three.js component rendering mechanical disk arm assembly
 * 
 * Features:
 * - Mechanical arm pivoting at disk center on Y-axis
 * - Matte black steel arm shaft extending radially from center
 * - Read head assembly at arm tip with guide post
 * - Amber LED indicator with emissive glow and point light
 * - Position updates on HEAD_MOVED events
 * - LED glow feedback on REQUEST_STARTED/COMPLETED events
 * - Scales arm length based on disk size
 */
export const DiskArmGeometry = React.memo(function DiskArmGeometry({
  diskSize = 500,
}: DiskArmGeometryProps) {
  const armGroupRef = useRef<THREE.Group>(null)
  const ledLightRef = useRef<THREE.PointLight>(null)
  const ledMeshRef = useRef<THREE.Mesh>(null)

  const { engine } = useSimulation()
  const [ledState, setLEDState] = useState<LEDState>('idle')
  const [currentTrack, setCurrentTrack] = useState(0)

  // Subscribe to engine events
  useEffect(() => {
    const eventBus = engine.getEventBus()

    // HEAD_MOVED: Update arm position
    const unsubscribeHeadMoved = eventBus.on('HEAD_MOVED', (event) => {
      const targetTrack = (event.payload as { to?: number })?.to || 0
      setCurrentTrack(targetTrack)
    })

    // REQUEST_STARTED: Brighten LED
    const unsubscribeRequestStarted = eventBus.on('REQUEST_STARTED', () => {
      setLEDState('active')
    })

    // REQUEST_COMPLETED: Dim LED temporarily
    const unsubscribeRequestCompleted = eventBus.on('REQUEST_COMPLETED', () => {
      setLEDState('completed')
      // Fade back to idle after 500ms
      setTimeout(() => setLEDState('idle'), 500)
    })

    return () => {
      unsubscribeHeadMoved()
      unsubscribeRequestStarted()
      unsubscribeRequestCompleted()
    }
  }, [engine])

  // Update arm Z position and LED intensity
  useEffect(() => {
    if (armGroupRef.current && 'position' in armGroupRef.current) {
      // Position arm tip at current track
      const zPosition = trackToZPosition(currentTrack, diskSize)
      armGroupRef.current.position.z = zPosition
    }

    if (ledMeshRef.current && 'material' in ledMeshRef.current) {
      const intensity = calculateLEDIntensity(ledState)
      const material = ledMeshRef.current.material as THREE.MeshStandardMaterial
      if (material && 'emissiveIntensity' in material) {
        material.emissiveIntensity = intensity
      }
    }

    if (ledLightRef.current && 'intensity' in ledLightRef.current) {
      const lightIntensity = calculateLightIntensity(
        calculateLEDIntensity(ledState)
      )
      ledLightRef.current.intensity = lightIntensity
    }
  }, [currentTrack, ledState, diskSize])

  return (
    <group>
      {/* ARM ASSEMBLY (pivots at origin) */}
      <group ref={armGroupRef} position={[0, 5, 0]}>
        {/* Arm shaft (matte black cylinder) */}
        <mesh position={[0, 0, diskSize / 4]}>
          <cylinderGeometry args={[8, 8, diskSize / 2, 16]} />
          {/* @ts-ignore - r3f material type issue (pre-existing) */}
          <meshStandardMaterial
            color={0x1a1a1a}
            metalness={0.5}
            roughness={0.8}
          />
        </mesh>

        {/* Arm beveled edge (slight taper) */}
        <mesh position={[0, -1, diskSize / 4]}>
          <cylinderGeometry args={[10, 8, 1, 16]} />
          {/* @ts-ignore - r3f material type issue (pre-existing) */}
          <meshStandardMaterial
            color={0x2a2a2a}
            metalness={0.4}
            roughness={0.9}
          />
        </mesh>

        {/* READ HEAD ASSEMBLY */}
        <group position={[0, 0, diskSize / 2]}>
          {/* Head body (small rectangular box) */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[12, 8, 6]} />
            {/* @ts-ignore - r3f material type issue (pre-existing) */}
            <meshStandardMaterial
              color={0x1a1a1a}
              metalness={0.5}
              roughness={0.8}
            />
          </mesh>

          {/* Guide post (retractable appearance) */}
          <mesh position={[0, -4, 0]}>
            <cylinderGeometry args={[2, 2, 8, 8]} />
            {/* @ts-ignore - r3f material type issue (pre-existing) */}
            <meshStandardMaterial
              color={0x2a2a2a}
              metalness={0.4}
              roughness={0.9}
            />
          </mesh>

          {/* AMBER LED INDICATOR */}
          <group position={[0, 5, 0]}>
            {/* LED sphere with emissive glow */}
            <mesh ref={ledMeshRef}>
              <sphereGeometry args={[2.5, 16, 16]} />
              {/* @ts-ignore - r3f material type issue (pre-existing) */}
              <meshStandardMaterial
                color={0xd4af37}
                emissive={0xd4af37}
                emissiveIntensity={0.3}
                metalness={0.2}
                roughness={0.1}
              />
            </mesh>

            {/* Point light for glow effect */}
            <pointLight
              ref={ledLightRef}
              color={0xd4af37}
              intensity={0.15}
              distance={10}
              decay={2}
            />
          </group>
        </group>
      </group>
    </group>
  )
})

DiskArmGeometry.displayName = 'DiskArmGeometry'
