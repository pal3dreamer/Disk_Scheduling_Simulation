import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useSimulation } from './SimulationProvider'
import { DiskGeometry } from './DiskGeometry'
import { DiskArmGeometry } from './DiskArmGeometry'
import type { DiskSceneHandle, DiskSceneProps } from '../types/diskScene'

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

    // Camera setup: isometric 3/4 view (60° yaw, 30° pitch)
    // Position: (600, 800, 600) — keeps full 500-track platter in view with padding
    camera.position.set(600, 800, 600)
    camera.lookAt(250, 0, 250) // Look at platter center

    // FOV calculated to show full platter + padding at current resolution
    camera.fov = 45
    camera.aspect = aspectRatio
    camera.near = 10
    camera.far = 3000
    camera.updateProjectionMatrix()
  }, [camera, gl])

  return (
    <>
      {/* Cool key light (ambient) - cyan-blue, subtle */}
      <ambientLight intensity={0.4} color={0x4a90e2} />

      {/* Amber fill light (directional) - from top-left */}
      <directionalLight
        intensity={0.8}
        color={0xd4af37}
        position={[1000, 1000, 1000]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-1000}
        shadow-camera-right={1000}
        shadow-camera-top={1000}
        shadow-camera-bottom={-1000}
      />

      {/* Fog: linear ramp 500-2000 units, color matches secondary UI (#1a1f3a) */}
      <fog attach="fog" args={[0x1a1f3a, 500, 2000]} />

      {/* Disk Platter & Spindle Hub (Task 23) */}
      <DiskGeometry diskSize={500} showTrackDetail={true} />

      {/* Mechanical Arm & Read Head (Task 24) */}
      <DiskArmGeometry diskSize={500} trackSeekTime={0.1} />
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
  function DiskSceneComponent(
    {
      containerWidth = 1280,
      containerHeight = 720,
    }: DiskSceneProps,
    ref
  ) {
    const { engine } = useSimulation()
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Imperative handle for parent-controlled animations
    useImperativeHandle(
      ref,
      () => ({
        async animateHeadMovement(
          // @ts-ignore - parameters will be used in Task 25
          fromTrack: number,
          // @ts-ignore
          toTrack: number,
          durationMs: number
        ): Promise<void> {
          // Stub: actual animation logic in Task 25
          // Parameters: fromTrack, toTrack, durationMs
          await new Promise((resolve) => setTimeout(resolve, durationMs))
        },

        async animatePlatterRotation(
          // @ts-ignore - parameter will be used in Task 25
          angle: number,
          durationMs: number
        ): Promise<void> {
          // Stub: actual animation logic in Task 25
          // Parameters: angle, durationMs
          await new Promise((resolve) => setTimeout(resolve, durationMs))
        },

        reset(): void {
          // Stub: reset logic in Task 25
        },
      }),
      []
    )

    // Subscribe to engine events for animation coordination
    useEffect(() => {
      const eventBus = engine.getEventBus()

      // HEAD_MOVED event: triggers head animation
      // @ts-ignore - event will be used in Task 25
      const unsubscribeHeadMoved = eventBus.on('HEAD_MOVED', (event) => {
        // Event payload: { from, to, distance, duration }
        // Animation will be triggered by handle method (Task 25)
      })

      // PLATTER_ROTATED event: triggers platter animation
      // @ts-ignore - event will be used in Task 25
      const unsubscribePlatterRotated = eventBus.on('PLATTER_ROTATED', (event) => {
        // Event payload: { angle, duration }
        // Animation will be triggered by handle method (Task 25)
      })

      // REQUEST_COMPLETED event: visual feedback
      const unsubscribeRequestCompleted = eventBus.on(
        'REQUEST_COMPLETED',
        // @ts-ignore - event will be used in Task 25
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
        style={{
          width: containerWidth,
          height: containerHeight,
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
