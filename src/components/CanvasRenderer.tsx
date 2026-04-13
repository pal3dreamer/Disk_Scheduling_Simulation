import React, { useRef, useEffect, useCallback } from 'react';
import { useSimulation } from './SimulationProvider';
import { algorithmColors, uiColors } from '@/utils/canvasColors';
import { smoothScroll } from '@/utils/timelineLayout';

export interface CanvasRendererProps {
  isPlaying: boolean;
}

export const CanvasRenderer = React.forwardRef<HTMLCanvasElement, CanvasRendererProps>(
  ({ isPlaying }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { state } = useSimulation();
    const scrollXRef = useRef(0);
    const animationFrameRef = useRef<number>();

    // Merge refs
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(canvasRef.current);
      } else if (ref) {
        ref.current = canvasRef.current;
      }
    }, [ref]);

    // Handle canvas resize
    const updateCanvasSize = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = canvas.parentElement;
      if (!container) return;

      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;

      // Set canvas size in memory (device pixels)
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      // Scale context to match device pixels
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }, []);

    useEffect(() => {
      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);
      return () => window.removeEventListener('resize', updateCanvasSize);
    }, [updateCanvasSize]);

    // Main render function
    const render = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Get logical dimensions (CSS pixels, not device pixels)
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      const pixelsPerStep = 40;
      const pixelsPerTrack = Math.max(25, (height - 60) / state.diskSize);
      const headerHeight = 40;

      // Clear canvas with dark background
      ctx.fillStyle = uiColors.background;
      ctx.fillRect(0, 0, width, height);

      // Draw grid lines
      ctx.strokeStyle = uiColors.gridLine;
      ctx.lineWidth = 1;

      // Horizontal track lines
      for (let i = 0; i <= state.diskSize; i++) {
        const y = headerHeight + i * pixelsPerTrack;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vertical time lines (every 10 steps)
      for (let step = 0; step * pixelsPerStep < width + scrollXRef.current + 100; step += 10) {
        const x = step * pixelsPerStep - scrollXRef.current;
        if (x > -50 && x < width + 50) {
          ctx.beginPath();
          ctx.moveTo(x, headerHeight);
          ctx.lineTo(x, height);
          ctx.stroke();

          // Step label
          if (step % 50 === 0) {
            ctx.fillStyle = uiColors.text;
            ctx.font = '11px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText(`${step}`, x, headerHeight - 10);
          }
        }
      }

      // Get algorithm color
      const algoColor = algorithmColors[state.algorithm];

      // Draw completed requests (very faded)
      ctx.fillStyle = algoColor + '20';
      state.completedRequests.forEach((req) => {
        const x = req.arrivalTime * pixelsPerStep - scrollXRef.current;
        const y = headerHeight + req.track * pixelsPerTrack + pixelsPerTrack / 2;

        if (x > -20 && x < width + 20) {
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw pending requests (semi-transparent)
      ctx.fillStyle = algoColor + '80';
      state.requestQueue.forEach((req) => {
        const x = req.arrivalTime * pixelsPerStep - scrollXRef.current;
        const y = headerHeight + req.track * pixelsPerTrack + pixelsPerTrack / 2;

        if (x > -20 && x < width + 20) {
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw active request (bright with glow)
      if (state.activeRequest) {
        const x = state.activeRequest.arrivalTime * pixelsPerStep - scrollXRef.current;
        const y = headerHeight + state.activeRequest.track * pixelsPerTrack + pixelsPerTrack / 2;

        if (x > -20 && x < width + 20) {
          // Glow effect
          ctx.fillStyle = algoColor + '40';
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.fill();

          // Main circle
          ctx.fillStyle = algoColor;
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw head position vertical line and marker
      const headX = state.stepCount * pixelsPerStep - scrollXRef.current;
      const headY = headerHeight + state.headPosition * pixelsPerTrack + pixelsPerTrack / 2;

      // Vertical line from top to bottom
      ctx.strokeStyle = algoColor;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(headX, headerHeight);
      ctx.lineTo(headX, height);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Head marker (square at current position)
      ctx.fillStyle = algoColor;
      ctx.fillRect(headX - 7, headY - 7, 14, 14);

      // Track label above head
      ctx.fillStyle = uiColors.text;
      ctx.font = 'bold 13px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`Track ${Math.round(state.headPosition)}`, headX, headerHeight - 18);

      // Auto-scroll to follow head
      if (isPlaying) {
        const targetScrollX = Math.max(0, headX - width * 0.35);
        scrollXRef.current = smoothScroll(scrollXRef.current, targetScrollX, 0.12);
      }
    }, [state, isPlaying]);

    // Animation loop
    useEffect(() => {
      const loop = () => {
        render();
        animationFrameRef.current = requestAnimationFrame(loop);
      };

      animationFrameRef.current = requestAnimationFrame(loop);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [render]);

    return (
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ display: 'block', background: 'transparent' }}
      />
    );
  }
);

CanvasRenderer.displayName = 'CanvasRenderer';
