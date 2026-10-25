const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const { router: authRouter } = require('./routes/auth');
const songsRouter = require('./routes/songs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads directory
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/songs', songsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Music Artist Platform API is running',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend in production if built
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
}

// Function to generate sample WAV audio files for demo tracks if not already present
function ensureSampleTracks() {
  const audioDir = path.join(__dirname, 'uploads', 'audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  // Check if songs exist in db
  const currentDb = db.get();
  if (currentDb.songs.length === 0) {
    console.log('Generating seed songs with synthesized musical chords...');

    // Helper to generate a clean, harmonic synthesizer WAV file
    function createWavBuffer(sampleRate = 22050, durationSec = 15, chordProgression = [261.63, 329.63, 392.00, 523.25]) {
      const numSamples = Math.floor(sampleRate * durationSec);
      const blockAlign = 2; // 1 channel * 16-bit
      const byteRate = sampleRate * blockAlign;
      const dataSize = numSamples * 2;
      const buffer = Buffer.alloc(44 + dataSize);

      // RIFF header
      buffer.write('RIFF', 0);
      buffer.writeUInt32LE(36 + dataSize, 4);
      buffer.write('WAVE', 8);
      buffer.write('fmt ', 12);
      buffer.writeUInt32LE(16, 16); // SubChunk1Size (16 for PCM)
      buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
      buffer.writeUInt16LE(1, 22); // NumChannels (1 mono)
      buffer.writeUInt32LE(sampleRate, 24); // SampleRate
      buffer.writeUInt32LE(byteRate, 28); // ByteRate
      buffer.writeUInt16LE(blockAlign, 32); // BlockAlign
      buffer.writeUInt16LE(16, 34); // BitsPerSample
      buffer.write('data', 36);
      buffer.writeUInt32LE(dataSize, 40);

      // Generate a warm lo-fi acoustic chord progression with mellow overtones & vinyl warmth
      let offset = 44;
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const chordIndex = Math.floor((t / (durationSec / 4))) % chordProgression.length;
        const baseFreq = chordProgression[chordIndex];
        
        // Envelope: soft attack & gentle decay for each chord change
        const chordTime = t % (durationSec / 4);
        const envelope = Math.sin(Math.min(1, chordTime / 0.2) * (Math.PI / 2)) * Math.exp(-chordTime * 0.4);

        // Warm harmonic blend (fundamental + gentle 2nd harmonic + sub bass)
        const fundamental = Math.sin(2 * Math.PI * baseFreq * t);
        const octave = 0.5 * Math.sin(2 * Math.PI * (baseFreq * 2) * t);
        const fifth = 0.3 * Math.sin(2 * Math.PI * (baseFreq * 1.5) * t);
        const sub = 0.2 * Math.sin(2 * Math.PI * (baseFreq / 2) * t);
        
        // Soft lofi tremolo
        const lfo = 1 + 0.08 * Math.sin(2 * Math.PI * 4 * t);

        const sampleVal = (fundamental + octave + fifth + sub) * envelope * lfo * 0.45;
        const clamped = Math.max(-1, Math.min(1, sampleVal));
        const int16 = Math.floor(clamped * 32767);
        buffer.writeInt16LE(int16, offset);
        offset += 2;
      }
      return buffer;
    }

    const demo1File = 'midnight-reverie-demo.wav';
    const demo1Path = path.join(audioDir, demo1File);
    if (!fs.existsSync(demo1Path)) {
      const buf1 = createWavBuffer(22050, 16, [220.0, 261.63, 329.63, 392.0]); // A minor progression
      fs.writeFileSync(demo1Path, buf1);
    }

    const demo2File = 'starlight-echoes-memo.wav';
    const demo2Path = path.join(audioDir, demo2File);
    if (!fs.existsSync(demo2Path)) {
      const buf2 = createWavBuffer(22050, 14, [261.63, 329.63, 392.0, 349.23]); // C major / F progression
      fs.writeFileSync(demo2Path, buf2);
    }

    // Seed 2 tracks into DB
    const song1 = {
      id: 'demo-track-1',
      title: 'Midnight Reverie (Studio Acoustic)',
      artistId: 'artist-admin-1',
      artistName: 'Daksh (Artist & Producer)',
      genre: 'Acoustic / Lo-Fi Indie',
      mood: 'Introspective & Dreamy',
      lyrics: `[Verse 1]
Late night lights fade on the asphalt line
Chasing the shadows that we left behind
Guitar strings hum in the quiet room
Waiting for morning to break the gloom

[Chorus]
Take me back to where the river runs deep
Whispering secrets that we used to keep
Midnight reverie, holding your hand
Drifting away to an unspoken land...`,
      story: 'Written at 2:00 AM on a rainy Tuesday with just a vintage nylon guitar and an old condenser mic. Layered with ambient reverb in the studio to capture that late-night stillness.',
      duration: '0:16',
      audioUrl: `/uploads/audio/${demo1File}`,
      audioFileName: demo1File,
      originalAudioName: 'midnight-reverie-master.wav',
      audioSize: 705644,
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      coverFileName: null,
      isVoiceRecording: false,
      waveform: [35, 45, 60, 75, 90, 85, 70, 65, 80, 95, 88, 60, 50, 65, 85, 90, 78, 60, 45, 70, 80, 92, 85, 68, 55, 75, 88, 95, 82, 60, 40, 50, 70, 85, 90, 75, 60, 70, 85, 90, 65, 50, 40, 30],
      plays: 142,
      likesCount: 28,
      commentsCount: 2,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    };

    const song2 = {
      id: 'demo-track-2',
      title: 'Starlight Echoes (Voice Memo Demo)',
      artistId: 'artist-admin-1',
      artistName: 'Daksh (Artist & Producer)',
      genre: 'Raw Voice Memo / Acoustic',
      mood: 'Vulnerable & Warm',
      lyrics: `[Spoken voice note: "Hey, recorded this idea while walking under the stars... check this hook out"]

[Acoustic Chorus]
When the streetlights flicker out
And silence clears all of the doubt
You are the rhythm in my chest
The only melody that lets me rest...`,
      story: 'Recorded directly as a voice memo on my phone when melody struck out of nowhere on an evening walk. Kept raw and unmastered to preserve the pure emotion of that moment.',
      duration: '0:14',
      audioUrl: `/uploads/audio/${demo2File}`,
      audioFileName: demo2File,
      originalAudioName: 'voice-memo-starlight.wav',
      audioSize: 617444,
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
      coverFileName: null,
      isVoiceRecording: true, // Highlights Voice Recording badge!
      waveform: [20, 30, 45, 65, 80, 70, 50, 60, 75, 85, 95, 70, 55, 60, 80, 75, 65, 50, 40, 60, 75, 85, 90, 65, 45, 55, 70, 85, 60, 45, 30, 40, 55, 70, 65, 50, 35, 25],
      plays: 89,
      likesCount: 19,
      commentsCount: 1,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    };

    currentDb.songs.push(song1, song2);

    // Seed sample comments
    currentDb.comments.push(
      {
        id: 'comm-1',
        songId: 'demo-track-1',
        userId: 'viewer-demo-1',
        username: 'Acoustic Fan',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        role: 'viewer',
        text: 'The chord progression here gives me chills every single time. That transition at 0:08 is magic!',
        timestampSec: 8,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'comm-2',
        songId: 'demo-track-1',
        userId: 'artist-admin-1',
        username: 'Daksh (Artist & Producer)',
        avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
        role: 'artist',
        text: 'Thank you! Spent hours tweaking the acoustic reverb to get that dreamy warmth.',
        timestampSec: 10,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'comm-3',
        songId: 'demo-track-2',
        userId: 'viewer-demo-1',
        username: 'Acoustic Fan',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        role: 'viewer',
        text: 'I love hearing raw voice memos! It feels like being right there in the creative process.',
        timestampSec: 4,
        createdAt: new Date().toISOString()
      }
    );

    db.save(currentDb);
    console.log('Sample songs & comments seeded successfully!');
  }
}

// Start server
async function start() {
  await db.init();
  ensureSampleTracks();

  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🎵 Music Artist & Viewer Portal is LIVE!`);
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`👨‍🎤 Artist Portal: Username "artist", Password "musicmaker123"`);
    console.log(`🎧 Viewer Portal: Username "listener", Password "listener123"`);
    console.log(`===============================================`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
});
