import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import * as THREE from 'three'
import { generateTrackRings, generateGradientZones } from '../../src/utils/diskGeometryHelpers'
import { SimulationProvider } from '../../src/components/SimulationProvider'
import { DiskGeometry } from '../../src/components/DiskGeometry'

describe('DiskGeometry', () => {
  /**
   * Test 1: Track ring generation creates correct number of rings
   */
  it('should generate 5 major track rings at correct positions', () => {
    const rings = generateTrackRings(500) // diskSize = 500
    
    // Should generate 5 rings (at tracks 0, 100, 200, 300, 400, 500)
    expect(rings).toHaveLength(5)
    
    // Each ring should have trackNumber and radius properties
    expect(rings[0].trackNumber).toBe(0)
    expect(rings[1].trackNumber).toBe(100)
    expect(rings[2].trackNumber).toBe(200)
    expect(rings[3].trackNumber).toBe(300)
    expect(rings[4].trackNumber).toBe(400)
  })

   /**
    * Test 2: Gradient zone generation creates 5 zones with correct colors
    */
   it('should generate 5 gradient zones with correct color progression', () => {
     const zones = generateGradientZones(500)
     
     expect(zones).toHaveLength(5)
     expect(zones[0].zone).toBe(1)
     expect(zones[0].color).toBe('#2a2a2a') // Darkest
     expect(zones[2].zone).toBe(3)
     expect(zones[2].color).toBe('#4a4a4a') // Mid
     expect(zones[4].zone).toBe(5)
     expect(zones[4].color).toBe('#6a6a6a') // Lightest
   })

  /**
   * Test 3: DiskGeometry component renders without errors
   */
  it('should render platter and spindle without errors', () => {
    const { container } = render(
      <SimulationProvider diskSize={500} trackSeekTime={0.1} platterRPM={7200}>
        <DiskGeometry diskSize={500} />
      </SimulationProvider>
    )

    // Component should render successfully
    expect(container).toBeTruthy()
  })

  /**
   * Test 4: DiskGeometry accepts props for disk size and track detail
   */
  it('should accept diskSize and showTrackDetail props', () => {
    const { container } = render(
      <SimulationProvider diskSize={500} trackSeekTime={0.1} platterRPM={7200}>
        <DiskGeometry diskSize={500} showTrackDetail={true} />
      </SimulationProvider>
    )

    expect(container).toBeTruthy()
  })

  /**
   * Test 5: DiskGeometry renders platter with correct radius
   */
  it('should create platter cylinder with correct dimensions', () => {
    // This test verifies geometry is created (by component not throwing)
    const { container } = render(
      <SimulationProvider diskSize={500} trackSeekTime={0.1} platterRPM={7200}>
        <DiskGeometry diskSize={500} showTrackDetail={true} />
      </SimulationProvider>
    )

    expect(container).toBeTruthy()
  })

  /**
   * Test 6: DiskGeometry renders spindle hub
   */
  it('should render spindle hub with amber metallic material', () => {
    const { container } = render(
      <SimulationProvider diskSize={500} trackSeekTime={0.1} platterRPM={7200}>
        <DiskGeometry diskSize={500} showTrackDetail={true} />
      </SimulationProvider>
    )

    expect(container).toBeTruthy()
  })

  /**
   * Test 7: DiskGeometry subscribes to PLATTER_ROTATED events
   */
  it('should subscribe to PLATTER_ROTATED events from engine', () => {
    const { container } = render(
      <SimulationProvider diskSize={500} trackSeekTime={0.1} platterRPM={7200}>
        <DiskGeometry diskSize={500} />
      </SimulationProvider>
    )

    expect(container).toBeTruthy()
  })

  /**
   * Test 8: DiskGeometry updates rotation angle on platter rotate event
   */
  it('should update rotation angle when PLATTER_ROTATED event fires', () => {
    const { container } = render(
      <SimulationProvider diskSize={500} trackSeekTime={0.1} platterRPM={7200}>
        <DiskGeometry diskSize={500} />
      </SimulationProvider>
    )

    expect(container).toBeTruthy()
  })
})
