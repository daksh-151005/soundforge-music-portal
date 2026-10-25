import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Play,
  Pause,
  Heart,
  Headphones,
  MessageSquare,
  Mic,
  Music2,
  Trash2,
  Edit3
} from 'lucide-react';

export default function TrackCard({
  song,
  allSongs = [],
  onEdit,
  onDelete,
  onOpenAuth
}) {
  const { currentSong, isPlaying, playSong, togglePlay, toggleLike, setShowComments } = usePlayer();
  const { user, isArtist } = useAuth();
  const { theme, isBright } = useTheme();

  const isRealArtist = Boolean(isArtist && user?.role === 'artist');
  const isCurrent = currentSong?.id === song.id;
  const isThisPlaying = isCurrent && isPlaying;

  const handlePlayToggle = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, allSongs);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      if (onOpenAuth) onOpenAuth('viewer');
      return;
    }
    await toggleLike(song.id);
  };

  return (
    <div
      onClick={() => {
        if (!isCurrent) playSong(song, allSongs);
      }}
      className="group relative rounded-2xl p-4 transition-all duration-300 cursor-pointer glass-card backdrop-blur-xl border"
      style={{
        background: theme.cardBg,
        borderColor: isCurrent ? theme.accent : theme.border,
        boxShadow: isCurrent ? `0 0 25px -4px ${theme.glow}` : 'none'
      }}
    >
      {/* Cover Image Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3.5 bg-black/60 border border-white/5">
        <img
          src={song.coverUrl}
          alt={song.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isThisPlaying ? 'scale-105 filter brightness-105' : ''
          }`}
          loading="lazy"
        />

        {/* Ambient Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-70 group-hover:opacity-40 transition-opacity" />

        {/* Type Badge: Voice Memo vs Studio Track */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {song.isVoiceRecording ? (
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-md shadow-md"
              style={{
                background: 'rgba(5, 5, 8, 0.75)',
                color: theme.accentLight,
                borderColor: `rgba(${theme.accentRgb}, 0.4)`
              }}
            >
              <Mic className="w-3 h-3" style={{ color: theme.accent }} /> Voice Memo
            </span>
          ) : (
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-white backdrop-blur-md shadow-md"
              style={{
                backgroundColor: theme.accent
              }}
            >
              <Music2 className="w-3 h-3" /> Studio
            </span>
          )}
        </div>

        {/* Play Button Overlay */}
        <button
          onClick={handlePlayToggle}
          className={`absolute bottom-3 right-3 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
            isThisPlaying
              ? 'scale-100 text-white'
              : 'bg-white/95 hover:bg-white text-black opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-90'
          }`}
          style={{
            backgroundColor: isThisPlaying ? theme.accent : undefined,
            boxShadow: isThisPlaying ? `0 0 20px ${theme.glow}` : undefined
          }}
          title={isThisPlaying ? 'Pause track' : 'Play track'}
        >
          {isThisPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          )}
        </button>

        {/* Live Audio Waves indicator if playing */}
        {isThisPlaying && (
          <div className="absolute bottom-3 left-3 flex items-end gap-0.5 h-4 bg-black/75 px-2 py-1 rounded backdrop-blur border border-white/10">
            <span className="w-1 rounded-full animate-sound-bar" style={{ backgroundColor: theme.accent, animationDelay: '0.1s' }} />
            <span className="w-1 rounded-full animate-sound-bar" style={{ backgroundColor: theme.accentLight, animationDelay: '0.3s' }} />
            <span className="w-1 rounded-full animate-sound-bar" style={{ backgroundColor: theme.accentHover, animationDelay: '0.2s' }} />
          </div>
        )}
      </div>

      {/* Track Details */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3
            className="font-semibold text-sm line-clamp-1 transition-colors"
            style={{
              color: isCurrent ? theme.accentLight : theme.textPrimary
            }}
          >
            {song.title}
          </h3>
          <span className="text-[11px] font-mono shrink-0" style={{ color: theme.textMuted }}>
            {song.duration}
          </span>
        </div>

        <p className="text-xs mb-2 truncate" style={{ color: theme.textSecondary }}>
          {song.genre} • <span>{song.mood}</span>
        </p>

        {/* Behind the song teaser */}
        {song.story && (
          <p
            className="text-[11px] italic line-clamp-2 mb-3 p-2 rounded-lg border backdrop-blur-md"
            style={{
              background: isBright ? 'rgba(0, 0, 0, 0.03)' : 'rgba(5, 5, 8, 0.45)',
              borderColor: theme.border,
              color: theme.textSecondary
            }}
          >
            "{song.story}"
          </p>
        )}

        {/* Stats & Actions Row */}
        <div
          className="flex items-center justify-between text-xs pt-2 border-t"
          style={{ borderColor: isBright ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)' }}
        >
          <div className="flex items-center gap-3" style={{ color: theme.textSecondary }}>
            <span className="flex items-center gap-1">
              <Headphones className="w-3.5 h-3.5" style={{ color: theme.accent }} />
              {song.plays || 0}
            </span>

            <button
              onClick={handleLike}
              className="flex items-center gap-1 transition-colors"
              style={{
                color: song.isLiked ? theme.accent : undefined
              }}
            >
              <Heart
                className="w-3.5 h-3.5"
                style={{
                  fill: song.isLiked ? theme.accent : 'none',
                  color: song.isLiked ? theme.accent : undefined
                }}
              />
              {song.likesCount || 0}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isCurrent) playSong(song, allSongs);
                setShowComments(true);
              }}
              className="flex items-center gap-1 transition-colors hover:scale-105"
              style={{ color: theme.textSecondary }}
              title="View comments"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {song.commentsCount || 0}
            </button>
          </div>

          {/* Artist Management Controls: Edit / Delete (STRICTLY FOR ARTIST ONLY) */}
          {isRealArtist && (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {onEdit && (
                <button
                  onClick={() => onEdit(song)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                  title="Edit Song Details"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(song)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete Song"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
