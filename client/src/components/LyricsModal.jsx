import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';
import { X, FileText, Sparkles, Mic, Music, Calendar, Flame } from 'lucide-react';

export default function LyricsModal() {
  const { currentSong, showLyrics, setShowLyrics } = usePlayer();
  const { theme } = useTheme();

  if (!showLyrics || !currentSong) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-md p-0 sm:p-4 animate-fade-in">
      <div
        className="w-full sm:max-w-lg h-full sm:h-[90vh] border-l sm:border sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up glass-card backdrop-blur-2xl"
        style={{
          background: theme.cardBg,
          borderColor: theme.border
        }}
      >
        {/* Drawer Header */}
        <div
          className="p-5 border-b flex items-center justify-between backdrop-blur-md"
          style={{
            background: 'rgba(5, 5, 8, 0.65)',
            borderColor: 'rgba(255, 255, 255, 0.08)'
          }}
        >
          <div className="flex items-center gap-3">
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="w-12 h-12 rounded-xl object-cover border border-white/10"
            />
            <div>
              <h3 className="font-bold text-white text-sm line-clamp-1">
                {currentSong.title}
              </h3>
              <p className="text-xs text-slate-400">
                {currentSong.artistName || 'Daksh'} • {currentSong.genre}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowLyrics(false)}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Behind the song / Artist Notes */}
          {currentSong.story && (
            <div
              className="p-4 rounded-2xl border backdrop-blur-md"
              style={{
                background: `rgba(${theme.accentRgb}, 0.12)`,
                borderColor: `rgba(${theme.accentRgb}, 0.3)`
              }}
            >
              <div className="flex items-center gap-2 text-xs font-bold mb-2" style={{ color: theme.accentLight }}>
                <Flame className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                Artist's Story & Creative Process
              </div>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                "{currentSong.story}"
              </p>
            </div>
          )}

          {/* Voice Memo notice if applicable */}
          {currentSong.isVoiceRecording && (
            <div
              className="p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs backdrop-blur-md"
              style={{
                background: `rgba(${theme.accentRgb}, 0.15)`,
                borderColor: `rgba(${theme.accentRgb}, 0.35)`,
                color: theme.accentLight
              }}
            >
              <Mic className="w-4 h-4 shrink-0" style={{ color: theme.accent }} />
              <span>
                This track is an authentic <strong>Voice Memo Recording</strong>, preserved in its original unedited emotional state.
              </span>
            </div>
          )}

          {/* Song Lyrics */}
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
              <FileText className="w-3.5 h-3.5" style={{ color: theme.accent }} />
              Lyrics
            </div>

            {currentSong.lyrics ? (
              <div
                className="p-5 rounded-2xl border font-mono text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line backdrop-blur-md"
                style={{
                  background: 'rgba(5, 5, 8, 0.55)',
                  borderColor: 'rgba(255, 255, 255, 0.08)'
                }}
              >
                {currentSong.lyrics}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No lyrics transcribed for this audio yet.
              </div>
            )}
          </div>

        </div>

        {/* Drawer Footer */}
        <div
          className="p-4 border-t flex items-center justify-between text-[11px] text-slate-500 backdrop-blur-md"
          style={{
            background: 'rgba(5, 5, 8, 0.65)',
            borderColor: 'rgba(255, 255, 255, 0.08)'
          }}
        >
          <span>Released by {currentSong.artistName || 'Daksh'}</span>
          <span>{currentSong.duration}</span>
        </div>

      </div>
    </div>
  );
}
