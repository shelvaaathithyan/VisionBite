import React from 'react';
import { motion } from 'framer-motion';
import SoftAurora from '@/components/SoftAurora';

interface DashboardLayoutProps {
  header: React.ReactNode;
  kpis: React.ReactNode;
  mainContent: React.ReactNode;
  sidePanel: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  header,
  kpis,
  mainContent,
  sidePanel,
}) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-slate-100">
      {/* Soft Aurora Background */}
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

      {/* Dark Overlay for Better Content Readability */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {header}
        </motion.div>

        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          {kpis}
        </motion.div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <motion.section
            className="xl:col-span-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            {mainContent}
          </motion.section>

          <motion.aside
            className="space-y-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            {sidePanel}
          </motion.aside>
        </div>
      </div>
    </div>
  );
};
