import React from 'react';
import { motion } from 'framer-motion';
import Prism from '@/components/Prism';

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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <Prism
          animationType="3drotate"
          transparent
          glow={1.1}
          noise={0.2}
          scale={4}
          hueShift={-0.15}
          colorFrequency={1.05}
          bloom={1.05}
          timeScale={0.45}
          suspendWhenOffscreen
        />
      </div>

      <div className="absolute inset-0 bg-slate-950/40" />

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
