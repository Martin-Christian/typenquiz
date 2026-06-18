import React from 'react';
import { motion } from 'framer-motion';

const KAHOOT_COLORS = [
  { bg: '#A855F7', hover: '#9333ea', symbol: '◆' },
  { bg: '#1368CE', hover: '#0f55a8', symbol: '●' },
  { bg: '#D97706', hover: '#b86005', symbol: '■' },
  { bg: '#0E7490', hover: '#0a5f75', symbol: '★' },
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
      <div className="flex items-center gap-4 px-5 py-4">
        <span className="flex-shrink-0 text-2xl opacity-90">{color.symbol}</span>
        <span className="leading-snug text-left drop-shadow">{answer.text}</span>
      </div>
    </motion.button>
  );
}