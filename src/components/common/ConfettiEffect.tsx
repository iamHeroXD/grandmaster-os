import React, { useEffect, useRef } from 'react';

interface ConfettiEffectProps {
  active: boolean;
  durationMs?: number;
  onFinish?: () => void;
}

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
  active,
  durationMs = 2500,
  onFinish,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#4e7c59', '#62996e', '#c29b38', '#f3e18a', '#38bdf8', '#ffffff'];
    const particles: {
      x: number;
      y: number;
      size: number;
      color: string;
      vx: number;
      vy: number;
      rot: number;
      vRot: number;
      alpha: number;
    }[] = [];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width * 0.5 + (Math.random() - 0.5) * 300,
        y: canvas.height * 0.45 + (Math.random() - 0.5) * 100,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.8) * 15,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2,
        alpha: 1,
      });
    }

    let animId: number;
    const start = Date.now();

    const render = () => {
      const elapsed = Date.now() - start;
      const progress = elapsed / durationMs;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rot += p.vRot;
        p.alpha = Math.max(0, 1 - progress);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (progress < 1) {
        animId = requestAnimationFrame(render);
      } else {
        if (onFinish) onFinish();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [active, durationMs, onFinish]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
};
