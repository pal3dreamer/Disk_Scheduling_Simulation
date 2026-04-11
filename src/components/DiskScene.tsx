import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulation } from './SimulationProvider'
import { DiskGeometry } from './DiskGeometry'
import { DiskArmGeometry } from './DiskArmGeometry'
import type { DiskSceneHandle, DiskSceneProps } from '../types/diskScene'
import { AnimationController } from '../utils/animationController'

/**
 * Loading fallback UI for DiskScene
 * Displays animated spinner while Three.js scene initializes
 */
export const DiskSceneFallback = () => (
  <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-500 border-t-transparent mx-auto mb-4"></div>
      <p className="text-slate-400 text-sm">Initializing visualization...</p>
    </div>
  </div>
)

/**
 * Internal Three.js scene setup component
 * Manages camera, lighting, and fog
 */
function SceneContent() {
  const { camera, gl } = useThree()

  useEffect(() => {
    // Get actual canvas dimensions for aspect ratio
    const width = gl.domElement.clientWidth
    const height = gl.domElement.clientHeight
    const aspectRatio = (width || 1280) / (height || 720)

    // Ensure we have a PerspectiveCamera
    const perspCamera = camera as THREE.PerspectiveCamera
    if (!perspCamera.fov) {
      console.error('Expected PerspectiveCamera but got:', camera.type)
      return
    }

    // Camera setup: isometric 3/4 view looking DOWN at disk
    // Position camera MUCH farther back to show full disk with padding
    // Disk platter is 500 units radius, so we need SIGNIFICANT distance
    camera.position.set(800, 700, 800)
    camera.lookAt(0, 0, 0) // Look at disk center (origin)

    // FOV adjusted for proper framing
    perspCamera.fov = 45
    perspCamera.aspect = aspectRatio
    perspCamera.near = 1
    perspCamera.far = 5000
    perspCamera.updateProjectionMatrix()
  }, [camera, gl])

  return (
    <>
      {/* Ambient light - bright white base */}
      <ambientLight intensity={0.7} color={0xffffff} />

      {/* Key light (directional) - VERY BRIGHT white from top-left-front */}
      <directionalLight
        intensity={2.2}
        color={0xffffff}
        position={[600, 700, 600]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-1000}
        shadow-camera-right={1000}
        shadow-camera-top={1000}
        shadow-camera-bottom={-1000}
      />

      {/* Fill light (directional) - bright cyan from opposite side */}
      <directionalLight
        intensity={1.2}
        color={0x00ffff}
        position={[-500, 400, -500]}
      />

      {/* Back/rim light - BRIGHT amber from back for edge definition */}
      <directionalLight
        intensity={1.5}
        color={0xffd700}
        position={[0, 300, -800]}
      />

      {/* Fog: linear ramp 300-2000 units, color matches secondary UI (#1a1f3a) */}
      <fog attach="fog" args={[0x1a1f3a, 300, 2000]} />

      {/* Disk Platter & Spindle Hub (Task 23) */}
      <DiskGeometry diskSize={300} showTrackDetail={true} />

      {/* Mechanical Arm & Read Head (Task 24) */}
      <DiskArmGeometry diskSize={300} trackSeekTime={0.1} />
    </>
  )
}

/**
 * DiskScene: Main react-three-fiber component
 * Provides 3D rendering foundation for disk scheduling simulator
 *
 * Features:
 * - Fixed 1280×720 internal resolution
 * - Isometric 3/4 camera view
 * - Three-point lighting (ambient + directional + AO-ready)
 * - Linear fog for depth cueing
 * - Event subscription infrastructure
 * - Imperative animation handle
 */
export const DiskScene = forwardRef<DiskSceneHandle, DiskSceneProps>(
  function DiskSceneComponent(_props: DiskSceneProps, ref) {
    const { engine } = useSimulation()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const controllerRef = useRef(new AnimationController())
    const containerRef = useRef<HTMLDivElement>(null)

    // Update container resize handling
    React.useEffect(() => {
      const container = containerRef.current
      if (!container) return

      // Watch for resize
      const observer = new ResizeObserver(() => {
        // Canvas will automatically adjust via Three.js
      })
      observer.observe(container)

      return () => observer.disconnect()
    }, [])

    // Imperative handle for parent-controlled animations
    useImperativeHandle(
      ref,
      () => ({
        async animateHeadMovement(
          fromTrack: number,
          toTrack: number,
          durationMs: number
        ): Promise<void> {
          // Get arm group ref from DiskArmGeometry (will be passed via ref in Step 3)
          // For now, this is a stub that will be connected in integration
          await controllerRef.current.animateHeadMovement(
            { position: { z: 0 } } as any, // Placeholder
            fromTrack,
            toTrack,
            durationMs
          )
        },

        async animatePlatterRotation(
          angle: number,
          durationMs: number
        ): Promise<void> {
          // Get platter group ref from DiskGeometry (will be passed via ref in Step 3)
          // For now, this is a stub that will be connected in integration
          await controllerRef.current.animatePlatterRotation(
            { rotation: { y: 0 } } as any, // Placeholder
            0,
            angle,
            durationMs
          )
        },

        reset(): void {
          controllerRef.current.reset()
        },
      }),
      []
    )

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        controllerRef.current.cleanup()
      }
    }, [])

    // Subscribe to engine events for animation coordination (for future integration)
    useEffect(() => {
      const eventBus = engine.getEventBus()

      // HEAD_MOVED event: triggers head animation
      // @ts-ignore - event will be used in full integration
      const unsubscribeHeadMoved = eventBus.on('HEAD_MOVED', (event) => {
        // Event payload: { from, to, distance, duration }
        // Animation will be triggered by handle method
      })

      // PLATTER_ROTATED event: triggers platter animation
      // @ts-ignore - event will be used in full integration
      const unsubscribePlatterRotated = eventBus.on('PLATTER_ROTATED', (event) => {
        // Event payload: { angle, duration }
        // Animation will be triggered by handle method
      })

      // REQUEST_COMPLETED event: visual feedback
      const unsubscribeRequestCompleted = eventBus.on(
        'REQUEST_COMPLETED',
        // @ts-ignore - event will be used in full integration
        (event) => {
          // Event payload: { request }
          // Could highlight completed request in visualization
        }
      )

      // Cleanup on unmount
      return () => {
        unsubscribeHeadMoved()
        unsubscribePlatterRotated()
        unsubscribeRequestCompleted()
      }
    }, [engine])

    return (
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        <Canvas
          ref={canvasRef}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          // Fixed resolution: render at 1280×720, scale to container
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
          orthographic={false} // Use perspective camera
        >
          <SceneContent />
        </Canvas>
      </div>
    )
  }
)

DiskScene.displayName = 'DiskScene'

export default React.memo(DiskScene)
