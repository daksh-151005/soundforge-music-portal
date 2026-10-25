import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';
import {
  PlusCircle,
  Trash2,
  Edit3,
  Play,
  Pause,
  Mic,
  Music,
  Headphones,
  Heart,
  MessageSquare,
  Sparkles,
  Sliders,
  CheckCircle,
  AlertTriangle,
  FileText,
  Flame
} from 'lucide-react';

export default function ArtistStudio({
  songs = [],
  onOpenUpload,
  onEditSong,
  onDeleteSong,
  onOpenLyrics
}) {
  const { user } = useAuth();
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { theme } = useTheme();

  const [deleteConfirmSong, setDeleteConfirmSong] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Compute studio metrics
  const totalStreams = songs.reduce((acc, s) => acc + (s.plays || 0), 0);
  const totalLikes = songs.reduce((acc, s) => acc + (s.likesCount || 0), 0);
  const totalComments = songs.reduce((acc, s) => acc + (s.commentsCount || 0), 0);
  const voiceMemosCount = songs.filter(s => s.isVoiceRecording).length;

  const handleConfirmDelete = async () => {
    if (!deleteConfirmSong) return;
    setDeleting(true);
    await onDeleteSong(deleteConfirmSong);
    setDeleting(false);
    setDeleteConfirmSong(null);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Studio Header Banner (Translucent Frosted Glass) */}
      <div
        className="rounded-3xl glass-card border p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-2xl transition-all duration-300"
        style={{
          background: theme.cardBg,
          borderColor: theme.border
        }}
      >
        <div
          className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: theme.accent }}
        />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'}
              alt={user?.displayName}
              className="w-20 h-20 rounded-2xl object-cover border-2 shadow-xl"
              style={{
                borderColor: theme.accent,
                boxShadow: `0 0 20px -3px ${theme.glow}`
              }}
            />
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {user?.displayName || 'Artist Studio'}
                </h1>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                  style={{
                    background: `rgba(${theme.accentRgb}, 0.15)`,
                    color: theme.accentLight,
                    borderColor: `rgba(${theme.accentRgb}, 0.35)`
                  }}
                >
                  Creator Admin Portal
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                {user?.bio || 'Produce your music, upload raw saved voice recordings or studio mixes, and manage your artist catalog.'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2.5 px-6 py-3.5 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0"
            style={{
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
              boxShadow: `0 0 25px -4px ${theme.glow}`
            }}
          >
            <PlusCircle className="w-5 h-5" />
            Upload Voice Note / Song
          </button>
        </div>

        {/* Analytics Snapshot Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-8 pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <div
            className="p-4 rounded-2xl border backdrop-blur-md"
            style={{
              background: 'rgba(5, 5, 8, 0.55)',
              borderColor: 'rgba(255, 255, 255, 0.08)'
            }}
          >
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Total Tracks</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{songs.length}</span>
              <span className="text-[10px]" style={{ color: theme.accentLight }}>({voiceMemosCount} voice memos)</span>
            </div>
          </div>

          <div
            className="p-4 rounded-2xl border backdrop-blur-md"
            style={{
              background: 'rgba(5, 5, 8, 0.55)',
              borderColor: 'rgba(255, 255, 255, 0.08)'
            }}
          >
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Total Streams</span>
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-slate-300" />
              <span className="text-2xl font-bold text-white">{totalStreams}</span>
            </div>
          </div>

          <div
            className="p-4 rounded-2xl border backdrop-blur-md"
            style={{
              background: 'rgba(5, 5, 8, 0.55)',
              borderColor: 'rgba(255, 255, 255, 0.08)'
            }}
          >
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Fan Favorites</span>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" style={{ color: theme.accent }} />
              <span className="text-2xl font-bold text-white">{totalLikes}</span>
            </div>
          </div>

          <div
            className="p-4 rounded-2xl border backdrop-blur-md"
            style={{
              background: 'rgba(5, 5, 8, 0.55)',
              borderColor: 'rgba(255, 255, 255, 0.08)'
            }}
          >
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Viewer Comments</span>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span className="text-2xl font-bold text-white">{totalComments}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Song Management Section (Translucent Frosted Glass) */}
      <div
        className="glass-card rounded-3xl border p-6 sm:p-8 backdrop-blur-2xl transition-all duration-300"
        style={{
          background: theme.cardBg,
          borderColor: theme.border
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5" style={{ color: theme.accent }} />
              Song Catalog & Voice Memos Management
            </h2>
            <p className="text-xs text-slate-400">
              Upload, preview, edit, or delete any song with immediate disk cleanup.
            </p>
          </div>

          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border backdrop-blur-md"
            style={{
              background: 'rgba(5, 5, 8, 0.65)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              color: '#e2e8f0'
            }}
          >
            {songs.length} Tracks Live
          </span>
        </div>

        {songs.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Mic className="w-12 h-12 mx-auto mb-3 opacity-60" style={{ color: theme.accent }} />
            <p className="text-sm font-semibold text-white mb-1">No songs in your catalog yet</p>
            <p className="text-xs text-slate-500 mb-4">Upload your first voice recording saved on your computer!</p>
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 text-white rounded-xl text-xs font-semibold shadow-lg"
              style={{
                backgroundColor: theme.accent
              }}
            >
              Upload Song
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-semibold">
                  <th className="pb-3 pl-3">Track</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Genre</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Plays</th>
                  <th className="pb-3">Likes</th>
                  <th className="pb-3 text-right pr-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {songs.map((song) => {
                  const isCurrent = currentSong?.id === song.id;
                  const isThisPlaying = isCurrent && isPlaying;

                  return (
                    <tr
                      key={song.id}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      {/* Track info & play */}
                      <td className="py-3.5 pl-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              if (isCurrent) togglePlay();
                              else playSong(song, songs);
                            }}
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all text-white"
                            style={{
                              backgroundColor: isThisPlaying ? theme.accent : 'rgba(255, 255, 255, 0.08)',
                              boxShadow: isThisPlaying ? `0 0 15px ${theme.glow}` : 'none'
                            }}
                          >
                            {isThisPlaying ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current translate-x-0.5" />
                            )}
                          </button>

                          <img
                            src={song.coverUrl}
                            alt={song.title}
                            className="w-9 h-9 rounded-lg object-cover border border-white/10"
                          />

                          <div>
                            <p className="font-semibold text-white line-clamp-1">{song.title}</p>
                            <p className="text-[11px] text-slate-400">{new Date(song.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5">
                        {song.isVoiceRecording ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md"
                            style={{
                              background: 'rgba(5, 5, 8, 0.65)',
                              color: theme.accentLight,
                              borderColor: `rgba(${theme.accentRgb}, 0.4)`
                            }}
                          >
                            <Mic className="w-2.5 h-2.5" style={{ color: theme.accent }} /> Voice Memo
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md"
                            style={{
                              background: `rgba(${theme.accentRgb}, 0.2)`,
                              color: theme.accentLight,
                              borderColor: `rgba(${theme.accentRgb}, 0.35)`
                            }}
                          >
                            <Music className="w-2.5 h-2.5" style={{ color: theme.accent }} /> Studio
                          </span>
                        )}
                      </td>

                      {/* Genre */}
                      <td className="py-3.5 text-slate-300">{song.genre}</td>

                      {/* Duration */}
                      <td className="py-3.5 font-mono text-slate-400">{song.duration}</td>

                      {/* Plays */}
                      <td className="py-3.5 text-slate-300 font-mono">
                        <span className="flex items-center gap-1">
                          <Headphones className="w-3 h-3 text-slate-400" />
                          {song.plays || 0}
                        </span>
                      </td>

                      {/* Likes */}
                      <td className="py-3.5 text-slate-300 font-mono">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" style={{ color: theme.accent }} />
                          {song.likesCount || 0}
                        </span>
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="py-3.5 pr-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {song.lyrics && (
                            <button
                              onClick={() => {
                                playSong(song, songs);
                                if (onOpenLyrics) onOpenLyrics();
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                              title="View Lyrics"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => onEditSong(song)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/10 transition-colors"
                            title="Edit Track Metadata"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmSong(song)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Track"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-black/90 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-100 animate-slide-up">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Song from Site?</h3>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Are you sure you want to permanently delete <strong className="text-white">"{deleteConfirmSong.title}"</strong>?
              This will remove the audio recording and artwork from your site.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setDeleteConfirmSong(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg flex items-center gap-1.5"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Song'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
