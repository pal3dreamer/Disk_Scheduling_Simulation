import { describe, it, expect } from 'vitest'
import { getAlgorithm, getAllAlgorithms } from '@/engine/algorithmFactory'

describe('Algorithm Factory', () => {
  it('should create FCFS algorithm', () => {
    const algo = getAlgorithm('FCFS')
    expect(algo.getName()).toBe('FCFS')
  })

  it('should create SSTF algorithm', () => {
    const algo = getAlgorithm('SSTF')
    expect(algo.getName()).toBe('SSTF')
  })

  it('should create all algorithms', () => {
    const algos = getAllAlgorithms()
    expect(algos).toHaveLength(6)
    expect(algos.map(a => a.getName())).toEqual(['FCFS', 'SSTF', 'SCAN', 'C-SCAN', 'LOOK', 'C-LOOK'])
  })
})
