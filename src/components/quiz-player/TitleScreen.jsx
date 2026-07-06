import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export default function TitleScreen({ quiz, onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex flex-col items-center justify-center min-h-[480px] rounded-3xl overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #005f8a 0%, #007fb1 50%, #4da3c4 100%)' }}
    >

      {/* Decorative blobs */}
      <div className="absolute top-4 left-4 w-24 h-24 rounded-full bg-white/5 blur-xl" />
      <div className="absolute bottom-8 right-8 w-36 h-36 rounded-full bg-white/5 blur-2xl" />

      <div className="relative z-10 text-center px-8 py-12 max-w-2xl w-full">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-block bg-white/15 backdrop-blur-sm rounded-full px-4 py-1 text-white/80 text-sm font-semibold tracking-widest uppercase mb-5"
        >
          Persönlichkeits-Quiz
        </motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="font-heading text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg"
        >
          {quiz.title}
        </motion.h1>

        {quiz.description && (
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-lg mb-10 leading-relaxed text-white/75"
          >
            {quiz.description}
          </motion.p>
        )}

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.96 }}
          onClick={onStart}
          className="inline-flex items-center gap-3 px-12 py-4 rounded-full bg-white text-[#007fb1] font-extrabold text-xl shadow-2xl hover:shadow-white/30 transition-shadow"
        >
          <Play className="w-6 h-6 fill-[#007fb1]" />
          Los geht's!
        </motion.button>
      </div>
    </motion.div>
  );
}