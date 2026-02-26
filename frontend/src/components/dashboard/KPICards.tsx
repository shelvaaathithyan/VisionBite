import React from 'react';
import { motion } from 'framer-motion';

export interface KPIItem {
  id: string;
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
}

interface KPICardsProps {
  items: KPIItem[];
}

export const KPICards: React.FC<KPICardsProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item, index) => (
        <motion.article
          key={item.id}
          className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl shadow-slate-950/35 backdrop-blur-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 + index * 0.05 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-300">{item.label}</p>
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-blue-200">{item.icon}</div>
          </div>
          <p className="text-3xl font-bold tracking-tight text-white">{item.value}</p>
          {item.subtitle && <p className="mt-1 text-xs text-slate-400">{item.subtitle}</p>}
        </motion.article>
      ))}
    </div>
  );
};
