import React, { useEffect, useState } from 'react';

interface AppLoadingScreenProps {
  onComplete: () => void;
}

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const LOADER_DURATION_MS = 4500;
  const PROGRESS_STEPS = 100;
  const STEP_INTERVAL_MS = LOADER_DURATION_MS / PROGRESS_STEPS;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) {
          window.clearInterval(timer);
          window.setTimeout(onComplete, 40);
          return 100;
        }

        return prev + 1;
      });
    }, STEP_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [onComplete, STEP_INTERVAL_MS]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black px-4">
      <div className="absolute inset-0 app-loader-grid" aria-hidden="true" />
      <div className="absolute inset-0 app-loader-scanlines" aria-hidden="true" />

      <div className="app-loading-card relative z-10 w-full max-w-xl rounded-2xl border border-white/20 bg-black/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-md sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-zinc-400">VisionBite</p>
            <h1 className="text-4xl uppercase tracking-[0.08em] text-zinc-100 sm:text-5xl">System Loading</h1>
          </div>
          <span className="rounded-full border border-white/25 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-300">
            Secure
          </span>
        </div>

        <div className="rounded-xl border border-white/15 bg-black/40 p-4">
          <div className="mb-2 flex items-center justify-between text-sm uppercase tracking-[0.2em] text-zinc-300">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-zinc-200 via-white to-zinc-200 transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
            Initializing modules and preparing dashboard
          </p>
        </div>
      </div>
    </div>
  );
};
