import { FCFSAlgorithm } from './algorithms/fcfs'
import { SSTFAlgorithm } from './algorithms/sstf'
import { SCANAlgorithm } from './algorithms/scan'
import { CSCANAlgorithm } from './algorithms/cscan'
import { LOOKAlgorithm } from './algorithms/look'
import { CLOOKAlgorithm } from './algorithms/clook'
import { FSCANAlgorithm } from './algorithms/fscan'
import { DeadlineAlgorithm } from './algorithms/deadline'
import type { Algorithm, DiskAlgorithm } from './types'

export function getAlgorithm(algorithm: Algorithm): DiskAlgorithm {
  switch (algorithm) {
    case 'FCFS':
      return new FCFSAlgorithm()
    case 'SSTF':
      return new SSTFAlgorithm()
    case 'SCAN':
      return new SCANAlgorithm()
    case 'C-SCAN':
      return new CSCANAlgorithm()
    case 'LOOK':
      return new LOOKAlgorithm()
    case 'C-LOOK':
      return new CLOOKAlgorithm()
    case 'FSCAN':
      return new FSCANAlgorithm()
    case 'Deadline':
      return new DeadlineAlgorithm()
  }
}

export function getAllAlgorithms(): DiskAlgorithm[] {
  return [
    new FCFSAlgorithm(),
    new SSTFAlgorithm(),
    new SCANAlgorithm(),
    new CSCANAlgorithm(),
    new LOOKAlgorithm(),
    new CLOOKAlgorithm(),
    new FSCANAlgorithm(),
    new DeadlineAlgorithm(),
  ]
}
