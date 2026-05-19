import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export default function TitleScreen({ quiz, onStart }) {
  const hasImage = !!quiz.title_image_url;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex flex-col items-center justify-center min-h-[480px] rounded-2xl overflow-hidden"
    >
      {hasImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${quiz.title_image_url})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </div>
      )}

      {!hasImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent to-primary/5" />
      )}

      <div className="relative z-10 text-center px-8 py-16 max-w-2xl">
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`font-heading text-4xl md:text-5xl font-bold mb-4 leading-tight ${hasImage ? 'text-white' : 'text-foreground'}`}
        >
          {quiz.title}
        </motion.h1>

        {quiz.description && (
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className={`text-lg mb-10 leading-relaxed ${hasImage ? 'text-white/80' : 'text-muted-foreground'}`}
          >
            {quiz.description}
          </motion.p>
        )}

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
        >
          <Play className="w-5 h-5" />
          Quiz starten
        </motion.button>
      </div>
    </motion.div>
  );
}