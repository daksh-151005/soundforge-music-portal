import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AudioVisualizer from './AudioVisualizer';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  FileText,
  MessageSquare,
  Mic
} from 'lucide-react';

export default function AudioPlayer({ onOpenAuth }) {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    isLooping,
    setIsLooping,
    isShuffle,
    setIsShuffle,
    togglePlay,
    seek,
    nextSong,
    prevSong,
    toggleLike,
    showLyrics,
    setShowLyrics,
    showComments,
    setShowComments
  } = usePlayer();

  const { user } = useAuth();
  const { theme } = useTheme();

  if (!currentSong) return null;

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekChange = (e) => {
    const val = parseFloat(e.target.value);
    seek(val);
  };

  const handleLikeClick = async () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth('viewer');
      return;
    }
    await toggleLike(currentSong.id);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t backdrop-blur-2xl shadow-2xl transition-all duration-300"
      style={{
        background: theme.panelBg,
        borderColor: theme.border
      }}
    >
      {/* Top micro progress bar */}
      <div
        className="w-full h-1 cursor-pointer relative group"
        style={{ background: 'rgba(255, 255, 255, 0.08)' }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const newPercent = clickX / rect.width;
          seek(newPercent * duration);
        }}
      >
        <div
          className="h-full transition-all duration-100"
          style={{
            width: `${progressPercent}%`,
            background: `linear-gradient(to right, ${theme.accentDark}, ${theme.accent}, ${theme.accentLight})`
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none"
          style={{ left: `calc(${progressPercent}% - 6px)` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        
        {/* LEFT: Current Track Info */}
        <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
          <div className="relative group cursor-pointer" onClick={() => setShowLyrics(prev => !prev)}>
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="w-13 h-13 rounded-lg object-cover shadow-lg border transition-transform group-hover:scale-105"
              style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
            />
            {currentSong.isVoiceRecording && (
              <span
                className="absolute -top-1.5 -right-1.5 text-white p-1 rounded-full text-[10px] shadow-md"
                style={{ backgroundColor: theme.accent }}
                title="Voice Memo Recording"
              >
                <Mic className="w-3 h-3" />
              </span>
            )}
          </div>

          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <h4
                className="text-sm font-semibold truncate hover:underline cursor-pointer"
                style={{ color: theme.textPrimary }}
                onClick={() => setShowLyrics(prev => !prev)}
              >
                {currentSong.title}
              </h4>
              {currentSong.isVoiceRecording && (
                <span
                  className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border whitespace-nowrap"
                  style={{
                    background: `rgba(${theme.accentRgb}, 0.15)`,
                    color: theme.accentLight,
                    borderColor: `rgba(${theme.accentRgb}, 0.3)`
                  }}
                >
                  Voice Memo
                </span>
              )}
            </div>
            <p className="text-xs truncate" style={{ color: theme.textSecondary }}>
              {currentSong.artistName || 'Daksh'} • <span>{currentSong.genre}</span>
            </p>
          </div>

          <button
            onClick={handleLikeClick}
            className="p-2 rounded-full transition-colors ml-1 text-slate-400 hover:text-white"
            style={{
              color: currentSong.isLiked ? theme.accent : undefined
            }}
            title={currentSong.isLiked ? 'Unlike track' : 'Add to favorites'}
          >
            <Heart
              className="w-4 h-4"
              style={{
                fill: currentSong.isLiked ? theme.accent : 'none',
                color: currentSong.isLiked ? theme.accent : undefined
              }}
            />
          </button>
        </div>

        {/* CENTER: Playback Controls & Waveform/Seeker */}
        <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-2xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsShuffle(prev => !prev)}
              className="p-1.5 rounded-full text-xs transition-colors"
              style={{
                color: isShuffle ? theme.accent : '#94a3b8',
                fontWeight: isShuffle ? 'bold' : 'normal'
              }}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={prevSong}
              className="p-1.5 text-slate-300 hover:text-white transition-colors"
              title="Previous"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
                boxShadow: `0 0 20px -3px ${theme.glow}`
              }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={nextSong}
              className="p-1.5 text-slate-300 hover:text-white transition-colors"
              title="Next"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={() => setIsLooping(prev => !prev)}
              className="p-1.5 rounded-full text-xs transition-colors"
              style={{
                color: isLooping ? theme.accent : '#94a3b8',
                fontWeight: isLooping ? 'bold' : 'normal'
              }}
              title={isLooping ? 'Loop: On' : 'Loop: Off'}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Time & Interactive Scrubber */}
          <div className="w-full flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span className="w-9 text-right">{formatTime(currentTime)}</span>

            <div className="relative flex-1 flex items-center group py-1">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeekChange}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  accentColor: theme.accent
                }}
              />
            </div>

            <span className="w-9">{formatTime(duration)}</span>
          </div>
        </div>

        {/* RIGHT: Actions, Spectrum & Volume */}
        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[220px]">
          {/* Mini Visualizer */}
          <div className="hidden lg:block">
            <AudioVisualizer className="w-20 h-7 bg-black/60 p-1 border border-white/5 backdrop-blur-md" />
          </div>

          {/* Lyrics toggle */}
          <button
            onClick={() => setShowLyrics(prev => !prev)}
            className="p-2 rounded-lg text-xs flex items-center gap-1.5 transition-all border"
            style={{
              background: showLyrics ? `rgba(${theme.accentRgb}, 0.25)` : 'transparent',
              color: showLyrics ? theme.accentLight : '#94a3b8',
              borderColor: showLyrics ? `rgba(${theme.accentRgb}, 0.4)` : 'transparent'
            }}
            title="Lyrics & Story"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Lyrics</span>
          </button>

          {/* Comments toggle */}
          <button
            onClick={() => setShowComments(prev => !prev)}
            className="p-2 rounded-lg text-xs flex items-center gap-1.5 transition-all relative border"
            style={{
              background: showComments ? `rgba(${theme.accentRgb}, 0.25)` : 'transparent',
              color: showComments ? theme.accentLight : '#94a3b8',
              borderColor: showComments ? `rgba(${theme.accentRgb}, 0.4)` : 'transparent'
            }}
            title="Listener Comments"
          >
            <MessageSquare className="w-4 h-4" />
            {currentSong.commentsCount > 0 && (
              <span
                className="text-[10px] text-white px-1 rounded-full font-bold"
                style={{ backgroundColor: theme.accent }}
              >
                {currentSong.commentsCount}
              </span>
            )}
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 text-slate-400 hover:text-white group">
            <button
              onClick={() => setIsMuted(prev => !prev)}
              className="p-1 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-16 h-1 rounded-lg appearance-none cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                accentColor: theme.accent
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
