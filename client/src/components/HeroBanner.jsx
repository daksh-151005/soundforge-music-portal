import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Play,
  Pause,
  Sparkles,
  Mic,
  Music,
  Headphones,
  Heart,
  Radio,
  FileText,
  Flame
} from 'lucide-react';

export default function HeroBanner({
  featuredSong,
  allSongs = [],
  filterMode,
  setFilterMode,
  activeGenre,
  setActiveGenre
}) {
  const { currentSong, isPlaying, playSong, togglePlay, setShowLyrics } = usePlayer();
  const { user, isArtist } = useAuth();
  const { theme, isBright } = useTheme();

  const isRealArtist = Boolean(isArtist && user?.role === 'artist');
  const isThisPlaying = currentSong?.id === featuredSong?.id && isPlaying;

  const handleHeroPlay = () => {
    if (!featuredSong) return;
    if (currentSong?.id === featuredSong.id) {
      togglePlay();
    } else {
      playSong(featuredSong, allSongs);
    }
  };

  return (
    <div
      className="relative mb-10 overflow-hidden rounded-3xl glass-card backdrop-blur-2xl border shadow-2xl transition-all duration-300"
      style={{
        background: theme.cardBg,
        borderColor: theme.border
      }}
    >
      {/* Background ambient flame glow adapting to theme */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-700"
        style={{ backgroundColor: theme.accent }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-15 transition-all duration-700"
        style={{ backgroundColor: theme.accentDark }}
      />

      {featuredSong ? (
        <div className="relative z-10 p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row items-center gap-8 justify-between">
          
          {/* Left: Featured Track Content */}
          <div className="flex-1 text-center lg:text-left">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border mb-4 backdrop-blur-md"
              style={{
                background: `rgba(${theme.accentRgb}, 0.15)`,
                color: theme.accentLight,
                borderColor: `rgba(${theme.accentRgb}, 0.35)`
              }}
            >
              <Flame className="w-3.5 h-3.5" style={{ color: theme.accent }} />
              Featured Release
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3" style={{ color: theme.textPrimary }}>
              {featuredSong.title}
            </h1>

            <p className="text-sm sm:text-base max-w-2xl mb-4 line-clamp-2" style={{ color: theme.textSecondary }}>
              {featuredSong.story || 'Written and produced in home studio, capturing raw emotions, intricate guitar lines, and intimate vocal textures.'}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs mb-6" style={{ color: theme.textSecondary }}>
              <span
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border backdrop-blur-md"
                style={{
                  background: isBright ? 'rgba(0, 0, 0, 0.04)' : 'rgba(5, 5, 8, 0.65)',
                  borderColor: theme.border,
                  color: theme.textSecondary
                }}
              >
                <Music className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                {featuredSong.genre}
              </span>
              <span
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border backdrop-blur-md"
                style={{
                  background: isBright ? 'rgba(0, 0, 0, 0.04)' : 'rgba(5, 5, 8, 0.65)',
                  borderColor: theme.border,
                  color: theme.textSecondary
                }}
              >
                <Headphones className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                {featuredSong.plays || 0} Streams
              </span>
              <span
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border backdrop-blur-md"
                style={{
                  background: isBright ? 'rgba(0, 0, 0, 0.04)' : 'rgba(5, 5, 8, 0.65)',
                  borderColor: theme.border,
                  color: theme.textSecondary
                }}
              >
                <Heart className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                {featuredSong.likesCount || 0} Favorites
              </span>
              {featuredSong.isVoiceRecording && (
                <span
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium backdrop-blur-md"
                  style={{
                    background: `rgba(${theme.accentRgb}, 0.15)`,
                    color: theme.accentLight,
                    borderColor: `rgba(${theme.accentRgb}, 0.35)`
                  }}
                >
                  <Mic className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                  Voice Recording Demo
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <button
                onClick={handleHeroPlay}
                className="flex items-center gap-2.5 px-6 py-3 rounded-2xl text-white font-semibold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
                  boxShadow: `0 0 25px -4px ${theme.glow}`
                }}
              >
                {isThisPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" /> Pause Song
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> Listen Now
                  </>
                )}
              </button>

              {featuredSong.lyrics && (
                <button
                  onClick={() => {
                    if (currentSong?.id !== featuredSong.id) playSong(featuredSong, allSongs);
                    setShowLyrics(true);
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl border font-medium text-sm transition-all hover:scale-105 backdrop-blur-md"
                  style={{
                    background: isBright ? 'rgba(255, 255, 255, 0.85)' : 'rgba(10, 10, 15, 0.65)',
                    borderColor: theme.border,
                    color: theme.textPrimary
                  }}
                >
                  <FileText className="w-4 h-4" style={{ color: theme.accent }} />
                  Read Lyrics & Story
                </button>
              )}
            </div>
          </div>

          {/* Right: Featured Cover Artwork with vinyl aesthetic */}
          <div className="relative group cursor-pointer" onClick={handleHeroPlay}>
            <div
              className="w-48 h-48 sm:w-60 sm:h-60 rounded-2xl overflow-hidden shadow-2xl border-2 relative transition-transform duration-500 group-hover:scale-102"
              style={{ borderColor: theme.border }}
            >
              <img
                src={featuredSong.coverUrl}
                alt={featuredSong.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

              {/* Floating center play icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl text-white"
                  style={{
                    backgroundColor: isThisPlaying ? theme.accent : 'rgba(0, 0, 0, 0.75)',
                    boxShadow: isThisPlaying ? `0 0 20px ${theme.glow}` : 'none'
                  }}
                >
                  {isThisPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current translate-x-0.5" />
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="p-8 text-center" style={{ color: theme.textSecondary }}>
          <Music className="w-10 h-10 mx-auto mb-2" style={{ color: theme.accent }} />
          <h2 className="text-xl font-bold mb-1" style={{ color: theme.textPrimary }}>Welcome to SoundForge Music</h2>
          <p className="text-xs">
            {isRealArtist
              ? 'Upload your first song or voice memo from Creator Studio to begin!'
              : 'New recorded songs and voice memos coming soon. Stay tuned!'}
          </p>
        </div>
      )}

      {/* Filter Tabs strip */}
      <div
        className="border-t px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs backdrop-blur-md"
        style={{
          background: isBright ? 'rgba(255, 255, 255, 0.75)' : 'rgba(5, 5, 8, 0.65)',
          borderColor: theme.border
        }}
      >
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="font-semibold mr-1" style={{ color: theme.textSecondary }}>Browse:</span>
          {['all', 'voice-memos', 'studio'].map(mode => {
            const isActive = filterMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className="px-3 py-1.5 rounded-xl font-medium transition-all border"
                style={{
                  background: isActive ? `rgba(${theme.accentRgb}, 0.2)` : 'transparent',
                  color: isActive ? theme.accentLight : theme.textSecondary,
                  borderColor: isActive ? `rgba(${theme.accentRgb}, 0.4)` : 'transparent'
                }}
              >
                {mode === 'all' && 'All Music'}
                {mode === 'voice-memos' && '🎙️ Voice Memos & Demos'}
                {mode === 'studio' && '🎵 Studio Masters'}
              </button>
            );
          })}
        </div>

        <div className="text-xs" style={{ color: theme.textSecondary }}>
          Showing <span className="font-bold" style={{ color: theme.accent }}>{allSongs.length}</span> recorded songs & demos
        </div>
      </div>
    </div>
  );
}
