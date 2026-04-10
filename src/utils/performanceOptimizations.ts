/**
 * Performance optimization utilities for Three.js rendering and React components
 */

import * as THREE from 'three'

/**
 * Debounce function for expensive operations (resize, scroll, etc.)
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Throttle function for frame-rate sensitive operations
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastCallTime = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCallTime >= interval) {
      fn(...args)
      lastCallTime = now
    }
  }
}

/**
 * Estimate Three.js memory footprint of a geometry
 */
export function estimateGeometryMemory(geometry: THREE.BufferGeometry): number {
  let bytes = 0

  // Count buffer attributes
  for (const key in geometry.attributes) {
    const attr = geometry.attributes[key] as THREE.BufferAttribute
    bytes += attr.array.byteLength
  }

  // Index buffer
  if (geometry.index) {
    bytes += geometry.index.array.byteLength
  }

  return bytes
}

/**
 * Report performance metrics (FPS, memory, render time)
 */
export interface PerformanceReport {
  fps: number
  memoryMB: number
  renderTimeMs: number
  geometriesCount: number
}

export class PerformanceMonitor {
  private frameCount = 0
  private lastTime = Date.now()
  private fps = 0
  private renderTimes: number[] = []

  recordFrame(renderTime: number) {
    this.frameCount++
    this.renderTimes.push(renderTime)

    // Keep last 60 samples
    if (this.renderTimes.length > 60) {
      this.renderTimes.shift()
    }

    const now = Date.now()
    const elapsed = now - this.lastTime

    if (elapsed >= 1000) {
      this.fps = this.frameCount
      this.frameCount = 0
      this.lastTime = now
    }
  }

  getReport(): PerformanceReport {
    const memoryData = (performance as any).memory
    return {
      fps: this.fps,
      memoryMB: memoryData?.usedJSHeapSize
        ? memoryData.usedJSHeapSize / 1024 / 1024
        : 0,
      renderTimeMs:
        this.renderTimes.length > 0
          ? this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length
          : 0,
      geometriesCount: 0, // Set by caller based on scene
    }
  }
}
