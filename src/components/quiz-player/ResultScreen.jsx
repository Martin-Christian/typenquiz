import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Trophy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PIE_COLORS = ['#A855F7', '#1368CE', '#D97706', '#0E7490', '#16A34A', '#DC2626', '#7C3AED', '#0891B2'];

export default function ResultScreen({ personality, scores, allPersonalities, onRetake, animation }) {
  const sortedScores = Object.entries(scores || {}).sort((a, b) => b[1] - a[1]);
  const total = sortedScores.reduce((sum, [, v]) => sum + v, 0);

  const pieData = sortedScores.map(([name, value]) => ({ name, value }));

  // Find full personality description for the top result
  const topPersonality = allPersonalities?.find(p => p.name === personality?.name) || personality;

  const containerVariants = animation === 'fade-in'
    ? { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 } }
    : { initial: { opacity: 1 }, animate: { opacity: 1 } };

  return (
    <motion.div {...containerVariants} className="w-full">
      {/* Result hero */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
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
      </div>

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border rounded-xl p-6 mb-6"
        >
          <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 text-center">
            Auswertung
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                animationBegin={300}
                animationDuration={800}
              >
                {pieData.map((entry, idx) => (
                  <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${Math.round((value / total) * 100)}%`, 'Anteil']}
              />
              <Legend
                formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Description of top personality */}
      {topPersonality?.description && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border rounded-xl p-6 mb-6"
        >
          <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {topPersonality.name}
          </h3>
          <p className="text-base text-muted-foreground leading-relaxed">
            {topPersonality.description.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
              /^https?:\/\//.test(part)
                ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80 break-all">{part}</a>
                : part
            )}
          </p>
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
        {topPersonality?.result_url && topPersonality?.result_button_text && (
          <Button
            asChild
            size="lg"
            className="gap-2 rounded-full px-8"
          >
            <a href={topPersonality.result_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              {topPersonality.result_button_text}
            </a>
          </Button>
        )}
      </div>
    </motion.div>
  );
}