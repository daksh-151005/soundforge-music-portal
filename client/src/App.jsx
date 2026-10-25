import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import MusicParticles from './components/MusicParticles';
import GatewayPortal from './components/GatewayPortal';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import TrackCard from './components/TrackCard';
import ArtistStudio from './components/ArtistStudio';
import AudioPlayer from './components/AudioPlayer';
import UploadModal from './components/UploadModal';
import AuthModal from './components/AuthModal';
import LyricsModal from './components/LyricsModal';
import CommentsDrawer from './components/CommentsDrawer';
import {
  Music,
  Mic,
  Sliders,
  Sparkles,
  Headphones,
  Heart,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  Disc3,
  Flame
} from 'lucide-react';

function MainApp() {
  const { user, isArtist, token, logout } = useAuth();
  const { currentSong, playSong } = usePlayer();
  const { theme, isBright } = useTheme();

  const isRealArtist = Boolean(isArtist && user?.role === 'artist');

  // Gateway Portal Entrance: shown first!
  const [hasEntered, setHasEntered] = useState(false);

  // Navigation & filtering state
  const [currentView, setCurrentView] = useState('viewer'); // 'viewer' or 'studio'
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'voice-memos', 'studio'
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialPortal, setAuthInitialPortal] = useState('viewer');
  const [editingSong, setEditingSong] = useState(null);

  // Fetch songs from API
  const fetchSongs = async () => {
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/songs', { headers });
      if (res.ok) {
        const data = await res.json();
        setSongs(data.songs || []);
      }
    } catch (err) {
      console.error('Failed to load songs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [token]);

  // Handle new or updated song
  const handleSongUploaded = (song, isEdit) => {
    if (isEdit) {
      setSongs(prev => prev.map(s => s.id === song.id ? song : s));
    } else {
      setSongs(prev => [song, ...prev]);
      if (!currentSong) {
        playSong(song, [song, ...songs]);
      }
    }
  };

  // Handle Song Deletion
  const handleDeleteSong = async (songToDelete) => {
    try {
      const res = await fetch(`/api/songs/${songToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setSongs(prev => prev.filter(s => s.id !== songToDelete.id));
      }
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  // Filter and search songs
  const filteredSongs = songs.filter(song => {
    if (filterMode === 'voice-memos' && !song.isVoiceRecording) return false;
    if (filterMode === 'studio' && song.isVoiceRecording) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = song.title.toLowerCase().includes(q);
      const matchGenre = song.genre?.toLowerCase().includes(q);
      const matchMood = song.mood?.toLowerCase().includes(q);
      const matchStory = song.story?.toLowerCase().includes(q);
      const matchLyrics = song.lyrics?.toLowerCase().includes(q);
      return matchTitle || matchGenre || matchMood || matchStory || matchLyrics;
    }

    return true;
  });

  const featuredSong = songs.length > 0 ? songs[0] : null;

  const handleOpenAuth = (portal = 'viewer') => {
    setAuthInitialPortal(portal);
    setIsAuthOpen(true);
  };

  const handleEditClick = (song) => {
    setEditingSong(song);
    setIsUploadOpen(true);
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between selection:bg-red-600 selection:text-white transition-colors duration-500 relative"
      style={{ backgroundColor: theme.bg, color: theme.textPrimary }}
    >
      {/* 🎵 Ambient Interactive Floating Music Note Particles (Behind everything) */}
      <MusicParticles />

      {/* 1. DISPLAY LOGIN & GATEWAY PORTAL FIRST */}
      {!hasEntered ? (
        <GatewayPortal
          onEnterAsGuest={() => {
            // Ensure no leftover artist session is active when browsing as listener
            if (user?.role === 'artist') {
              logout();
            }
            setHasEntered(true);
            setCurrentView('viewer');
          }}
          onLoginSuccess={(role) => {
            setHasEntered(true);
            if (role === 'artist') {
              setCurrentView('studio');
            } else {
              setCurrentView('viewer');
            }
          }}
        />
      ) : (
        /* 2. MAIN SITE (OPENS AFTER GATEWAY SELECTION WITH TRANSLUCENT GLASS PANELS) */
        <div className="relative z-10 flex flex-col min-h-screen justify-between animate-fade-in">
          
          {/* Top Navigation */}
          <Navbar
            currentView={currentView}
            setCurrentView={setCurrentView}
            onOpenUpload={() => {
              if (!isRealArtist) return;
              setEditingSong(null);
              setIsUploadOpen(true);
            }}
            onOpenAuth={handleOpenAuth}
            onOpenGateway={() => setHasEntered(false)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 relative z-10">
            
            {/* Creator Studio View */}
            {currentView === 'studio' ? (
              isRealArtist ? (
                <ArtistStudio
                  songs={songs}
                  onOpenUpload={() => {
                    setEditingSong(null);
                    setIsUploadOpen(true);
                  }}
                  onEditSong={handleEditClick}
                  onDeleteSong={handleDeleteSong}
                />
              ) : (
                <div
                  className="text-center py-20 glass-card rounded-3xl p-8 max-w-xl mx-auto border backdrop-blur-2xl"
                  style={{
                    background: theme.cardBg,
                    borderColor: theme.border
                  }}
                >
                  <ShieldCheck
                    className="w-16 h-16 mx-auto mb-4"
                    style={{ color: theme.accent, filter: `drop-shadow(0 0 15px ${theme.glow})` }}
                  />
                  <h2 className="text-2xl font-bold mb-2" style={{ color: theme.textPrimary }}>Artist & Producer Studio Portal</h2>
                  <p className="text-xs mb-6 leading-relaxed" style={{ color: theme.textSecondary }}>
                    This portal is exclusively for the songwriter/producer to upload audio tracks, voice memo recordings, and delete/manage discography songs.
                  </p>
                  <button
                    onClick={() => handleOpenAuth('artist')}
                    className="px-6 py-3 text-white rounded-2xl text-xs font-bold shadow-xl transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
                      boxShadow: `0 0 20px -3px ${theme.glow}`
                    }}
                  >
                    Log In as Artist
                  </button>
                </div>
              )
            ) : (
              /* Viewer & Listener Experience */
              <div>
                {/* Hero Showcase Banner */}
                <HeroBanner
                  featuredSong={featuredSong}
                  allSongs={songs}
                  filterMode={filterMode}
                  setFilterMode={setFilterMode}
                />

                {/* Song Catalog Grid */}
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: theme.textPrimary }}>
                        <Flame className="w-5 h-5" style={{ color: theme.accent }} />
                        {filterMode === 'voice-memos'
                          ? 'Voice Memo Recordings & Acoustic Demos'
                          : filterMode === 'studio'
                          ? 'Studio Mastered Releases'
                          : 'All Songs & Voice Recordings'}
                      </h2>
                      <p className="text-xs" style={{ color: theme.textSecondary }}>
                        Stream high-fidelity audio, read the lyrics, and leave comments on individual timestamps.
                      </p>
                    </div>

                    {/* ONLY VISIBLE TO VERIFIED ARTIST */}
                    {isRealArtist && (
                      <button
                        onClick={() => {
                          setEditingSong(null);
                          setIsUploadOpen(true);
                        }}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold hover:scale-105 transition-all backdrop-blur-md"
                        style={{
                          background: `rgba(${theme.accentRgb}, 0.15)`,
                          color: theme.accentLight,
                          borderColor: `rgba(${theme.accentRgb}, 0.35)`
                        }}
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        + New Upload
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {[1, 2, 3, 4].map(n => (
                        <div
                          key={n}
                          className="glass-card rounded-2xl p-4 animate-pulse border backdrop-blur-xl"
                          style={{
                            background: theme.cardBg,
                            borderColor: theme.border
                          }}
                        >
                          <div className="aspect-square bg-white/5 rounded-xl mb-3" />
                          <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-white/5 rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : filteredSongs.length === 0 ? (
                    <div
                      className="py-16 text-center glass-card rounded-3xl p-8 border backdrop-blur-2xl"
                      style={{
                        background: theme.cardBg,
                        borderColor: theme.border
                      }}
                    >
                      <Music className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                      <h3 className="text-base font-bold mb-1" style={{ color: theme.textPrimary }}>No tracks found</h3>
                      <p className="text-xs mb-4" style={{ color: theme.textSecondary }}>
                        {searchQuery ? `No results matching "${searchQuery}"` : 'No songs in this category yet. Stay tuned for new releases!'}
                      </p>
                      {isRealArtist && (
                        <button
                          onClick={() => {
                            setEditingSong(null);
                            setIsUploadOpen(true);
                          }}
                          className="px-4 py-2 text-white rounded-xl text-xs font-semibold shadow-lg"
                          style={{ backgroundColor: theme.accent }}
                        >
                          Upload Song or Voice Memo
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {filteredSongs.map(song => (
                        <TrackCard
                          key={song.id}
                          song={song}
                          allSongs={songs}
                          onEdit={isRealArtist ? handleEditClick : null}
                          onDelete={isRealArtist ? handleDeleteSong : null}
                          onOpenAuth={handleOpenAuth}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Artist Story & Studio Info Section (Translucent Frosted Glass) */}
                <div
                  className="rounded-3xl glass-card border p-8 my-10 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-2xl transition-all duration-300"
                  style={{
                    background: theme.cardBg,
                    borderColor: theme.border
                  }}
                >
                  <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                    <img
                      src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80"
                      alt="Daksh Studio"
                      className="w-16 h-16 rounded-2xl object-cover border-2 shadow-lg"
                      style={{
                        borderColor: theme.accent,
                        boxShadow: `0 0 15px ${theme.glow}`
                      }}
                    />
                    <div>
                      <h3 className="font-bold text-base" style={{ color: theme.textPrimary }}>Behind SoundForge Music</h3>
                      <p className="text-xs max-w-xl mt-1 leading-relaxed" style={{ color: theme.textSecondary }}>
                        Every song here is independently written, recorded, and produced by Daksh. From rough 2 AM voice memos on guitar to finished studio mixes, this platform offers an unvarnished window into the creative journey.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {!user && (
                      <button
                        onClick={() => handleOpenAuth('viewer')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-semibold shadow-lg transition-all"
                        style={{
                          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
                          boxShadow: `0 0 15px -3px ${theme.glow}`
                        }}
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        Join as Listener
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}

          </main>

          {/* Persistent Bottom Audio Player */}
          <AudioPlayer onOpenAuth={handleOpenAuth} />

          {/* Upload Song & Voice Memo Modal (STRICTLY ONLY FOR ARTIST) */}
          {isRealArtist && (
            <UploadModal
              isOpen={isUploadOpen}
              onClose={() => {
                setIsUploadOpen(false);
                setEditingSong(null);
              }}
              onSongUploaded={handleSongUploaded}
              editSong={editingSong}
            />
          )}

          {/* Dual Portal Authentication Modal */}
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            initialPortal={authInitialPortal}
            onSuccess={(role) => {
              if (role === 'artist') setCurrentView('studio');
            }}
          />

          {/* Lyrics & Behind-the-song Drawer */}
          <LyricsModal />

          {/* Listener Timestamped Comments Drawer */}
          <CommentsDrawer onOpenAuth={handleOpenAuth} />

        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PlayerProvider>
          <MainApp />
        </PlayerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
