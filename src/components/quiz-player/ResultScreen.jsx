import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Share2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ResultScreen({ personality, scores, allPersonalities, onRetake, animation }) {
  const sortedScores = Object.entries(scores || {}).sort((a, b) => b[1] - a[1]);
  const maxScore = sortedScores.length > 0 ? sortedScores[0][1] : 1;
  const hasImage = !!personality?.image_url;

  const containerVariants = animation === 'fade-in'
    ? { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 } }
    : { initial: { opacity: 1 }, animate: { opacity: 1 } };

  return (
    <motion.div {...containerVariants} className="w-full">
      {/* Result hero */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
        {hasImage && (
          <div className="relative h-64 md:h-80">
            <img
              src={personality.image_url}
              alt={personality.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium text-white/80 uppercase tracking-wider">Dein Ergebnis</span>
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white">
                {personality.name}
              </h2>
            </div>
          </div>
        )}

        {!hasImage && (
          <div className="bg-gradient-to-br from-primary/10 via-accent to-primary/5 p-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Trophy className="w-10 h-10 text-primary" />
            </motion.div>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Dein Ergebnis</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2">
              {personality.name}
            </h2>
          </div>
        )}
      </div>

      {/* Description */}
      {personality?.description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-muted-foreground leading-relaxed mb-8 text-center max-w-xl mx-auto"
        >
          {personality.description}
        </motion.p>
      )}

      {/* Score breakdown */}
      {sortedScores.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border rounded-xl p-6 mb-8"
        >
          <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Auswertung
          </h3>
          <div className="space-y-3">
            {sortedScores.map(([name, score], idx) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground w-28 truncate">{name}</span>
                <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(score / maxScore) * 100}%` }}
                    transition={{ delay: 0.6 + idx * 0.1, duration: 0.5 }}
                    className={`h-full rounded-full ${idx === 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  />
                </div>
                <span className="text-sm font-semibold text-foreground w-8 text-right">{score}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          onClick={onRetake}
          variant="outline"
          size="lg"
          className="gap-2 rounded-full px-8"
        >
          <RotateCcw className="w-4 h-4" />
          Nochmal spielen
        </Button>
      </div>
    </motion.div>
  );
}