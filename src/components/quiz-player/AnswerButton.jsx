import React from 'react';
import { motion } from 'framer-motion';

const KAHOOT_COLORS = [
  { bg: '#E21B3C', hover: '#c41836', symbol: '▲' },
  { bg: '#1368CE', hover: '#0f55a8', symbol: '◆' },
  { bg: '#FFA602', hover: '#e6950a', symbol: '●' },
  { bg: '#26890C', hover: '#1d6b09', symbol: '■' },
];

export default function AnswerButton({ answer, index, onSelect }) {
  const color = KAHOOT_COLORS[index % KAHOOT_COLORS.length];

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onSelect(answer)}
      className="relative w-full rounded-2xl text-white font-bold text-lg md:text-xl overflow-hidden shadow-lg"
      style={{ backgroundColor: color.bg, minHeight: '80px' }}
    >
      {answer.image_url && (
        <div className="w-full h-28 overflow-hidden">
          <img src={answer.image_url} alt={answer.text} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex items-center gap-4 px-5 py-4">
        <span className="flex-shrink-0 text-2xl opacity-90">{color.symbol}</span>
        <span className="leading-snug text-left drop-shadow">{answer.text}</span>
      </div>
    </motion.button>
  );
}