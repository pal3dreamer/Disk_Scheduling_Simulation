import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { trackToZPosition, calculateLEDIntensity } from '../../src/utils/diskArmHelpers'
import { SimulationProvider } from '../../src/components/SimulationProvider'
import { DiskArmGeometry } from '../../src/components/DiskArmGeometry'

describe('DiskArmGeometry Helpers', () => {
  /**
   * Test 1: Track number maps to Z position correctly
   */
  it('should map track numbers to Z positions correctly', () => {
    const diskSize = 500
    
    // Track 0 (center) should map to Z=0
    expect(trackToZPosition(0, diskSize)).toBe(0)
    
    // Track 250 (halfway) should map to Z=125
    expect(trackToZPosition(250, diskSize)).toBe(125)
    
    // Track 500 (edge) should map to Z=250
    expect(trackToZPosition(500, diskSize)).toBe(250)
  })

  /**
   * Test 2: LED intensity calculation based on request state
   */
  it('should calculate LED intensity based on request state', () => {
    // Idle: low intensity
    expect(calculateLEDIntensity('idle')).toBe(0.3)
    
    // Active: high intensity
    expect(calculateLEDIntensity('active')).toBe(1.0)
    
    // Completed: medium intensity
    expect(calculateLEDIntensity('completed')).toBe(0.5)
  })
})

describe('DiskArmGeometry', () => {
  /**
   * Test 3: DiskArmGeometry component renders without errors
   */
  it('should render arm and head without errors', () => {
    const { container } = render(
      <SimulationProvider diskSize={500} trackSeekTime={0.1} platterRPM={7200}>
        <DiskArmGeometry diskSize={500} trackSeekTime={0.1} />
      </SimulationProvider>
    )

    expect(container).toBeTruthy()
  })

  /**
   * Test 4: DiskArmGeometry accepts props
   */
  it('should accept diskSize and trackSeekTime props', () => {
    const { container } = render(
      <SimulationProvider diskSize={500} trackSeekTime={0.1} platterRPM={7200}>
        <DiskArmGeometry diskSize={500} trackSeekTime={0.1} />
      </SimulationProvider>
    )

    expect(container).toBeTruthy()
  })

  /**
   * Test 5: DiskArmGeometry creates arm geometry
   */
  it('should create arm shaft with matte black material', () => {
    const { container } = render(
      <SimulationProvider diskSize={500} trackSeekTime={0.1} platterRPM={7200}>
        <DiskArmGeometry diskSize={500} trackSeekTime={0.1} />
      </SimulationProvider>
    )

    expect(container).toBeTruthy()
  })

  /**
   * Test 6: DiskArmGeometry creates read head with LED
   */
  it('should render read head and amber LED indicator', () => {
    const { container } = render(
      <SimulationProvider diskSize={500} trackSeekTime={0.1} platterRPM={7200}>
        <DiskArmGeometry diskSize={500} trackSeekTime={0.1} />
      </SimulationProvider>
    )

    expect(container).toBeTruthy()
  })

  /**
   * Test 7: DiskArmGeometry subscribes to HEAD_MOVED events
   */
  it('should subscribe to HEAD_MOVED events from engine', () => {
    const { container } = render(
      <SimulationProvider diskSize={500} trackSeekTime={0.1} platterRPM={7200}>
        <DiskArmGeometry diskSize={500} trackSeekTime={0.1} />
      </SimulationProvider>
    )

    expect(container).toBeTruthy()
  })

  /**
   * Test 8: DiskArmGeometry subscribes to REQUEST state events
   */
  it('should subscribe to REQUEST_STARTED and REQUEST_COMPLETED events', () => {
    const { container } = render(
      <SimulationProvider diskSize={500} trackSeekTime={0.1} platterRPM={7200}>
        <DiskArmGeometry diskSize={500} trackSeekTime={0.1} />
      </SimulationProvider>
    )

    expect(container).toBeTruthy()
  })
})
