import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const { token } = useAuth();
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  // Drawers and Modals
  const [showLyrics, setShowLyrics] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Audio & Web Audio elements
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);

  // Initialize Audio element
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (isLooping) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        handleNextSong();
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [isLooping]);

  // Connect Web Audio API Analyser Node on user interaction
  const initVisualizerNode = () => {
    if (!audioRef.current || analyserRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch (err) {
      // Audio element may already be connected or blocked by browser policy until gesture
      console.warn('Web Audio node init info:', err.message);
    }
  };

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Play a specific song
  const playSong = async (song, playlist = null) => {
    if (!song) return;

    if (playlist && Array.isArray(playlist)) {
      setQueue(playlist);
      const idx = playlist.findIndex(s => s.id === song.id);
      setCurrentIndex(idx !== -1 ? idx : 0);
    }

    setCurrentSong(song);
    initVisualizerNode();

    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (audioRef.current) {
      audioRef.current.src = song.audioUrl;
      try {
        await audioRef.current.play();
        setIsPlaying(true);

        // Record play count on backend
        fetch(`/api/songs/${song.id}/play`, { method: 'POST' }).catch(() => {});
      } catch (err) {
        console.error('Playback error:', err);
        setIsPlaying(false);
      }
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current || !currentSong) return;

    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  };

  // Seek
  const seek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Next song
  const handleNextSong = () => {
    if (!queue.length) return;
    let nextIdx = currentIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      nextIdx = 0;
    }
    setCurrentIndex(nextIdx);
    playSong(queue[nextIdx], queue);
  };

  // Previous song
  const handlePrevSong = () => {
    if (!queue.length) return;
    if (currentTime > 3) {
      // Seek back to start if already played more than 3 seconds
      seek(0);
      return;
    }
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }
    setCurrentIndex(prevIdx);
    playSong(queue[prevIdx], queue);
  };

  // Toggle like
  const toggleLike = async (songId) => {
    if (!token) return { requireLogin: true };
    try {
      const res = await fetch(`/api/songs/${songId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        // If current song is this song, update its isLiked state
        if (currentSong && currentSong.id === songId) {
          setCurrentSong(prev => ({
            ...prev,
            isLiked: data.isLiked,
            likesCount: data.likesCount
          }));
        }
        return data;
      }
    } catch (err) {
      console.error('Like toggle error', err);
    }
    return null;
  };

  return (
    <PlayerContext.Provider
      value={{
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
        queue,
        currentIndex,
        playSong,
        togglePlay,
        seek,
        nextSong: handleNextSong,
        prevSong: handlePrevSong,
        toggleLike,
        analyserRef,
        showLyrics,
        setShowLyrics,
        showComments,
        setShowComments,
        setCurrentSong
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
