import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeSwitcher from './ThemeSwitcher';
import {
  Flame,
  Headphones,
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  KeyRound,
  AlertCircle,
  Disc,
  Radio,
  ChevronRight
} from 'lucide-react';

export default function GatewayPortal({ onEnterAsGuest, onLoginSuccess }) {
  const { login, register } = useAuth();
  const { theme, isBright } = useTheme();

  // Mode: 'select' | 'artist-login' | 'viewer-login' | 'viewer-register'
  const [mode, setMode] = useState('select');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setDisplayName('');
    setEmail('');
    setError('');
  };

  const handleArtistSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password, 'artist');
      if (onLoginSuccess) onLoginSuccess('artist');
    } catch (err) {
      setError(err.message || 'Access denied: Invalid artist credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleViewerSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'viewer-register') {
        await register({ username: username.trim(), password, displayName, email });
      } else {
        await login(username.trim(), password, null);
      }
      if (onLoginSuccess) onLoginSuccess('viewer');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Quick Viewer Login shortcut (preserved for listeners)
  const handleQuickViewerLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login('listener', 'listener123', null);
      if (onLoginSuccess) onLoginSuccess('viewer');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto selection:bg-red-600 selection:text-white transition-colors duration-500"
      style={{
        backgroundColor: theme.bg
      }}
    >
      {/* Dynamic ambient lighting mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full blur-[150px] transition-all duration-700 opacity-25"
          style={{ backgroundColor: theme.accent }}
        />
        <div
          className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full blur-[170px] transition-all duration-700 opacity-15"
          style={{ backgroundColor: theme.accentDark }}
        />
      </div>

      {/* Top Bar Branding & Theme Switcher */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg border flex items-center justify-center shadow-lg transition-all"
            style={{
              background: `rgba(${theme.accentRgb}, 0.15)`,
              borderColor: `rgba(${theme.accentRgb}, 0.35)`,
              color: theme.accent,
              boxShadow: `0 0 15px -3px ${theme.glow}`
            }}
          >
            <Flame className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold tracking-[0.2em] text-slate-200 uppercase">
            SoundForge
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme switcher right in Gateway */}
          <ThemeSwitcher />

          <div
            className="hidden sm:flex items-center gap-2 text-[11px] font-mono px-3 py-1.5 rounded-xl border backdrop-blur-md"
            style={{
              background: 'rgba(12, 12, 18, 0.65)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              color: '#94a3b8'
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: theme.accent }}
            />
            <span>STUDIO SESSION ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Center Gateway Content */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col items-center text-center">
        
        {/* Gateway Title */}
        <div className="mb-10 max-w-xl">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium border mb-4 tracking-wider uppercase backdrop-blur-md"
            style={{
              background: `rgba(${theme.accentRgb}, 0.15)`,
              color: theme.accentLight,
              borderColor: `rgba(${theme.accentRgb}, 0.3)`
            }}
          >
            <Radio className="w-3 h-3" style={{ color: theme.accent }} />
            Independent Audio Portal
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3" style={{ color: theme.textPrimary }}>
            Enter the Studio
          </h1>
          <p className="text-xs sm:text-sm font-normal leading-relaxed" style={{ color: theme.textSecondary }}>
            Unreleased voice memos, late-night acoustic recordings, and finished masters directly from the producer's desk.
          </p>
        </div>

        {/* Dynamic Mode Switcher */}
        {mode === 'select' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl animate-fade-in">
            
            {/* PORTAL 1: Listener & Viewer Lounge (Translucent Frosted Glass) */}
            <div
              className="group relative rounded-3xl p-6 sm:p-8 border transition-all duration-300 text-left flex flex-col justify-between shadow-2xl glass-card backdrop-blur-2xl"
              style={{
                background: theme.cardBg,
                borderColor: theme.border
              }}
            >
              <div>
                <div
                  className="w-12 h-12 rounded-2xl border flex items-center justify-center transition-all mb-5 backdrop-blur-md"
                  style={{
                    background: isBright ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
                    borderColor: theme.border,
                    color: theme.accent
                  }}
                >
                  <Headphones className="w-6 h-6 transition-colors group-hover:scale-105" />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>Viewer & Listener Lounge</h3>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full border font-mono"
                    style={{
                      background: isBright ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
                      borderColor: theme.border,
                      color: theme.textSecondary
                    }}
                  >
                    Public
                  </span>
                </div>

                <p className="text-xs leading-relaxed mb-6" style={{ color: theme.textSecondary }}>
                  Stream high-fidelity songs, explore acoustic voice memo demos, sync lyrics, and leave timestamped reactions.
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t" style={{ borderColor: isBright ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)' }}>
                <button
                  onClick={onEnterAsGuest}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-[1.01] active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
                    boxShadow: `0 0 20px -3px ${theme.glow}`
                  }}
                >
                  <span>Enter as Listener</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <button
                    onClick={() => {
                      resetForm();
                      setMode('viewer-login');
                    }}
                    className="transition-colors hover:underline"
                    style={{ color: theme.textSecondary }}
                  >
                    Sign In with Fan Account
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setMode('viewer-register');
                    }}
                    className="transition-colors font-medium"
                    style={{ color: theme.accentLight }}
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>

            {/* PORTAL 2: Creator & Artist Studio (Translucent Frosted Glass) */}
            <div
              className="group relative rounded-3xl p-6 sm:p-8 border transition-all duration-300 text-left flex flex-col justify-between shadow-2xl glass-card backdrop-blur-2xl"
              style={{
                background: theme.cardBg,
                borderColor: theme.border
              }}
            >
              <div>
                <div
                  className="w-12 h-12 rounded-2xl border flex items-center justify-center group-hover:scale-105 transition-transform mb-5"
                  style={{
                    background: `rgba(${theme.accentRgb}, 0.15)`,
                    borderColor: `rgba(${theme.accentRgb}, 0.35)`,
                    color: theme.accent
                  }}
                >
                  <ShieldCheck className="w-6 h-6" />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>Artist & Producer Studio</h3>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full border font-mono"
                    style={{
                      background: `rgba(${theme.accentRgb}, 0.15)`,
                      color: theme.accentLight,
                      borderColor: `rgba(${theme.accentRgb}, 0.3)`
                    }}
                  >
                    Private
                  </span>
                </div>

                <p className="text-xs leading-relaxed mb-6" style={{ color: theme.textSecondary }}>
                  Restricted creator terminal to upload raw voice recordings, manage catalog, analyze listener metrics, or delete songs.
                </p>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: isBright ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)' }}>
                <button
                  onClick={() => {
                    resetForm();
                    setMode('artist-login');
                  }}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border shadow-lg active:scale-[0.98]"
                  style={{
                    background: isBright ? 'rgba(255, 255, 255, 0.85)' : 'rgba(10, 10, 15, 0.75)',
                    borderColor: theme.border,
                    color: theme.textPrimary
                  }}
                >
                  <Lock className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                  <span>Artist Studio Access</span>
                  <ChevronRight className="w-4 h-4 ml-auto" style={{ color: theme.textSecondary }} />
                </button>
                <p className="text-[10px] text-center mt-2.5" style={{ color: theme.textSecondary }}>
                  Credentials required for song upload & management
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ARTIST PRIVATE LOGIN VIEW (NO CREDENTIALS SHOWN) */}
        {mode === 'artist-login' && (
          <div
            className="w-full max-w-md border rounded-3xl p-6 sm:p-8 text-left shadow-2xl glass-card backdrop-blur-2xl animate-slide-up"
            style={{
              background: theme.cardBg,
              borderColor: theme.border
            }}
          >
            <button
              onClick={() => setMode('select')}
              className="text-xs text-slate-400 hover:text-white mb-4 flex items-center gap-1.5 transition-colors"
            >
              ← Back to portal selection
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-xl border flex items-center justify-center"
                style={{
                  background: `rgba(${theme.accentRgb}, 0.2)`,
                  borderColor: `rgba(${theme.accentRgb}, 0.4)`,
                  color: theme.accent
                }}
              >
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: theme.textPrimary }}>Artist Studio Login</h3>
                <p className="text-xs" style={{ color: theme.textSecondary }}>Enter your private credentials to manage songs</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-600/50 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleArtistSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: theme.textSecondary }}>
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
                  <input
                    type="text"
                    placeholder="Enter artist username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border focus:outline-none backdrop-blur-md"
                    style={{
                      background: theme.inputBg,
                      borderColor: theme.border,
                      color: theme.textPrimary
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: theme.textSecondary }}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border focus:outline-none backdrop-blur-md"
                    style={{
                      background: theme.inputBg,
                      borderColor: theme.border,
                      color: theme.textPrimary
                    }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
                  boxShadow: `0 0 20px -3px ${theme.glow}`
                }}
              >
                {loading ? 'Verifying...' : 'Unlock Studio Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* VIEWER LOGIN VIEW (CREDENTIALS & 1-CLICK DEMO PRESERVED) */}
        {(mode === 'viewer-login' || mode === 'viewer-register') && (
          <div
            className="w-full max-w-md border rounded-3xl p-6 sm:p-8 text-left shadow-2xl glass-card backdrop-blur-2xl animate-slide-up"
            style={{
              background: theme.cardBg,
              borderColor: theme.border
            }}
          >
            <button
              onClick={() => setMode('select')}
              className="text-xs text-slate-400 hover:text-white mb-4 flex items-center gap-1.5 transition-colors"
            >
              ← Back to portal selection
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-xl border flex items-center justify-center text-slate-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: theme.textPrimary }}>
                  {mode === 'viewer-register' ? 'Join Viewer Lounge' : 'Viewer Sign In'}
                </h3>
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  {mode === 'viewer-register' ? 'Save favorites and leave comments' : 'Access your listener profile'}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-600/50 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleViewerSubmit} className="space-y-4">
              {mode === 'viewer-register' && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: theme.textSecondary }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Melody Fan"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none backdrop-blur-md"
                    style={{
                      background: theme.inputBg,
                      borderColor: theme.border,
                      color: theme.textPrimary
                    }}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: theme.textSecondary }}>
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
                  <input
                    type="text"
                    placeholder="listener"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border focus:outline-none backdrop-blur-md"
                    style={{
                      background: theme.inputBg,
                      borderColor: theme.border,
                      color: theme.textPrimary
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: theme.textSecondary }}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border focus:outline-none backdrop-blur-md"
                    style={{
                      background: theme.inputBg,
                      borderColor: theme.border,
                      color: theme.textPrimary
                    }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
                  boxShadow: `0 0 20px -3px ${theme.glow}`
                }}
              >
                {loading ? 'Entering...' : mode === 'viewer-register' ? 'Create Account' : 'Sign In as Viewer'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode(mode === 'viewer-register' ? 'viewer-login' : 'viewer-register');
                }}
                className="text-xs transition-colors hover:underline"
                style={{ color: theme.textSecondary }}
              >
                {mode === 'viewer-register'
                  ? 'Already have an account? Sign in here'
                  : "New listener? Create a free account here"}
              </button>
            </div>

            {/* Listener Demo Shortcut Preserved */}
            <div className="mt-5 pt-4 border-t" style={{ borderColor: isBright ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={handleQuickViewerLogin}
                disabled={loading}
                className="w-full py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 backdrop-blur-md"
                style={{
                  background: isBright ? 'rgba(255, 255, 255, 0.85)' : 'rgba(12, 12, 18, 0.65)',
                  borderColor: theme.border,
                  color: theme.textPrimary
                }}
              >
                <KeyRound className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                1-Click Viewer Demo Login (listener / listener123)
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer Quote */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-6 py-6 text-center text-[11px] text-slate-500">
        SoundForge Studio • Written, recorded and produced independently
      </footer>

    </div>
  );
}
