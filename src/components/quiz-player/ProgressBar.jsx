import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressBar({ current, total, color }) {
  const percentage = ((current) / total) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          Frage {current} von {total}
        </span>
        <span className="text-sm font-semibold text-foreground">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color ? `#${color}` : 'hsl(var(--primary))' }}
        />
      </div>
    </div>
  );
}