import React, { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  X,
  MessageSquare,
  Send,
  Clock,
  Trash2,
  ShieldCheck,
  Headphones,
  Flame
} from 'lucide-react';

export default function CommentsDrawer({ onOpenAuth }) {
  const { currentSong, showComments, setShowComments, currentTime, seek, setCurrentSong } = usePlayer();
  const { user, token, isArtist } = useAuth();
  const { theme } = useTheme();

  const [comments, setComments] = useState([]);
  const [newText, setNewText] = useState('');
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentSong || !showComments) return;

    async function fetchComments() {
      try {
        const res = await fetch(`/api/songs/${currentSong.id}/comments`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments || []);
        }
      } catch (err) {
        console.error('Fetch comments error:', err);
      }
    }

    fetchComments();
  }, [currentSong?.id, showComments]);

  if (!showComments || !currentSong) return null;

  const formatSec = (secs) => {
    if (secs == null) return null;
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentSecFormatted = formatSec(currentTime);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!user) {
      if (onOpenAuth) onOpenAuth('viewer');
      return;
    }
    if (!newText.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/songs/${currentSong.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: newText.trim(),
          timestampSec: includeTimestamp ? Math.floor(currentTime) : null
        })
      });

      const data = await res.json();
      if (res.ok) {
        setComments(prev => [...prev, data.comment]);
        setNewText('');
        setIncludeTimestamp(false);

        setCurrentSong(prev => prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(`/api/songs/${currentSong.id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        setCurrentSong(prev => prev ? { ...prev, commentsCount: Math.max(0, (prev.commentsCount || 1) - 1) } : null);
      }
    } catch (err) {
      console.error('Delete comment error', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-md p-0 sm:p-4 animate-fade-in">
      <div
        className="w-full sm:max-w-lg h-full sm:h-[90vh] border-l sm:border sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up glass-card backdrop-blur-2xl"
        style={{
          background: theme.cardBg,
          borderColor: theme.border
        }}
      >
        {/* Header */}
        <div
          className="p-5 border-b flex items-center justify-between backdrop-blur-md"
          style={{
            background: 'rgba(5, 5, 8, 0.65)',
            borderColor: 'rgba(255, 255, 255, 0.08)'
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl border flex items-center justify-center"
              style={{
                background: `rgba(${theme.accentRgb}, 0.15)`,
                borderColor: `rgba(${theme.accentRgb}, 0.35)`,
                color: theme.accent
              }}
            >
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Viewer Comments & Reactions
              </h3>
              <p className="text-[11px] text-slate-400">
                {comments.length} comments on <span className="text-white font-medium">"{currentSong.title}"</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowComments(false)}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {comments.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-700 mb-2" />
              <p className="font-semibold text-slate-400 mb-1">No comments yet</p>
              <p>Be the first listener to share your thoughts on this track!</p>
            </div>
          ) : (
            comments.map(c => {
              const canDelete = isArtist || (user && user.id === c.userId);

              return (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl border text-xs backdrop-blur-md"
                  style={{
                    background: 'rgba(5, 5, 8, 0.55)',
                    borderColor: 'rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <img
                        src={c.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                        alt={c.username}
                        className="w-6 h-6 rounded-lg object-cover border border-white/10"
                      />
                      <span className="font-semibold text-white">{c.username}</span>

                      {c.role === 'artist' && (
                        <span
                          className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border font-bold"
                          style={{
                            background: `rgba(${theme.accentRgb}, 0.15)`,
                            color: theme.accentLight,
                            borderColor: `rgba(${theme.accentRgb}, 0.35)`
                          }}
                        >
                          <Flame className="w-2.5 h-2.5" style={{ color: theme.accent }} /> Creator
                        </span>
                      )}

                      {/* Timestamp tag */}
                      {c.timestampSec != null && (
                        <button
                          onClick={() => seek(c.timestampSec)}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-mono transition-colors"
                          style={{
                            background: `rgba(${theme.accentRgb}, 0.2)`,
                            color: theme.accentLight,
                            borderColor: `rgba(${theme.accentRgb}, 0.4)`
                          }}
                          title="Click to jump to this moment in the song"
                        >
                          <Clock className="w-2.5 h-2.5" />
                          {formatSec(c.timestampSec)}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-300 pl-8 leading-relaxed">
                    {c.text}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Add Comment Input Form */}
        <div
          className="p-4 border-t backdrop-blur-md"
          style={{
            background: 'rgba(5, 5, 8, 0.75)',
            borderColor: 'rgba(255, 255, 255, 0.08)'
          }}
        >
          {user ? (
            <form onSubmit={handlePostComment} className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Commenting as <strong className="text-white">{user.displayName}</strong></span>

                <button
                  type="button"
                  onClick={() => setIncludeTimestamp(prev => !prev)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] transition-colors"
                  style={{
                    background: includeTimestamp ? `rgba(${theme.accentRgb}, 0.25)` : 'transparent',
                    color: includeTimestamp ? theme.accentLight : '#94a3b8',
                    borderColor: includeTimestamp ? `rgba(${theme.accentRgb}, 0.45)` : 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <Clock className="w-3 h-3" />
                  Tag at {currentSecFormatted}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Drop a thought, reaction, or words of encouragement..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="flex-1 text-xs text-white px-3.5 py-2.5 rounded-xl border focus:outline-none backdrop-blur-md"
                  style={{
                    background: 'rgba(8, 8, 12, 0.7)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !newText.trim()}
                  className="px-4 py-2.5 text-white rounded-xl text-xs font-semibold shadow-lg flex items-center justify-center transition-all disabled:opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
                    boxShadow: `0 0 15px -3px ${theme.glow}`
                  }}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-slate-400 mb-2">Sign in to leave a comment and support the artist</p>
              <button
                type="button"
                onClick={() => onOpenAuth('viewer')}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white shadow-md transition-all"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
                  boxShadow: `0 0 15px -3px ${theme.glow}`
                }}
              >
                Sign In as Viewer
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
