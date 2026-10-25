import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeSwitcher from './ThemeSwitcher';
import {
  Music,
  Sliders,
  PlusCircle,
  LogIn,
  LogOut,
  User,
  Radio,
  Search,
  Sparkles,
  ShieldCheck,
  Headphones,
  Flame,
  DoorOpen
} from 'lucide-react';

export default function Navbar({
  currentView,
  setCurrentView,
  onOpenUpload,
  onOpenAuth,
  onOpenGateway,
  searchQuery,
  setSearchQuery
}) {
  const { user, isArtist, isViewer, logout } = useAuth();
  const { theme, isBright } = useTheme();

  const isRealArtist = Boolean(isArtist && user?.role === 'artist');

  return (
    <header
      className="sticky top-0 z-40 w-full glass-panel border-b transition-all duration-300"
      style={{
        background: theme.panelBg,
        borderColor: theme.border
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand Logo & Navigation Switcher */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setCurrentView('viewer')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div
              className="w-10 h-10 rounded-xl p-0.5 shadow-lg group-hover:scale-105 transition-all"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentLight})`,
                boxShadow: `0 0 15px -3px ${theme.glow}`
              }}
            >
              <div
                className="w-full h-full rounded-[10px] flex items-center justify-center"
                style={{
                  background: isBright ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)'
                }}
              >
                <Flame className="w-5 h-5 transition-colors" style={{ color: theme.accent }} />
              </div>
            </div>
            <div>
              <span
                className="font-extrabold text-lg tracking-tight bg-clip-text transition-colors"
                style={{
                  color: theme.textPrimary
                }}
              >
                SoundForge
              </span>
              <span
                className="hidden sm:inline-block ml-1.5 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border"
                style={{
                  background: `rgba(${theme.accentRgb}, 0.12)`,
                  color: theme.accent,
                  borderColor: `rgba(${theme.accentRgb}, 0.3)`
                }}
              >
                {isRealArtist ? 'Studio' : 'Lounge'}
              </span>
            </div>
          </div>

          {/* Navigation Mode Switcher: ONLY show Creator Studio if logged in as the Artist */}
          {isRealArtist && (
            <nav
              className="hidden md:flex items-center p-1 rounded-xl border backdrop-blur-md"
              style={{
                background: isBright ? 'rgba(240, 242, 246, 0.7)' : 'rgba(5, 5, 8, 0.7)',
                borderColor: isBright ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'
              }}
            >
              <button
                onClick={() => setCurrentView('viewer')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: currentView === 'viewer' ? theme.accent : 'transparent',
                  color: currentView === 'viewer' ? '#ffffff' : theme.textSecondary,
                  boxShadow: currentView === 'viewer' ? `0 0 15px -3px ${theme.glow}` : 'none'
                }}
              >
                <Headphones className="w-3.5 h-3.5" />
                Music Lounge
              </button>

              <button
                onClick={() => setCurrentView('studio')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative"
                style={{
                  background: currentView === 'studio' ? `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})` : 'transparent',
                  color: currentView === 'studio' ? '#ffffff' : theme.textSecondary,
                  boxShadow: currentView === 'studio' ? `0 0 15px -3px ${theme.glow}` : 'none'
                }}
              >
                <Sliders className="w-3.5 h-3.5" />
                Creator Studio
              </button>
            </nav>
          )}
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search songs, voice memos, lyrics, moods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border focus:outline-none transition-all backdrop-blur-md"
              style={{
                background: theme.inputBg,
                borderColor: isBright ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
                color: theme.textPrimary
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Theme Switcher, Upload (Artist Only), Gateway & Auth */}
        <div className="flex items-center gap-2.5">
          
          {/* Theme Switcher Button (with Dark & Bright options) */}
          <ThemeSwitcher />

          {/* Quick Gateway Portal Switcher Button */}
          {onOpenGateway && (
            <button
              onClick={onOpenGateway}
              className="p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 backdrop-blur-md"
              style={{
                background: isBright ? 'rgba(255, 255, 255, 0.75)' : 'rgba(12, 12, 16, 0.7)',
                borderColor: theme.border,
                color: theme.textSecondary
              }}
              title="Return to Portal Gateway"
            >
              <DoorOpen className="w-4 h-4" style={{ color: theme.accent }} />
              <span className="hidden xl:inline text-[11px] font-medium">Gateway</span>
            </button>
          )}

          {/* Strictly ONLY IF ARTIST: Quick Upload Button */}
          {isRealArtist && (
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-3.5 py-1.5 text-white rounded-xl text-xs font-semibold shadow-lg transition-all hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
                boxShadow: `0 0 15px -3px ${theme.glow}`
              }}
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Song / Memo</span>
            </button>
          )}

          {/* User Profile or Login Trigger */}
          {user ? (
            <div
              className="flex items-center gap-2.5 py-1 px-2.5 rounded-xl border backdrop-blur-md"
              style={{
                background: isBright ? 'rgba(255, 255, 255, 0.85)' : 'rgba(12, 12, 16, 0.75)',
                borderColor: theme.border
              }}
            >
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-7 h-7 rounded-lg object-cover border"
                style={{ borderColor: theme.border }}
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold leading-tight" style={{ color: theme.textPrimary }}>
                  {user.displayName}
                </p>
                <p className="text-[10px] capitalize font-medium flex items-center gap-1"
                  style={{ color: isRealArtist ? theme.accent : theme.textSecondary }}>
                  {isRealArtist ? (
                    <>
                      <ShieldCheck className="w-2.5 h-2.5" style={{ color: theme.accent }} /> Artist Admin
                    </>
                  ) : (
                    <>
                      <Headphones className="w-2.5 h-2.5 text-slate-400" /> Viewer
                    </>
                  )}
                </p>
              </div>

              <button
                onClick={logout}
                className="p-1 text-slate-400 hover:text-rose-500 transition-colors ml-1"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('viewer')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors backdrop-blur-sm"
                style={{ color: theme.textSecondary }}
              >
                Viewer Login
              </button>
              <button
                onClick={() => onOpenAuth('artist')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border backdrop-blur-md"
                style={{
                  background: isBright ? 'rgba(255, 255, 255, 0.85)' : 'rgba(5, 5, 8, 0.8)',
                  borderColor: theme.border,
                  color: theme.accent
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                Artist Portal
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Mode Switcher Bar */}
      {isRealArtist && (
        <div
          className="md:hidden flex items-center justify-around py-2 border-t px-4 backdrop-blur-lg"
          style={{
            background: theme.panelBg,
            borderColor: theme.border
          }}
        >
          <button
            onClick={() => setCurrentView('viewer')}
            className="flex items-center gap-1.5 text-xs font-semibold py-1 px-3 rounded-lg"
            style={{
              background: currentView === 'viewer' ? theme.accent : 'transparent',
              color: currentView === 'viewer' ? '#ffffff' : theme.textSecondary
            }}
          >
            <Headphones className="w-3.5 h-3.5" />
            Music Lounge
          </button>
          <button
            onClick={() => setCurrentView('studio')}
            className="flex items-center gap-1.5 text-xs font-semibold py-1 px-3 rounded-lg"
            style={{
              background: currentView === 'studio' ? theme.accent : 'transparent',
              color: currentView === 'studio' ? '#ffffff' : theme.textSecondary
            }}
          >
            <Sliders className="w-3.5 h-3.5" />
            Creator Studio
          </button>
          {onOpenGateway && (
            <button
              onClick={onOpenGateway}
              className="flex items-center gap-1.5 text-xs font-semibold py-1 px-3 rounded-lg"
              style={{ color: theme.textSecondary }}
            >
              <DoorOpen className="w-3.5 h-3.5" style={{ color: theme.accent }} />
              Gate
            </button>
          )}
        </div>
      )}
    </header>
  );
}
