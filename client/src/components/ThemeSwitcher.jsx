import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette, Check, Sparkles, Moon, Sun } from 'lucide-react';

export default function ThemeSwitcher({ className = '' }) {
  const { theme, mode, isBright, toggleMode, setExplicitMode, currentPaletteId, setPalette, allPalettes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative flex items-center gap-1.5 ${className}`} ref={dropdownRef}>
      
      {/* 1. Quick Dark / Bright Mode Toggle Button */}
      <button
        type="button"
        onClick={toggleMode}
        className="p-1.5 rounded-xl border transition-all text-xs flex items-center justify-center backdrop-blur-md shadow-sm"
        style={{
          background: isBright ? 'rgba(255, 255, 255, 0.8)' : 'rgba(12, 12, 16, 0.75)',
          borderColor: theme.border,
          color: theme.textPrimary
        }}
        title={isBright ? "Switch to Dark Mode" : "Switch to Bright Mode"}
      >
        {isBright ? (
          <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
        ) : (
          <Moon className="w-4 h-4 text-slate-300" />
        )}
      </button>

      {/* 2. Palette & Theme Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold backdrop-blur-md shadow-sm"
        style={{
          background: isBright ? 'rgba(255, 255, 255, 0.8)' : 'rgba(12, 12, 16, 0.75)',
          borderColor: theme.border,
          color: theme.textPrimary
        }}
        title="Switch Visual Theme"
      >
        <span
          className="w-3 h-3 rounded-full shadow-sm animate-pulse"
          style={{
            backgroundColor: theme.accent,
            boxShadow: `0 0 10px ${theme.accent}`
          }}
        />
        <span className="hidden sm:inline">{theme.name}</span>
        <Palette className="w-3.5 h-3.5" style={{ color: theme.accent }} />
      </button>

      {/* Theme Selection Dropdown Popover */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-72 rounded-2xl p-3 shadow-2xl border backdrop-blur-2xl z-50 animate-slide-up"
          style={{
            background: isBright ? 'rgba(255, 255, 255, 0.95)' : 'rgba(8, 8, 12, 0.94)',
            borderColor: theme.border,
            boxShadow: `0 20px 40px -10px rgba(0, 0, 0, ${isBright ? '0.15' : '0.8'}), 0 0 25px -5px ${theme.glow}`
          }}
        >
          {/* Header with Dark / Bright Switcher Tabs */}
          <div className="mb-2.5 pb-2.5 border-b" style={{ borderColor: isBright ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)' }}>
            <div className="flex items-center justify-between text-[11px] font-semibold mb-2" style={{ color: theme.textSecondary }}>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" style={{ color: theme.accent }} />
                Appearance Mode
              </span>
              <span className="font-mono text-[10px] uppercase font-bold" style={{ color: theme.accent }}>
                {mode}
              </span>
            </div>

            {/* Dark / Bright Mode Toggle Pill */}
            <div
              className="grid grid-cols-2 p-1 rounded-xl border text-xs font-semibold"
              style={{
                background: isBright ? '#f1f5f9' : 'rgba(0, 0, 0, 0.5)',
                borderColor: isBright ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'
              }}
            >
              <button
                type="button"
                onClick={() => setExplicitMode('dark')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                  mode === 'dark' ? 'shadow-sm text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                style={{
                  background: mode === 'dark' ? theme.accent : 'transparent'
                }}
              >
                <Moon className="w-3.5 h-3.5" />
                Dark
              </button>

              <button
                type="button"
                onClick={() => setExplicitMode('bright')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                  mode === 'bright' ? 'shadow-sm text-white font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                style={{
                  background: mode === 'bright' ? theme.accent : 'transparent'
                }}
              >
                <Sun className="w-3.5 h-3.5" />
                Bright
              </button>
            </div>
          </div>

          {/* Color Palettes List */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-1 block mb-1" style={{ color: theme.textMuted }}>
              Color Schemes
            </span>

            {allPalettes.map((p) => {
              const isSelected = currentPaletteId === p.id;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPalette(p.id);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all"
                  style={{
                    background: isSelected
                      ? (isBright ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)')
                      : 'transparent',
                    border: isSelected ? `1px solid ${p.accent}` : '1px solid transparent'
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full border shadow-sm"
                      style={{
                        backgroundColor: p.accent,
                        borderColor: isBright ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.2)'
                      }}
                    />

                    <div>
                      <span className="font-semibold block text-xs leading-none" style={{ color: theme.textPrimary }}>
                        {p.name}
                      </span>
                      <span className="text-[10px] block mt-0.5" style={{ color: theme.textMuted }}>
                        {mode === 'bright' ? 'Bright / Light' : 'Dark Studio'}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 shrink-0" style={{ color: p.accent }} />
                  )}
                </button>
              );
            })}
          </div>

          <div
            className="pt-2 mt-2 border-t text-[10px] text-center"
            style={{
              borderColor: isBright ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)',
              color: theme.textMuted
            }}
          >
            Switch between Dark and Bright anytime
          </div>
        </div>
      )}
    </div>
  );
}
