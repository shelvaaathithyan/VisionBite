import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan } from 'lucide-react';

interface HeaderProps {
  username?: string;
  role: 'admin' | 'staff';
}

export const Header: React.FC<HeaderProps> = ({ username, role }) => {
  const navigate = useNavigate();
  const isAdmin = role === 'admin';

  return (
    <header className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-slate-950/40 backdrop-blur-sm sm:p-6">
      {isAdmin && (
        <>
          <video
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          >
            <source src="/assets/coffee-shop.3840x2160.mp4" type="video/mp4" />
          </video>
          <div className="pointer-events-none absolute inset-0 bg-slate-950/60" />
        </>
      )}

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xl font-medium text-blue-200/90 sm:text-2xl">VisionBite</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl" style={{ fontFamily: "Bungee" }}>Dashboard</h1>
          <p className="mt-2 text-base text-slate-200 sm:text-lg">
            Welcome back, <span className="font-semibold text-slate-100">{username || 'User'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/visionbite')}
            className="flex items-center gap-2 rounded-xl border border-slate-400/40 bg-transparent px-6 py-3 text-lg font-semibold text-slate-100 transition hover:bg-slate-500/10 hover:scale-[1.02] sm:text-xl"
          >
            <Scan size={20} />
            VisionBite AI
          </button>
        </div>
      </div>
    </header>
  );
};
