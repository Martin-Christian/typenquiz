import React from 'react';
import { motion } from 'framer-motion';

export default function AnswerButton({ answer, index, onSelect, accentColor }) {
  const hasImage = !!answer.image_url;
  const color = accentColor ? `#${accentColor}` : 'hsl(var(--primary))';

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(answer)}
      className="group w-full text-left rounded-xl border-2 border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 overflow-hidden"
    >
      {hasImage && (
        <div className="aspect-video overflow-hidden">
          <img
            src={answer.image_url}
            alt={answer.text}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-4 flex items-center gap-3">
        <span
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {String.fromCharCode(65 + index)}
        </span>
        <span className="text-base font-medium text-foreground leading-snug">{answer.text}</span>
      </div>
    </motion.button>
  );
}