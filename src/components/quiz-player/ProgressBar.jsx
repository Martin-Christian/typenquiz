import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressBar({ current, total }) {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-white/80 uppercase tracking-wider">
          Frage {current} / {total}
        </span>
        <span className="text-sm font-extrabold text-white">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-3 bg-white/20 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full bg-white"
        />
      </div>
    </div>
  );
}