import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EnrollCustomer from '../components/face/EnrollCustomer';
import RecognizeCustomer from '../components/face/RecognizeCustomer';
import LiveCafeInsights from '../components/face/LiveCafeInsights';
import { UserPlus, Scan, ArrowLeft, Radar } from 'lucide-react';
import SoftAurora from '../components/SoftAurora';
import snowfallForestVideo from '../Ass/snowfall-in-forest.3840x2160.mp4';

const VisionBitePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recognize' | 'enroll' | 'live-insights'>('recognize');
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-black text-slate-100"
      style={{ fontFamily: 'BebasNeue, sans-serif' }}
    >
      <div className="absolute inset-0 opacity-100">
        <SoftAurora
          speed={0.5}
          scale={1.5}
          brightness={0.8}
          color1="#ffffff"
          color2="#000000"
          noiseFrequency={2.5}
          noiseAmplitude={1.0}
          bandHeight={0.5}
          bandSpread={1.0}
          octaveDecay={0.1}
          layerOffset={0.3}
          colorSpeed={0.8}
          enableMouseInteraction={false}
          mouseInfluence={0.25}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-black/40" />

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full">
        <header className="relative mb-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-slate-950/40 backdrop-blur-sm sm:p-6">
          <video
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          >
            <source src={snowfallForestVideo} type="video/mp4" />
          </video>
          <div className="pointer-events-none absolute inset-0 bg-slate-950/60" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mt-1 text-4xl font-bold text-white sm:text-5xl" style={{ fontFamily: 'Bungee, sans-serif' }}>
                VisionBite AI
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 rounded-xl border border-slate-400/40 bg-transparent px-4 py-2 text-lg text-slate-200 transition hover:bg-slate-500/10"
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-slate-600/40">
          <button
            onClick={() => setActiveTab('recognize')}
            className={`flex items-center gap-2 rounded-t-xl px-6 py-3 text-xl font-semibold transition ${
              activeTab === 'recognize'
                ? 'border-b-2 border-blue-400 text-blue-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scan size={20} />
            Recognize Customer
          </button>
          <button
            onClick={() => setActiveTab('enroll')}
            className={`flex items-center gap-2 rounded-t-xl px-6 py-3 text-xl font-semibold transition ${
              activeTab === 'enroll'
                ? 'border-b-2 border-blue-400 text-blue-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus size={20} />
            Enroll New Customer
          </button>
          <button
            onClick={() => setActiveTab('live-insights')}
            className={`flex items-center gap-2 rounded-t-xl px-6 py-3 text-xl font-semibold transition ${
              activeTab === 'live-insights'
                ? 'border-b-2 border-blue-400 text-blue-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radar size={20} />
            Live Cafe Insights
          </button>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'recognize' ? <RecognizeCustomer /> : null}
          {activeTab === 'enroll' ? <EnrollCustomer /> : null}
          {activeTab === 'live-insights' ? <LiveCafeInsights /> : null}
        </div>
        </div>
      </div>
    </div>
  );
};

export default VisionBitePage;
