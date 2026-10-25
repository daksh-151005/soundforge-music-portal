const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireArtist, requireAuth, authenticateOptional } = require('../middleware/auth');

const isVercel = Boolean(process.env.VERCEL);
const UPLOADS_DIR = isVercel ? path.join('/tmp', 'uploads') : path.join(__dirname, '..', 'uploads');
const AUDIO_DIR = path.join(UPLOADS_DIR, 'audio');
const COVERS_DIR = path.join(UPLOADS_DIR, 'covers');

[UPLOADS_DIR, AUDIO_DIR, COVERS_DIR].forEach(dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.warn('Could not create directory:', err.message);
  }
});

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      cb(null, AUDIO_DIR);
    } else if (file.fieldname === 'cover') {
      cb(null, COVERS_DIR);
    } else {
      cb(new Error('Invalid field name'));
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || (file.fieldname === 'audio' ? '.webm' : '.jpg');
    const safeName = `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // up to 100MB for lossless WAV audio
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      const allowedAudio = /\.(mp3|wav|m4a|aac|ogg|webm|flac)$/i;
      if (!file.originalname.match(allowedAudio) && !file.mimetype.startsWith('audio/')) {
        return cb(new Error('Only audio files (MP3, WAV, M4A, OGG, WebM voice memos) are allowed'));
      }
    } else if (file.fieldname === 'cover') {
      const allowedImg = /\.(jpg|jpeg|png|webp|gif|svg)$/i;
      if (!file.originalname.match(allowedImg) && !file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files (JPG, PNG, WebP) are allowed for cover art'));
      }
    }
    cb(null, true);
  }
});

// Default gradient presets for songs without cover image
const DEFAULT_COVERS = [
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80'
];

// GET /api/songs
router.get('/', authenticateOptional, (req, res) => {
  try {
    const songs = db.songs.getAll();
    const userId = req.user ? req.user.id : null;
    const userLikes = userId ? new Set(db.likes.getUserLikes(userId)) : new Set();

    const enhanced = songs.map(s => ({
      ...s,
      isLiked: userLikes.has(s.id)
    }));

    res.json({ songs: enhanced });
  } catch (err) {
    console.error('Fetch songs error:', err);
    res.status(500).json({ error: 'Failed to retrieve songs' });
  }
});

// GET /api/songs/:id
router.get('/:id', authenticateOptional, (req, res) => {
  try {
    const song = db.songs.getById(req.params.id);
    if (!song) return res.status(404).json({ error: 'Song not found' });

    const userId = req.user ? req.user.id : null;
    const isLiked = userId ? db.likes.isLiked(userId, song.id) : false;

    res.json({ song: { ...song, isLiked } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch song' });
  }
});

// POST /api/songs - Artist Only Upload Portal
router.post(
  '/',
  requireArtist,
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  (req, res) => {
    try {
      if (!req.files || !req.files.audio || req.files.audio.length === 0) {
        return res.status(400).json({ error: 'Audio file is required (e.g. voice recording or finished track)' });
      }

      const audioFile = req.files.audio[0];
      const coverFile = req.files.cover ? req.files.cover[0] : null;

      const {
        title,
        genre = 'Indie / Singer-Songwriter',
        mood = 'Emotional',
        lyrics = '',
        story = '',
        duration = '0:00',
        isVoiceRecording = 'false',
        waveform
      } = req.body;

      if (!title || !title.trim()) {
        // Fallback title from audio filename
        const defaultTitle = audioFile.originalname.replace(/\.[^/.]+$/, '');
        req.body.title = defaultTitle || 'Untitled Recording';
      }

      const audioUrl = `/uploads/audio/${audioFile.filename}`;
      let coverUrl = '';
      if (coverFile) {
        coverUrl = `/uploads/covers/${coverFile.filename}`;
      } else {
        const randomCover = DEFAULT_COVERS[Math.floor(Math.random() * DEFAULT_COVERS.length)];
        coverUrl = randomCover;
      }

      // Generate simulated waveform data if not provided (80 points for player scrub visualization)
      let parsedWaveform = [];
      if (waveform) {
        try {
          parsedWaveform = JSON.parse(waveform);
        } catch (e) {
          parsedWaveform = [];
        }
      }
      if (!parsedWaveform.length) {
        for (let i = 0; i < 70; i++) {
          parsedWaveform.push(Math.round(20 + Math.random() * 80));
        }
      }

      const newSong = {
        id: uuidv4(),
        title: (req.body.title || title).trim(),
        artistId: req.user.id,
        artistName: req.user.displayName || 'Daksh',
        genre: genre.trim(),
        mood: mood.trim(),
        lyrics: lyrics.trim(),
        story: story.trim(),
        duration: duration || '3:30',
        audioUrl,
        audioFileName: audioFile.filename,
        originalAudioName: audioFile.originalname,
        audioSize: audioFile.size,
        coverUrl,
        coverFileName: coverFile ? coverFile.filename : null,
        isVoiceRecording: isVoiceRecording === 'true' || isVoiceRecording === true,
        waveform: parsedWaveform,
        plays: 0,
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString()
      };

      db.songs.create(newSong);

      return res.status(201).json({
        message: 'Song uploaded successfully!',
        song: newSong
      });
    } catch (err) {
      console.error('Song upload error:', err);
      return res.status(500).json({ error: err.message || 'Failed to upload song' });
    }
  }
);

// PUT /api/songs/:id - Update song details (Artist only)
router.put('/:id', requireArtist, (req, res) => {
  try {
    const song = db.songs.getById(req.params.id);
    if (!song) return res.status(404).json({ error: 'Song not found' });

    const { title, genre, mood, lyrics, story, isVoiceRecording } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (genre !== undefined) updates.genre = genre.trim();
    if (mood !== undefined) updates.mood = mood.trim();
    if (lyrics !== undefined) updates.lyrics = lyrics.trim();
    if (story !== undefined) updates.story = story.trim();
    if (isVoiceRecording !== undefined) updates.isVoiceRecording = Boolean(isVoiceRecording);

    const updated = db.songs.update(req.params.id, updates);
    res.json({ message: 'Song updated successfully', song: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update song' });
  }
});

// DELETE /api/songs/:id - Delete song and files (Artist only)
router.delete('/:id', requireArtist, (req, res) => {
  try {
    const song = db.songs.getById(req.params.id);
    if (!song) return res.status(404).json({ error: 'Song not found' });

    // Delete audio file from disk
    if (song.audioFileName) {
      const audioPath = path.join(AUDIO_DIR, song.audioFileName);
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    }

    // Delete cover file if it's a local upload
    if (song.coverFileName) {
      const coverPath = path.join(COVERS_DIR, song.coverFileName);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }

    db.songs.delete(req.params.id);

    res.json({ message: 'Song deleted successfully', id: req.params.id });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete song' });
  }
});

// POST /api/songs/:id/play - Increment play count
router.post('/:id/play', (req, res) => {
  try {
    const plays = db.songs.incrementPlay(req.params.id);
    res.json({ plays });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record play' });
  }
});

// POST /api/songs/:id/like - Toggle like
router.post('/:id/like', requireAuth, (req, res) => {
  try {
    const result = db.likes.toggle(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// GET /api/songs/:id/comments
router.get('/:id/comments', (req, res) => {
  try {
    const comments = db.comments.getBySongId(req.params.id);
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get comments' });
  }
});

// POST /api/songs/:id/comments
router.post('/:id/comments', requireAuth, (req, res) => {
  try {
    const { text, timestampSec } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text cannot be empty' });
    }

    const newComment = {
      id: uuidv4(),
      songId: req.params.id,
      userId: req.user.id,
      username: req.user.displayName || req.user.username,
      avatarUrl: req.user.avatarUrl,
      role: req.user.role,
      text: text.trim(),
      timestampSec: typeof timestampSec === 'number' ? timestampSec : null,
      createdAt: new Date().toISOString()
    };

    db.comments.create(newComment);
    res.status(201).json({ comment: newComment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// DELETE /api/songs/:id/comments/:commentId
router.delete('/:id/comments/:commentId', requireAuth, (req, res) => {
  try {
    const isArtist = req.user.role === 'artist';
    const deleted = db.comments.delete(req.params.commentId, req.user.id, isArtist);
    if (!deleted) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }
    res.json({ message: 'Comment removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;
