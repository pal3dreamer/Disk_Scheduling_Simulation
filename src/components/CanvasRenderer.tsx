import React, { useRef, useEffect, useCallback } from 'react';
import { useSimulation } from './SimulationProvider';
import { algorithmColors, uiColors } from '@/utils/canvasColors';
import {
  createLayout,
  getRequestScreenPosition,
  getHeadScreenPosition,
  smoothScroll,
} from '@/utils/timelineLayout';

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

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
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

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      const layout = createLayout(width, height, state.diskSize);

      // Clear canvas
      ctx.fillStyle = uiColors.background;
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = uiColors.gridLine;
      ctx.lineWidth = 1;

      // Horizontal track lines
      for (let i = 0; i <= state.diskSize; i++) {
        const y = layout.headerHeight + i * layout.pixelsPerTrack;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vertical time lines (every 10 steps)
      for (let step = 0; step * layout.pixelsPerStep < width + scrollXRef.current + 100; step += 10) {
        const x = step * layout.pixelsPerStep - scrollXRef.current;
        ctx.beginPath();
        ctx.moveTo(x, layout.headerHeight);
        ctx.lineTo(x, height);
        ctx.stroke();

        // Step label
        if (step % 50 === 0) {
          ctx.fillStyle = uiColors.text;
          ctx.font = '11px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(`${step}`, x, layout.headerHeight - 10);
        }
      }

      // Draw completed requests (faded)
      const algoColor = algorithmColors[state.algorithm];
      ctx.fillStyle = algoColor + '33';
      state.completedRequests.forEach((req) => {
        const pos = getRequestScreenPosition(
          { ...req, state: 'completed' as const },
          layout,
          scrollXRef.current
        );
        if (pos.visible) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw pending requests
      ctx.fillStyle = algoColor + '99';
      state.requestQueue.forEach((req) => {
        const pos = getRequestScreenPosition(
          { ...req, state: 'pending' as const },
          layout,
          scrollXRef.current
        );
        if (pos.visible) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw active request (bright)
      if (state.activeRequest) {
        ctx.fillStyle = algoColor;
        const pos = getRequestScreenPosition(
          { ...state.activeRequest, state: 'active' as const },
          layout,
          scrollXRef.current
        );
        if (pos.visible) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
          ctx.fill();

          // Glow
          ctx.strokeStyle = algoColor + '66';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }

      // Draw head position line
      const headPos = getHeadScreenPosition(
        state.headPosition,
        layout,
        state.stepCount,
        scrollXRef.current
      );

      // Vertical line
      ctx.strokeStyle = algoColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(headPos.x, layout.headerHeight);
      ctx.lineTo(headPos.x, height);
      ctx.stroke();

      // Head marker
      ctx.fillStyle = algoColor;
      ctx.fillRect(headPos.x - 6, headPos.y - 6, 12, 12);

      // Track label
      ctx.fillStyle = uiColors.text;
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`Track ${Math.round(state.headPosition)}`, headPos.x, layout.headerHeight - 15);

      // Auto-scroll to follow head
      if (isPlaying) {
        const targetScrollX = headPos.x - width * 0.4;
        scrollXRef.current = smoothScroll(scrollXRef.current, Math.max(0, targetScrollX), 0.1);
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
        className="w-full h-full block bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        style={{ display: 'block' }}
      />
    );
  }
);

CanvasRenderer.displayName = 'CanvasRenderer';
