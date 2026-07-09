import React from 'react';
import { motion } from 'framer-motion';

const ANSWER_COLORS = [
  { bg: '#1AB3FF', hover: '#1599D9', symbol: '◆', text: '#ffffff' },
  { bg: '#99E600', hover: '#80C200', symbol: '●', text: '#1a1a1a' },
  { bg: '#40AADC', hover: '#338BB0', symbol: '■', text: '#ffffff' },
  { bg: '#CCF280', hover: '#AACC66', symbol: '★', text: '#1a1a1a' },
];

export default function AnswerButton({ answer, index, onSelect }) {
  const color = ANSWER_COLORS[index % ANSWER_COLORS.length];

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onSelect(answer)}
      className="relative w-full rounded-2xl font-bold text-lg md:text-xl overflow-hidden shadow-lg"
      style={{ backgroundColor: color.bg, color: color.text, minHeight: '80px' }}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        <span className="flex-shrink-0 text-2xl opacity-80">{color.symbol}</span>
        <span className="leading-snug text-left">{answer.text}</span>
      </div>
    </motion.button>
  );
}