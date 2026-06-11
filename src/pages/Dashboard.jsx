import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';
import QuizCard from '../components/dashboard/QuizCard';

export default function Dashboard() {
  const queryClient = useQueryClient();

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: () => base44.entities.Quiz.list('-created_date'),
    initialData: []
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Quiz.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quizzes'] })
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-14">
        {/* Hero header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <img src="https://media.base44.com/images/public/6a0c17d634c6c9dc26ecc859/c941e491b_Logovorschlag_adFort.png" alt="adFort" className="h-20 mb-4" />
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Personality Quiz</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground leading-tight">Dein Quiz

            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Erstelle und verwalte deine Persönlichkeits-Quizze.
            </p>
          </div>
          <Link to="/builder">
            <Button size="lg" className="gap-2 rounded-full px-8 shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5" />
              Neues Quiz
            </Button>
          </Link>
        </div>

        {/* Loading */}
        {isLoading &&
        <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        }

        {/* Empty state */}
        {!isLoading && quizzes.length === 0 &&
        <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-heading text-2xl font-bold mb-2">Noch keine Quizze</h2>
            <p className="text-muted-foreground mb-6">Erstelle dein erstes Persönlichkeits-Quiz!</p>
            <Link to="/builder">
              <Button size="lg" className="gap-2 rounded-full px-8">
                <Plus className="w-5 h-5" />
                Quiz erstellen
              </Button>
            </Link>
          </div>
        }

        {/* Grid */}
        {!isLoading && quizzes.length > 0 &&
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, idx) =>
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            index={idx}
            onDelete={(id) => deleteMutation.mutate(id)} />

          )}
          </div>
        }
      </div>
    </div>);

}