import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  X,
  Upload,
  Mic,
  Music,
  Image,
  Sparkles,
  FileAudio,
  CheckCircle2,
  AlertCircle,
  Radio,
  Play,
  Square,
  Flame
} from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onSongUploaded, editSong = null }) {
  const { token } = useAuth();
  const { theme } = useTheme();

  // Form states
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Indie / Acoustic');
  const [mood, setMood] = useState('Emotional & Introspective');
  const [lyrics, setLyrics] = useState('');
  const [story, setStory] = useState('');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [duration, setDuration] = useState('3:00');

  // File states
  const [audioFile, setAudioFile] = useState(null);
  const [audioFileName, setAudioFileName] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [selectedPresetCover, setSelectedPresetCover] = useState('');

  // Recording from browser mic state
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Submission states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const presetCovers = [
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80'
  ];

  useEffect(() => {
    if (editSong) {
      setTitle(editSong.title || '');
      setGenre(editSong.genre || 'Indie / Acoustic');
      setMood(editSong.mood || 'Emotional');
      setLyrics(editSong.lyrics || '');
      setStory(editSong.story || '');
      setIsVoiceRecording(Boolean(editSong.isVoiceRecording));
      setCoverPreview(editSong.coverUrl || '');
    } else {
      resetForm();
    }
  }, [editSong, isOpen]);

  const resetForm = () => {
    setTitle('');
    setGenre('Indie / Acoustic');
    setMood('Emotional & Introspective');
    setLyrics('');
    setStory('');
    setIsVoiceRecording(false);
    setDuration('3:00');
    setAudioFile(null);
    setAudioFileName('');
    setCoverFile(null);
    setCoverPreview('');
    setSelectedPresetCover(presetCovers[0]);
    setError('');
    setSuccess('');
    stopMicRecording();
  };

  const handleAudioSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAudioFile(file);
    setAudioFileName(file.name);

    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName);
    }

    if (/memo|voice|rec|audio_rec|note/i.test(file.name)) {
      setIsVoiceRecording(true);
    }

    const objectUrl = URL.createObjectURL(file);
    const tempAudio = new Audio(objectUrl);
    tempAudio.onloadedmetadata = () => {
      const sec = Math.floor(tempAudio.duration);
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      setDuration(`${m}:${s < 10 ? '0' : ''}${s}`);
      URL.revokeObjectURL(objectUrl);
    };
  };

  const handleCoverSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCoverFile(file);
    setSelectedPresetCover('');
    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
  };

  const startMicRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const now = new Date();
        const generatedName = `Voice_Memo_${now.getMonth()+1}_${now.getDate()}_${now.getHours()}${now.getMinutes()}.webm`;
        const recordedFile = new File([audioBlob], generatedName, { type: 'audio/webm' });
        
        setAudioFile(recordedFile);
        setAudioFileName(generatedName);
        setIsVoiceRecording(true);
        if (!title) setTitle(`Voice Memo (${now.toLocaleDateString()})`);

        const m = Math.floor(recordingSeconds / 60);
        const s = recordingSeconds % 60;
        setDuration(`${m}:${s < 10 ? '0' : ''}${s}`);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingMic(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Mic access error:', err);
      setError('Could not access microphone. Please check your browser microphone permissions.');
    }
  };

  const stopMicRecording = () => {
    if (mediaRecorderRef.current && isRecordingMic) {
      mediaRecorderRef.current.stop();
      setIsRecordingMic(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editSong && !audioFile) {
      setError('Please select a saved voice recording or audio file, or record a new voice memo.');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a song title.');
      return;
    }

    setLoading(true);

    try {
      if (editSong) {
        const res = await fetch(`/api/songs/${editSong.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title,
            genre,
            mood,
            lyrics,
            story,
            isVoiceRecording
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update song');

        setSuccess('Song details updated!');
        setTimeout(() => {
          onSongUploaded(data.song, true);
          onClose();
        }, 800);
      } else {
        const formData = new FormData();
        formData.append('audio', audioFile);
        if (coverFile) {
          formData.append('cover', coverFile);
        }
        formData.append('title', title);
        formData.append('genre', genre);
        formData.append('mood', mood);
        formData.append('lyrics', lyrics);
        formData.append('story', story);
        formData.append('duration', duration);
        formData.append('isVoiceRecording', isVoiceRecording.toString());

        const res = await fetch('/api/songs', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');

        setSuccess('Song uploaded successfully to your catalog!');
        setTimeout(() => {
          onSongUploaded(data.song, false);
          onClose();
        }, 900);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong while uploading');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl border rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 my-8 glass-card backdrop-blur-2xl"
        style={{
          background: theme.cardBg,
          borderColor: theme.border
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl border flex items-center justify-center"
              style={{
                background: `rgba(${theme.accentRgb}, 0.15)`,
                borderColor: `rgba(${theme.accentRgb}, 0.35)`,
                color: theme.accent
              }}
            >
              {isVoiceRecording ? <Mic className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {editSong ? 'Edit Song Details' : 'Upload Song or Voice Recording'}
              </h2>
              <p className="text-xs text-slate-400">
                {editSong ? 'Modify track metadata, lyrics and story' : 'Add saved voice memos or mastered audio to your artist discography'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-600/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          
          {/* STEP 1: Audio File Upload or Live Mic Recording */}
          {!editSong && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                1. Voice Recording / Audio Track <span style={{ color: theme.accent }}>*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Method A: Choose Saved Voice Memo */}
                <div
                  onClick={() => audioInputRef.current?.click()}
                  className="border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all backdrop-blur-md"
                  style={{
                    background: audioFile ? `rgba(${theme.accentRgb}, 0.12)` : 'rgba(5, 5, 8, 0.45)',
                    borderColor: audioFile ? theme.accent : 'rgba(255, 255, 255, 0.12)'
                  }}
                >
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm,.flac"
                    onChange={handleAudioSelect}
                    className="hidden"
                  />
                  <FileAudio className="w-8 h-8 mx-auto mb-2" style={{ color: audioFile ? theme.accent : '#94a3b8' }} />
                  <p className="text-xs font-semibold text-white truncate px-2">
                    {audioFileName || 'Upload Saved Voice Note / Audio'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Supports MP3, WAV, M4A, OGG, WebM
                  </p>
                </div>

                {/* Method B: Live Mic Recording */}
                <div
                  className="border rounded-2xl p-4 flex flex-col items-center justify-center text-center backdrop-blur-md"
                  style={{
                    background: 'rgba(5, 5, 8, 0.45)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {isRecordingMic ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 animate-pulse text-xs font-bold" style={{ color: theme.accentLight }}>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.accent }} />
                        Recording Voice Memo... ({recordingSeconds}s)
                      </div>
                      <button
                        type="button"
                        onClick={stopMicRecording}
                        className="flex items-center gap-1.5 px-4 py-1.5 text-white rounded-xl text-xs font-semibold shadow-lg mx-auto"
                        style={{ backgroundColor: theme.accent }}
                      >
                        <Square className="w-3.5 h-3.5 fill-current" /> Stop & Use Recording
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Mic className="w-7 h-7 mx-auto" style={{ color: theme.accent }} />
                      <p className="text-xs font-semibold text-white">Record Live Voice Memo</p>
                      <button
                        type="button"
                        onClick={startMicRecording}
                        className="flex items-center gap-1.5 px-3 py-1 text-white rounded-xl text-xs font-bold shadow-md mx-auto"
                        style={{ backgroundColor: theme.accent }}
                      >
                        <Radio className="w-3.5 h-3.5" /> Start Mic Recording
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* Tag as voice memo badge toggle */}
              <div
                className="mt-2.5 flex items-center justify-between px-3.5 py-2 rounded-xl border backdrop-blur-md"
                style={{
                  background: 'rgba(5, 5, 8, 0.45)',
                  borderColor: 'rgba(255, 255, 255, 0.08)'
                }}
              >
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <Mic className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                  Tag as "Voice Memo Recording" badge for listeners
                </span>
                <input
                  type="checkbox"
                  checked={isVoiceRecording}
                  onChange={(e) => setIsVoiceRecording(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: theme.accent }}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Song Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Song Title <span style={{ color: theme.accent }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Midnight Reverie (Acoustic Demo)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs text-white px-3.5 py-2.5 rounded-xl border focus:outline-none backdrop-blur-md"
                style={{
                  background: 'rgba(8, 8, 12, 0.65)',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Genre / Style
              </label>
              <input
                type="text"
                placeholder="e.g. Acoustic Indie, Lo-Fi, Singer-Songwriter"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full text-xs text-white px-3.5 py-2.5 rounded-xl border focus:outline-none backdrop-blur-md"
                style={{
                  background: 'rgba(8, 8, 12, 0.65)',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mood / Vibe
              </label>
              <input
                type="text"
                placeholder="e.g. Nostalgic, Melodic, Late Night Chill"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full text-xs text-white px-3.5 py-2.5 rounded-xl border focus:outline-none backdrop-blur-md"
                style={{
                  background: 'rgba(8, 8, 12, 0.65)',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Track Duration
              </label>
              <input
                type="text"
                placeholder="e.g. 3:45"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full text-xs text-white px-3.5 py-2.5 rounded-xl border focus:outline-none font-mono backdrop-blur-md"
                style={{
                  background: 'rgba(8, 8, 12, 0.65)',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              />
            </div>
          </div>

          {/* STEP 3: Behind The Song & Lyrics */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              The Story Behind The Song
            </label>
            <textarea
              rows={2}
              placeholder="What inspired you to write or record this? (Share your creative process with your viewers)"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="w-full text-xs text-white px-3.5 py-2.5 rounded-xl border focus:outline-none backdrop-blur-md"
              style={{
                background: 'rgba(8, 8, 12, 0.65)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Lyrics (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Paste your lyrics here (Verses, Chorus, Bridge)..."
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              className="w-full text-xs text-white px-3.5 py-2.5 rounded-xl border focus:outline-none font-mono text-[11px] backdrop-blur-md"
              style={{
                background: 'rgba(8, 8, 12, 0.65)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
            />
          </div>

          {/* STEP 4: Cover Artwork */}
          {!editSong && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Cover Artwork (Upload Custom or Select Preset)
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-slate-200 border shrink-0 hover:bg-white/10 backdrop-blur-md"
                  style={{
                    background: 'rgba(12, 12, 18, 0.65)',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <Image className="w-4 h-4" style={{ color: theme.accent }} />
                  Upload Image
                </button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverSelect}
                  className="hidden"
                />

                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {presetCovers.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Preset"
                      onClick={() => {
                        setCoverPreview(url);
                        setSelectedPresetCover(url);
                        setCoverFile(null);
                      }}
                      className="w-10 h-10 rounded-lg object-cover cursor-pointer border-2 transition-transform hover:scale-105"
                      style={{
                        borderColor: coverPreview === url ? theme.accent : 'rgba(255, 255, 255, 0.1)'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="pt-4 border-t flex items-center justify-end gap-3" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl text-xs font-semibold shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
                boxShadow: `0 0 20px -3px ${theme.glow}`
              }}
            >
              {loading ? (
                <span>Saving to Catalog...</span>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{editSong ? 'Save Updates' : 'Publish Song to Site'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
