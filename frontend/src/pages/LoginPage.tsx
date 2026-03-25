import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as THREE from 'three';
import NET from 'vanta/dist/vanta.net.min';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffectRef = useRef<{ destroy: () => void } | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (vantaRef.current) {
      const netOptions: any = {
        el: vantaRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1,
        scaleMobile: 1,
        color: 0xb8b8b8,
        backgroundColor: 0x000000,
        points: 9,
        maxDistance: 22,
        spacing: 17,
      };

      vantaEffectRef.current = NET(netOptions);
    }

    return () => {
      if (vantaEffectRef.current) {
        vantaEffectRef.current.destroy();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setPendingApproval(false);

    try {
      await login(email, password);
      const savedUser = localStorage.getItem('user');
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      if (parsedUser?.role === 'user') {
        navigate('/menu');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (err.message?.includes('pending admin approval')) {
        setError(err.message);
        setPendingApproval(true);
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      ref={vantaRef} 
      className="min-h-screen flex items-center justify-center p-4 relative bg-black"
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/55"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="login-metallic-card rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl tracking-wide text-gray-100 mb-1">VisionBite</h1>
            <p className="text-gray-400 tracking-wide">Authentication System</p>
          </div>

          <h2 className="text-4xl tracking-wide text-gray-100 mb-6 text-center">Welcome Back</h2>

          {error && (
            <div
              className={`mb-4 p-4 rounded-xl border ${
                pendingApproval
                  ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                  : 'bg-red-50 border-red-300 text-red-800'
              }`}
            >
              <p className="text-sm font-medium">{error}</p>
              {pendingApproval && (
                <p className="text-sm mt-2">
                  An administrator will review your registration soon.
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-gray-300 tracking-wide mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-500/60 rounded-lg bg-gradient-to-b from-zinc-500/40 to-zinc-800/70 text-white placeholder:text-gray-300 focus:outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-400/40 transition"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-300 tracking-wide mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-500/60 rounded-lg bg-gradient-to-b from-zinc-500/40 to-zinc-800/70 text-white placeholder:text-gray-300 focus:outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-400/40 transition"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-zinc-300 via-gray-400 to-zinc-200 text-black text-2xl tracking-wide py-3 px-4 rounded-lg hover:from-zinc-100 hover:via-gray-200 hover:to-zinc-100 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-900/40 transform hover:scale-[1.02] mt-6"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700/80">
            <p className="text-center text-gray-300 tracking-wide">
              Don't have an account?{' '}
              <Link to="/register" className="text-gray-100 hover:text-white transition">
                Register here (User/Staff)
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
