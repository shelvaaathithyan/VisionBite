import React from 'react';

interface HeaderProps {
  username?: string;
  role: 'admin' | 'staff';
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ username, role, onLogout }) => {
  const roleStyles =
    role === 'admin'
      ? 'bg-purple-500/20 text-purple-200 border-purple-400/30'
      : 'bg-sky-500/20 text-sky-200 border-sky-400/30';

  return (
    <header className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-slate-950/40 backdrop-blur-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-200/80">VisionBite</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-300">
            Welcome back, <span className="font-semibold text-slate-100">{username || 'User'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${roleStyles}`}>
            {role}
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-xl border border-rose-400/35 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/25 hover:scale-[1.02]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
