import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const MUSIC_SYMBOLS = ['♪', '♫', '♬', '♩', '𝄞', '✦', '✧', '𝄢'];

export default function MusicParticles() {
  const { theme, isBright } = useTheme();
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, vx: 0, vy: 0, lastX: 0, lastY: 0 });
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      const mouse = mouseRef.current;
      const dx = e.clientX - mouse.lastX;
      const dy = e.clientY - mouse.lastY;
      mouse.vx = dx * 0.15;
      mouse.vy = dy * 0.15;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.lastX = e.clientX;
      mouse.lastY = e.clientY;

      // Occasionally spawn a small glowing note right at mouse cursor
      if (Math.random() < 0.25 && particlesRef.current.length < 90) {
        particlesRef.current.push(createParticle(e.clientX, e.clientY, true));
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
      mouseRef.current.vx = 0;
      mouseRef.current.vy = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Helper to create a single floating music note
    function createParticle(x, y, fromCursor = false) {
      const colors = theme.particleColors || ['#dc2626', '#b91c1c', '#991b1b'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const symbol = MUSIC_SYMBOLS[Math.floor(Math.random() * MUSIC_SYMBOLS.length)];

      const baseAlpha = isBright ? 0.35 : 0.2;
      const maxAlpha = isBright ? 0.85 : 0.75;

      return {
        x: x !== undefined ? x : Math.random() * width,
        y: y !== undefined ? y : Math.random() * height,
        vx: fromCursor ? (Math.random() - 0.5) * 2 + mouseRef.current.vx * 0.3 : (Math.random() - 0.5) * 0.6,
        vy: fromCursor ? -1 - Math.random() * 2 : -0.35 - Math.random() * 0.85,
        size: fromCursor ? 14 + Math.random() * 10 : 13 + Math.random() * 16,
        baseSize: fromCursor ? 16 : 14 + Math.random() * 14,
        symbol,
        color,
        alpha: fromCursor ? 0.95 : baseAlpha + Math.random() * (maxAlpha - baseAlpha),
        targetAlpha: baseAlpha + Math.random() * (maxAlpha - baseAlpha),
        rotation: (Math.random() - 0.5) * 0.4,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.015 + Math.random() * 0.025,
        wobbleAmp: 0.6 + Math.random() * 1.2,
        lifespan: fromCursor ? 120 + Math.random() * 60 : Infinity,
        age: 0
      };
    }

    // Initialize ambient floating particles
    const particleCount = Math.min(55, Math.floor((width * height) / 28000));
    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(createParticle());
    }

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      mouse.vx *= 0.9;
      mouse.vy *= 0.9;

      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age += 1;

        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * p.wobbleAmp;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Interaction with mouse cursor
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 180;

        if (dist < maxDist && dist > 1) {
          const force = (1 - dist / maxDist) * 1.8;
          p.x += (dx / dist) * force * 2.2 + mouse.vx * 0.4;
          p.y += (dy / dist) * force * 2.2 + mouse.vy * 0.4;
          p.size = p.baseSize * (1 + (1 - dist / maxDist) * 0.4);
          p.alpha = Math.min(0.95, p.alpha + 0.06);
        } else {
          p.size += (p.baseSize - p.size) * 0.05;
          p.alpha += (p.targetAlpha - p.alpha) * 0.02;
        }

        // Draw particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.alpha);

        if (isBright) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
          ctx.shadowBlur = 4;
        } else {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.symbol === '✦' ? 12 : 8;
        }

        ctx.font = `${Math.round(p.size)}px "Plus Jakarta Sans", -apple-system, sans-serif`;
        ctx.fillStyle = p.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.symbol, 0, 0);

        ctx.restore();

        // Respawn when reaching top or expired
        if (p.y < -40 || p.lifespan < p.age) {
          if (p.lifespan !== Infinity) {
            particles.splice(i, 1);
          } else {
            p.y = height + 20 + Math.random() * 40;
            p.x = Math.random() * width;
            p.vy = -0.35 - Math.random() * 0.85;
            p.symbol = MUSIC_SYMBOLS[Math.floor(Math.random() * MUSIC_SYMBOLS.length)];
            const colors = theme.particleColors || ['#dc2626', '#b91c1c'];
            p.color = colors[Math.floor(Math.random() * colors.length)];
          }
        } else if (p.x < -40) {
          p.x = width + 20;
        } else if (p.x > width + 40) {
          p.x = -20;
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [theme, isBright]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        background: 'transparent'
      }}
    />
  );
}
