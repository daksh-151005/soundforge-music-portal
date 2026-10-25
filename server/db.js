const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? path.join('/tmp', 'data') : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const BUNDLED_DB_FILE = path.join(__dirname, 'data', 'db.json');

// Ensure directories exist
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('Could not create DATA_DIR:', err.message);
}

const DEFAULT_STATE = {
  users: [],
  songs: [],
  likes: [],
  comments: []
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      if (isVercel && fs.existsSync(BUNDLED_DB_FILE)) {
        try {
          const initialData = fs.readFileSync(BUNDLED_DB_FILE, 'utf-8');
          fs.writeFileSync(DB_FILE, initialData, 'utf-8');
          return JSON.parse(initialData);
        } catch (copyErr) {
          console.warn('Could not copy bundled DB to /tmp:', copyErr.message);
        }
      }
      writeDb(DEFAULT_STATE);
      return DEFAULT_STATE;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading DB, resetting to defaults:', err);
    return DEFAULT_STATE;
  }
}

function writeDb(data) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

// Initialize seed data
async function initDb() {
  const db = readDb();
  let changed = false;

  // 1. Ensure Artist admin exists
  const artistUser = db.users.find(u => u.role === 'artist');
  if (!artistUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('musicmaker123', salt);
    db.users.push({
      id: 'artist-admin-1',
      username: 'artist',
      displayName: 'Daksh (Artist & Producer)',
      email: 'artist@soundstudio.local',
      password: hashedPassword,
      role: 'artist',
      bio: 'Songwriter, producer & multi-instrumentalist creating emotional landscapes and melodic journeys.',
      avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString()
    });
    changed = true;
  }

  // 2. Ensure Viewer demo user exists
  const viewerUser = db.users.find(u => u.username === 'listener');
  if (!viewerUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('listener123', salt);
    db.users.push({
      id: 'viewer-demo-1',
      username: 'listener',
      displayName: 'Acoustic Fan',
      email: 'fan@music.local',
      password: hashedPassword,
      role: 'viewer',
      bio: 'Music enthusiast & avid listener of heartfelt indie melodies.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString()
    });
    changed = true;
  }

  if (changed) {
    writeDb(db);
  }
}

const db = {
  get: readDb,
  save: writeDb,
  init: initDb,

  // User helpers
  users: {
    findById: (id) => {
      const data = readDb();
      return data.users.find(u => u.id === id);
    },
    findByUsername: (username) => {
      const data = readDb();
      return data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    },
    create: (user) => {
      const data = readDb();
      data.users.push(user);
      writeDb(data);
      return user;
    }
  },

  // Songs helpers
  songs: {
    getAll: () => {
      const data = readDb();
      // sort latest first
      return [...data.songs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    getById: (id) => {
      const data = readDb();
      return data.songs.find(s => s.id === id);
    },
    create: (song) => {
      const data = readDb();
      data.songs.unshift(song);
      writeDb(data);
      return song;
    },
    update: (id, updates) => {
      const data = readDb();
      const index = data.songs.findIndex(s => s.id === id);
      if (index === -1) return null;
      data.songs[index] = { ...data.songs[index], ...updates, updatedAt: new Date().toISOString() };
      writeDb(data);
      return data.songs[index];
    },
    delete: (id) => {
      const data = readDb();
      const song = data.songs.find(s => s.id === id);
      if (!song) return null;
      data.songs = data.songs.filter(s => s.id !== id);
      // clean up likes and comments associated
      data.likes = data.likes.filter(l => l.songId !== id);
      data.comments = data.comments.filter(c => c.songId !== id);
      writeDb(data);
      return song;
    },
    incrementPlay: (id) => {
      const data = readDb();
      const song = data.songs.find(s => s.id === id);
      if (song) {
        song.plays = (song.plays || 0) + 1;
        writeDb(data);
        return song.plays;
      }
      return 0;
    }
  },

  // Likes
  likes: {
    isLiked: (userId, songId) => {
      const data = readDb();
      return data.likes.some(l => l.userId === userId && l.songId === songId);
    },
    toggle: (userId, songId) => {
      const data = readDb();
      const index = data.likes.findIndex(l => l.userId === userId && l.songId === songId);
      const song = data.songs.find(s => s.id === songId);
      let isLiked = false;

      if (index > -1) {
        data.likes.splice(index, 1);
        if (song && song.likesCount > 0) song.likesCount -= 1;
        isLiked = false;
      } else {
        data.likes.push({ userId, songId, createdAt: new Date().toISOString() });
        if (song) song.likesCount = (song.likesCount || 0) + 1;
        isLiked = true;
      }
      writeDb(data);
      return { isLiked, likesCount: song ? song.likesCount : 0 };
    },
    getUserLikes: (userId) => {
      const data = readDb();
      return data.likes.filter(l => l.userId === userId).map(l => l.songId);
    }
  },

  // Comments
  comments: {
    getBySongId: (songId) => {
      const data = readDb();
      return data.comments
        .filter(c => c.songId === songId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    },
    create: (comment) => {
      const data = readDb();
      data.comments.push(comment);
      // increment commentsCount on song
      const song = data.songs.find(s => s.id === comment.songId);
      if (song) {
        song.commentsCount = (song.commentsCount || 0) + 1;
      }
      writeDb(data);
      return comment;
    },
    delete: (commentId, userId, isArtist) => {
      const data = readDb();
      const commentIndex = data.comments.findIndex(c => c.id === commentId);
      if (commentIndex === -1) return false;
      const comment = data.comments[commentIndex];
      // Only author or artist can delete
      if (!isArtist && comment.userId !== userId) {
        return false;
      }
      data.comments.splice(commentIndex, 1);
      const song = data.songs.find(s => s.id === comment.songId);
      if (song && song.commentsCount > 0) {
        song.commentsCount -= 1;
      }
      writeDb(data);
      return true;
    }
  }
};

module.exports = db;
