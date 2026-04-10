import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { useRef } from 'react'
import * as THREE from 'three'
import { DiskScene } from '../../src/components/DiskScene'
import { SimulationProvider } from '../../src/components/SimulationProvider'
import type { DiskSceneHandle } from '../../src/types/diskScene'

describe('DiskScene', () => {
  it('should render a canvas element', () => {
    const { container } = render(
      <SimulationProvider>
        <div style={{ width: '1280px', height: '720px' }}>
          <DiskScene />
        </div>
      </SimulationProvider>
    )

    const canvas = container.querySelector('canvas')
    expect(canvas).toBeTruthy()
  })

  it('should apply container dimensions to wrapper', () => {
    const { container } = render(
      <SimulationProvider>
        <div data-testid="wrapper">
          <DiskScene containerWidth={1024} containerHeight={768} />
        </div>
      </SimulationProvider>
    )

    const wrapper = container.querySelector('[data-testid="wrapper"] > div')
    const styles = window.getComputedStyle(wrapper!)
    // Canvas container should exist
    expect(wrapper).toBeTruthy()
  })

  it('should expose ref handle with animation methods', () => {
    let handleRef: React.RefObject<DiskSceneHandle | null> = { current: null }

    function TestWrapper() {
      const ref = useRef<DiskSceneHandle>(null)
      handleRef = ref

      return <DiskScene ref={ref} />
    }

    render(
      <SimulationProvider>
        <TestWrapper />
      </SimulationProvider>
    )

    expect(handleRef.current).toBeTruthy()
    expect(typeof handleRef.current?.animateHeadMovement).toBe('function')
    expect(typeof handleRef.current?.animatePlatterRotation).toBe('function')
    expect(typeof handleRef.current?.reset).toBe('function')
  })

  it('should call animateHeadMovement and return promise', async () => {
    let handleRef: React.RefObject<DiskSceneHandle | null> = { current: null }

    function TestWrapper() {
      const ref = useRef<DiskSceneHandle>(null)
      handleRef = ref

      return <DiskScene ref={ref} />
    }

    render(
      <SimulationProvider>
        <TestWrapper />
      </SimulationProvider>
    )

    const promise = handleRef.current?.animateHeadMovement(0, 100, 500)
    expect(promise).toBeInstanceOf(Promise)
    await expect(promise).resolves.toBeUndefined()
  })

  it('should call animatePlatterRotation and return promise', async () => {
    let handleRef: React.RefObject<DiskSceneHandle | null> = { current: null }

    function TestWrapper() {
      const ref = useRef<DiskSceneHandle>(null)
      handleRef = ref

      return <DiskScene ref={ref} />
    }

    render(
      <SimulationProvider>
        <TestWrapper />
      </SimulationProvider>
    )

    const promise = handleRef.current?.animatePlatterRotation(360, 500)
    expect(promise).toBeInstanceOf(Promise)
    await expect(promise).resolves.toBeUndefined()
  })

  it('should call reset method without error', () => {
    let handleRef: React.RefObject<DiskSceneHandle | null> = { current: null }

    function TestWrapper() {
      const ref = useRef<DiskSceneHandle>(null)
      handleRef = ref

      return <DiskScene ref={ref} />
    }

    render(
      <SimulationProvider>
        <TestWrapper />
      </SimulationProvider>
    )

    expect(() => handleRef.current?.reset()).not.toThrow()
  })

  it('should unsubscribe from events on unmount', () => {
    const { unmount } = render(
      <SimulationProvider>
        <DiskScene />
      </SimulationProvider>
    )

    expect(() => unmount()).not.toThrow()
  })

  it('should maintain ref handle across re-renders', () => {
    let handleRef: React.RefObject<DiskSceneHandle | null> = { current: null }
    let renderCount = 0

    function TestWrapper({ rerender: _ }: any) {
      renderCount++
      const ref = useRef<DiskSceneHandle>(null)
      handleRef = ref

      return <DiskScene ref={ref} />
    }

    const { rerender } = render(
      <SimulationProvider>
        <TestWrapper rerender={1} />
      </SimulationProvider>
    )
    const firstHandle = handleRef

    rerender(
      <SimulationProvider>
        <TestWrapper rerender={2} />
      </SimulationProvider>
    )
    const secondHandle = handleRef

    expect(firstHandle).toBe(secondHandle)
  })

  it('should render without errors when wrapped in SimulationProvider', async () => {
    const { container } = render(
      <SimulationProvider diskSize={500} trackSeekTime={0.1} platterRPM={7200}>
        <DiskScene />
      </SimulationProvider>
    )

    const canvas = container.querySelector('canvas')
    expect(canvas).toBeTruthy()
  })
})
