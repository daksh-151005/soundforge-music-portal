import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';

export default function AudioVisualizer({ className = "w-28 h-8", barsCount = 18 }) {
  const { isPlaying, analyserRef } = usePlayer();
  const { theme } = useTheme();
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      let dataArray = null;
      if (analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
      }

      const barWidth = (width / barsCount) - 2;
      
      // Dynamic flame gradient according to current active theme
      const colors = theme.visualizerColors || ['#991b1b', '#dc2626', '#ff7878'];
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(0.6, colors[1]);
      gradient.addColorStop(1, colors[2]);

      for (let i = 0; i < barsCount; i++) {
        let barHeight = 4;
        if (isPlaying) {
          if (dataArray) {
            const index = Math.floor((i / barsCount) * 32);
            barHeight = Math.max(4, (dataArray[index] / 255) * height);
          } else {
            // Simulated animated musical pulse
            const time = Date.now() / 200;
            const wave = Math.sin(time + i * 0.45) * 0.5 + 0.5;
            barHeight = 4 + wave * (height - 6);
          }
        }

        const x = i * (barWidth + 2);
        const y = height - barHeight;

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, analyserRef, barsCount, theme]);

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={36}
      className={`rounded ${className}`}
      title={isPlaying ? `Live Spectrum (${theme.name})` : "Audio idle"}
    />
  );
}
