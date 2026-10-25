import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEME_PALETTES = {
  crimson: {
    id: 'crimson',
    name: 'Crimson',
    accent: '#dc2626',
    accentHover: '#ef4444',
    accentLight: '#f87171',
    accentDark: '#991b1b',
    accentRgb: '220, 38, 38',
    dark: {
      bg: '#050507',
      panelBg: 'rgba(10, 8, 10, 0.75)',
      cardBg: 'rgba(18, 14, 18, 0.65)',
      inputBg: 'rgba(8, 8, 12, 0.7)',
      textPrimary: '#ffffff',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      border: 'rgba(239, 68, 68, 0.22)',
      glow: 'rgba(220, 38, 38, 0.45)',
      particleColors: ['#ef4444', '#dc2626', '#b91c1c', '#ff7878', '#f87171'],
      visualizerColors: ['#991b1b', '#dc2626', '#ff7878']
    },
    bright: {
      bg: '#f8f9fa',
      panelBg: 'rgba(255, 255, 255, 0.88)',
      cardBg: 'rgba(255, 255, 255, 0.75)',
      inputBg: 'rgba(240, 242, 245, 0.85)',
      textPrimary: '#0f172a',
      textSecondary: '#334155',
      textMuted: '#64748b',
      border: 'rgba(220, 38, 38, 0.22)',
      glow: 'rgba(220, 38, 38, 0.3)',
      particleColors: ['#dc2626', '#b91c1c', '#991b1b', '#e11d48', '#be123c'],
      visualizerColors: ['#b91c1c', '#dc2626', '#ef4444']
    }
  },
  midnight: {
    id: 'midnight',
    name: 'Neon Violet',
    accent: '#8b5cf6',
    accentHover: '#a78bfa',
    accentLight: '#c4b5fd',
    accentDark: '#6d28d9',
    accentRgb: '139, 92, 246',
    dark: {
      bg: '#06060c',
      panelBg: 'rgba(12, 11, 24, 0.75)',
      cardBg: 'rgba(19, 17, 36, 0.65)',
      inputBg: 'rgba(10, 9, 20, 0.7)',
      textPrimary: '#ffffff',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      border: 'rgba(139, 92, 246, 0.25)',
      glow: 'rgba(139, 92, 246, 0.45)',
      particleColors: ['#8b5cf6', '#a78bfa', '#06b6d4', '#ec4899', '#c084fc'],
      visualizerColors: ['#6d28d9', '#8b5cf6', '#06b6d4']
    },
    bright: {
      bg: '#f7f6fd',
      panelBg: 'rgba(255, 255, 255, 0.9)',
      cardBg: 'rgba(255, 255, 255, 0.78)',
      inputBg: 'rgba(242, 240, 252, 0.85)',
      textPrimary: '#0f172a',
      textSecondary: '#334155',
      textMuted: '#64748b',
      border: 'rgba(139, 92, 246, 0.22)',
      glow: 'rgba(139, 92, 246, 0.3)',
      particleColors: ['#7c3aed', '#6d28d9', '#0891b2', '#db2777', '#9333ea'],
      visualizerColors: ['#6d28d9', '#7c3aed', '#a855f7']
    }
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    accent: '#10b981',
    accentHover: '#34d399',
    accentLight: '#6ee7b7',
    accentDark: '#047857',
    accentRgb: '16, 185, 129',
    dark: {
      bg: '#030806',
      panelBg: 'rgba(6, 16, 12, 0.75)',
      cardBg: 'rgba(10, 26, 20, 0.65)',
      inputBg: 'rgba(6, 18, 14, 0.7)',
      textPrimary: '#ffffff',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      border: 'rgba(16, 185, 129, 0.22)',
      glow: 'rgba(16, 185, 129, 0.45)',
      particleColors: ['#10b981', '#34d399', '#059669', '#6ee7b7', '#a7f3d0'],
      visualizerColors: ['#047857', '#10b981', '#34d399']
    },
    bright: {
      bg: '#f4fbf7',
      panelBg: 'rgba(255, 255, 255, 0.9)',
      cardBg: 'rgba(255, 255, 255, 0.78)',
      inputBg: 'rgba(236, 248, 242, 0.85)',
      textPrimary: '#062817',
      textSecondary: '#1e3a2b',
      textMuted: '#527964',
      border: 'rgba(16, 185, 129, 0.22)',
      glow: 'rgba(16, 185, 129, 0.3)',
      particleColors: ['#059669', '#047857', '#0f766e', '#10b981', '#065f46'],
      visualizerColors: ['#047857', '#059669', '#10b981']
    }
  },
  amber: {
    id: 'amber',
    name: 'Vintage Amber',
    accent: '#d97706',
    accentHover: '#f59e0b',
    accentLight: '#fbbf24',
    accentDark: '#b45309',
    accentRgb: '217, 119, 6',
    dark: {
      bg: '#080603',
      panelBg: 'rgba(18, 14, 8, 0.75)',
      cardBg: 'rgba(28, 20, 10, 0.65)',
      inputBg: 'rgba(16, 12, 6, 0.7)',
      textPrimary: '#ffffff',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      border: 'rgba(245, 158, 11, 0.24)',
      glow: 'rgba(245, 158, 11, 0.45)',
      particleColors: ['#f59e0b', '#fbbf24', '#d97706', '#fde68a', '#ea580c'],
      visualizerColors: ['#b45309', '#f59e0b', '#fde68a']
    },
    bright: {
      bg: '#fefaf3',
      panelBg: 'rgba(255, 255, 255, 0.9)',
      cardBg: 'rgba(255, 255, 255, 0.8)',
      inputBg: 'rgba(253, 248, 237, 0.85)',
      textPrimary: '#291b07',
      textSecondary: '#4d3714',
      textMuted: '#785b29',
      border: 'rgba(217, 119, 6, 0.22)',
      glow: 'rgba(217, 119, 6, 0.3)',
      particleColors: ['#b45309', '#d97706', '#92400e', '#c2410c', '#b45309'],
      visualizerColors: ['#b45309', '#d97706', '#f59e0b']
    }
  },
  sapphire: {
    id: 'sapphire',
    name: 'Sapphire',
    accent: '#2563eb',
    accentHover: '#3b82f6',
    accentLight: '#60a5fa',
    accentDark: '#1d4ed8',
    accentRgb: '37, 99, 235',
    dark: {
      bg: '#03050d',
      panelBg: 'rgba(6, 10, 22, 0.75)',
      cardBg: 'rgba(10, 17, 36, 0.65)',
      inputBg: 'rgba(6, 10, 20, 0.7)',
      textPrimary: '#ffffff',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      border: 'rgba(37, 99, 235, 0.25)',
      glow: 'rgba(37, 99, 235, 0.45)',
      particleColors: ['#3b82f6', '#60a5fa', '#0ea5e9', '#38bdf8', '#93c5fd'],
      visualizerColors: ['#1d4ed8', '#2563eb', '#38bdf8']
    },
    bright: {
      bg: '#f4f7fc',
      panelBg: 'rgba(255, 255, 255, 0.9)',
      cardBg: 'rgba(255, 255, 255, 0.8)',
      inputBg: 'rgba(238, 243, 253, 0.85)',
      textPrimary: '#0f172a',
      textSecondary: '#1e293b',
      textMuted: '#475569',
      border: 'rgba(37, 99, 235, 0.22)',
      glow: 'rgba(37, 99, 235, 0.3)',
      particleColors: ['#1d4ed8', '#1e40af', '#0369a1', '#2563eb', '#0284c7'],
      visualizerColors: ['#1d4ed8', '#2563eb', '#3b82f6']
    }
  }
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Palette: 'crimson' | 'midnight' | 'emerald' | 'amber' | 'sapphire'
  const [currentPaletteId, setCurrentPaletteId] = useState(() => {
    return localStorage.getItem('soundforge_palette') || 'crimson';
  });

  // Mode: 'dark' | 'bright'
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('soundforge_mode') || 'dark';
  });

  const palette = THEME_PALETTES[currentPaletteId] || THEME_PALETTES.crimson;
  const isBright = mode === 'bright';
  const modeData = isBright ? palette.bright : palette.dark;

  const theme = {
    id: palette.id,
    name: palette.name,
    accent: palette.accent,
    accentHover: palette.accentHover,
    accentLight: palette.accentLight,
    accentDark: palette.accentDark,
    accentRgb: palette.accentRgb,
    isBright,
    mode,
    ...modeData
  };

  const setPalette = (paletteId) => {
    if (THEME_PALETTES[paletteId]) {
      setCurrentPaletteId(paletteId);
      localStorage.setItem('soundforge_palette', paletteId);
    }
  };

  const toggleMode = () => {
    const nextMode = mode === 'dark' ? 'bright' : 'dark';
    setMode(nextMode);
    localStorage.setItem('soundforge_mode', nextMode);
  };

  const setExplicitMode = (newMode) => {
    if (newMode === 'dark' || newMode === 'bright') {
      setMode(newMode);
      localStorage.setItem('soundforge_mode', newMode);
    }
  };

  // Sync CSS variables to root document
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.id);
    root.setAttribute('data-mode', mode);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-accent-hover', theme.accentHover);
    root.style.setProperty('--theme-accent-rgb', theme.accentRgb);
    root.style.setProperty('--theme-bg', theme.bg);
    root.style.setProperty('--theme-border', theme.border);
    root.style.setProperty('--theme-glow', theme.glow);
    root.style.setProperty('--theme-panel-bg', theme.panelBg);
    root.style.setProperty('--theme-card-bg', theme.cardBg);
    root.style.setProperty('--theme-text-primary', theme.textPrimary);
    root.style.setProperty('--theme-text-secondary', theme.textSecondary);
  }, [theme, mode]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode,
        isBright,
        toggleMode,
        setExplicitMode,
        currentPaletteId,
        setPalette,
        allPalettes: Object.values(THEME_PALETTES)
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
