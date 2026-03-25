import React, { useEffect, useState } from 'react';

interface AppLoadingScreenProps {
  onComplete: () => void;
}

interface LoadingStep {
  name: string;
  role: string;
  imageSrc: string;
}

const STEPS: LoadingStep[] = [
  { name: 'Logini', role: 'Backend Developer', imageSrc: '/assets/loading/logini.jpg' },
  { name: 'Sarvesaa', role: 'Backend Developer', imageSrc: '/assets/loading/sarvesaa.jpg' },
  { name: 'Shelva', role: 'Frontend Developer', imageSrc: '/assets/loading/shelva.jpg' },
  { name: 'Pranika', role: 'Data Science Expert', imageSrc: '/assets/loading/pranika.jpg' },
  { name: 'Mathan', role: 'Content and Documentation Expert', imageSrc: '/assets/loading/mathan.jpg' },
];

const FLIP_DIRECTIONS = [
  'flip-rtl',
  'flip-ltr',
  'flip-ttb',
  'flip-btt',
  'flip-rtl',
] as const;

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

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
    }, 80);

    return () => window.clearInterval(timer);
  }, [onComplete]);

  const activeStepIndex = Math.min(STEPS.length - 1, Math.floor(progress / 20));
  const activeStep = STEPS[activeStepIndex];
  const activeFlipClass = FLIP_DIRECTIONS[activeStepIndex] || 'flip-rtl';

  const fallbackInitials = activeStep.name.slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black px-4">
      <div className="absolute inset-0 app-loader-grid" aria-hidden="true" />

      <div className="app-loading-card relative z-10 w-full max-w-lg rounded-3xl bg-zinc-950/30 p-6 shadow-[0_16px_42px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-base uppercase tracking-[0.35em] text-zinc-300">VisionBite Boot</p>
          <div className="sandglass" aria-hidden="true">
            <span className="sandglass-top" />
            <span className="sandglass-bottom" />
            <span className="sandglass-flow" />
          </div>
        </div>

        <div className={`flip-stage-card ${activeFlipClass}`} key={activeStep.name}>
          <div className="flex items-center gap-4 rounded-2xl border border-zinc-500/40 bg-black/35 p-3">
            <div className="h-20 w-20 overflow-hidden rounded-xl border border-zinc-500/60 bg-zinc-900">
              {imageErrorMap[activeStep.name] ? (
                <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-zinc-200">
                  {fallbackInitials}
                </div>
              ) : (
                <img
                  src={activeStep.imageSrc}
                  alt={activeStep.name}
                  className={`h-full w-full object-cover ${
                    activeStep.name === 'Logini'
                      ? 'object-[center_42%]'
                      : activeStep.name === 'Sarvesaa'
                        ? 'object-center scale-125'
                        : 'object-center'
                  }`}
                  onError={() =>
                    setImageErrorMap((prev) => ({
                      ...prev,
                      [activeStep.name]: true,
                    }))
                  }
                />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Current Stage</p>
              <p className="text-4xl tracking-wide text-zinc-100">{activeStep.name}</p>
              <p className="text-lg tracking-wide text-zinc-300">{activeStep.role}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm uppercase tracking-[0.24em] text-zinc-300">
            <span>Loading</span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-200 transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
