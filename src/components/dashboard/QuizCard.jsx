import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Play, Users, HelpCircle, Trash2 } from 'lucide-react';

export default function QuizCard({ quiz, index, onDelete, isAdmin }) {
  const questionCount = quiz.questions?.length || 0;
  const personalityCount = quiz.personalities?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="group bg-card border rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      {/* Image / Gradient header */}
      <div className="h-36 relative overflow-hidden">
        {quiz.title_image_url ? (
          <img src={quiz.title_image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, #${quiz.button_color || '4D5DAA'}33, #${quiz.progress_color || '38B755'}22)`,
            }}
          />
        )}
        <div className="absolute top-3 right-3">
          <Badge variant={quiz.is_published ? 'default' : 'secondary'} className="text-xs">
            {quiz.is_published ? 'Veröffentlicht' : 'Entwurf'}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-heading text-lg font-bold text-foreground mb-2 line-clamp-2">
          {quiz.title || 'Unbenanntes Quiz'}
        </h3>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            {questionCount} Fragen
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {personalityCount} Typen
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/play?id=${quiz.id}`} className="flex-1">
            <Button variant="default" size="sm" className="w-full gap-1">
              <Play className="w-3.5 h-3.5" /> Spielen
            </Button>
          </Link>
          {isAdmin && (
            <>
              <Link to={`/builder?id=${quiz.id}`}>
                <Button variant="outline" size="sm" className="gap-1">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(quiz.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}