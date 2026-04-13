import { SimulationState } from '@/engine/types';

export interface TimelinePoint {
  step: number;
  time: number;
  headPosition: number;
  requests: TimelineRequest[];
}

export interface TimelineRequest {
  id: string;
  track: number;
  arrivalTime: number;
  startTime?: number;
  completionTime?: number;
  state: 'pending' | 'active' | 'completed';
}

export interface CanvasLayout {
  pixelsPerStep: number;
  pixelsPerTrack: number;
  padding: number;
  headerHeight: number;
  width: number;
  height: number;
  trackCount: number;
}

export function createLayout(
  containerWidth: number,
  containerHeight: number,
  trackCount: number
): CanvasLayout {
  const pixelsPerStep = 40;
  const pixelsPerTrack = Math.max(30, Math.floor((containerHeight - 80) / trackCount));
  const padding = 40;
  const headerHeight = 40;

  return {
    pixelsPerStep,
    pixelsPerTrack,
    padding,
    headerHeight,
    width: containerWidth,
    height: containerHeight,
    trackCount,
  };
}

export function stateToTimelinePoint(
  state: SimulationState,
  step: number
): TimelinePoint {
  return {
    step,
    time: state.currentTime,
    headPosition: state.headPosition,
    requests: [
      ...state.requestQueue.map(r => ({
        ...r,
        state: 'pending' as const,
      })),
      ...(state.activeRequest ? [{ ...state.activeRequest, state: 'active' as const }] : []),
      ...state.completedRequests.map(r => ({
        ...r,
        state: 'completed' as const,
      })),
    ],
  };
}

export function getRequestScreenPosition(
  request: TimelineRequest,
  layout: CanvasLayout,
  scrollX: number
): { x: number; y: number; visible: boolean } {
  const x = (request.arrivalTime * layout.pixelsPerStep) - scrollX;
  const y = layout.headerHeight + (request.track * layout.pixelsPerTrack) + layout.pixelsPerTrack / 2;
  const visible = x > -10 && x < layout.width + 10;

  return { x, y, visible };
}

export function getHeadScreenPosition(
  headPosition: number,
  layout: CanvasLayout,
  currentStep: number,
  scrollX: number
): { x: number; y: number } {
  const x = (currentStep * layout.pixelsPerStep) - scrollX;
  const y = layout.headerHeight + (headPosition * layout.pixelsPerTrack) + layout.pixelsPerTrack / 2;

  return { x, y };
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function smoothScroll(current: number, target: number, factor: number = 0.15): number {
  return current + (target - current) * factor;
}
