import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  ShieldCheck,
  Headphones,
  KeyRound,
  User,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Flame
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialPortal = 'viewer', onSuccess }) {
  const { login, register } = useAuth();
  const [activePortal, setActivePortal] = useState(initialPortal);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activePortal === 'artist') {
        await login(username.trim(), password, 'artist');
        if (onSuccess) onSuccess('artist');
        onClose();
      } else {
        if (isRegisterMode) {
          await register({ username: username.trim(), password, displayName, email });
        } else {
          await login(username.trim(), password, null);
        }
        if (onSuccess) onSuccess('viewer');
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickViewerLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login('listener', 'listener123', null);
      if (onSuccess) onSuccess('viewer');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-black border border-red-950/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 my-8 glow-subtle-red">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-studio-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Portal Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-studio-950 rounded-2xl border border-red-950/60 mb-6">
          <button
            type="button"
            onClick={() => {
              setActivePortal('artist');
              setError('');
              setIsRegisterMode(false);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activePortal === 'artist'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/70'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Artist Portal
          </button>

          <button
            type="button"
            onClick={() => {
              setActivePortal('viewer');
              setError('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activePortal === 'viewer'
                ? 'bg-gradient-to-r from-red-900 to-rose-900 text-white border border-red-600/40 shadow-lg shadow-red-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Headphones className="w-4 h-4" />
            Viewer Portal
          </button>
        </div>

        {/* Header Description */}
        <div className="text-center mb-6">
          {activePortal === 'artist' ? (
            <div>
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-500 mx-auto flex items-center justify-center mb-3">
                <Flame className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-white">Artist & Producer Login</h2>
              <p className="text-xs text-slate-400 mt-1">
                Access your private studio terminal to upload voice recordings and manage your tracks
              </p>
            </div>
          ) : (
            <div>
              <div className="w-12 h-12 rounded-2xl bg-studio-900 border border-red-900/40 text-red-400 mx-auto flex items-center justify-center mb-3">
                <Headphones className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-white">
                {isRegisterMode ? 'Join as Viewer / Fan' : 'Viewer & Listener Sign In'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isRegisterMode
                  ? 'Create an account to like songs, write timestamped comments, and save favorites'
                  : 'Sign in to access your liked songs and interact with the music'}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-600/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {activePortal === 'viewer' && isRegisterMode && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                placeholder="e.g. Melody Lover"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-studio-900 text-xs text-white px-3.5 py-2.5 rounded-xl border border-red-950 focus:outline-none focus:border-red-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={activePortal === 'artist' ? 'Enter artist username' : 'listener'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-studio-900 text-xs text-white pl-9 pr-3.5 py-2.5 rounded-xl border border-red-950 focus:outline-none focus:border-red-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-studio-900 text-xs text-white pl-9 pr-3.5 py-2.5 rounded-xl border border-red-950 focus:outline-none focus:border-red-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 shadow-red-950/70 glow-red disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>
                  {activePortal === 'artist'
                    ? 'Enter Creator Studio'
                    : isRegisterMode
                    ? 'Create Viewer Account'
                    : 'Sign In as Viewer'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Viewer Mode Toggle */}
        {activePortal === 'viewer' && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(prev => !prev);
                setError('');
              }}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              {isRegisterMode
                ? 'Already have an account? Sign in here'
                : "New listener? Create a free account here"}
            </button>
          </div>
        )}

        {/* Demo Shortcut Box - ONLY SHOWN FOR VIEWER */}
        {activePortal === 'viewer' && (
          <div className="mt-6 pt-5 border-t border-red-950/60">
            <p className="text-[11px] font-semibold text-slate-400 mb-2.5 text-center flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              Quick Testing Shortcut
            </p>

            <button
              type="button"
              onClick={handleQuickViewerLogin}
              disabled={loading}
              className="w-full py-2 px-3 rounded-xl bg-studio-900 hover:bg-studio-850 border border-red-950 text-slate-300 hover:text-red-300 text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5 text-red-500" />
              1-Click Viewer Demo Login (listener / listener123)
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
