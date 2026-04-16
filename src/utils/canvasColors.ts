import { Algorithm } from '@/engine/types';

export const algorithmColors: Record<Algorithm, string> = {
  'FCFS': '#3b82f6',    // Blue
  'SSTF': '#10b981',    // Green
  'SCAN': '#a855f7',    // Purple
  'C-SCAN': '#f97316',  // Orange
  'LOOK': '#06b6d4',    // Cyan
  'C-LOOK': '#ec4899',  // Pink
  'FSCAN': '#ef4444',   // Red
  'Deadline': '#84cc16', // Lime
};

export const uiColors = {
  background: 'rgba(15, 23, 42, 0.8)',
  gridLine: 'rgba(148, 163, 184, 0.15)',
  text: '#e2e8f0',
  accent: '#fbbf24',
  pending: 'rgba(255, 255, 255, 0.3)',
  active: 'rgba(255, 255, 255, 0.8)',
  completed: 'rgba(255, 255, 255, 0.2)',
};

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getAlgorithmColor(algo: Algorithm): string {
  return algorithmColors[algo];
}
