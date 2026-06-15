import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import TitleScreen from '../components/quiz-player/TitleScreen';
import ProgressBar from '../components/quiz-player/ProgressBar';
import QuestionSlide from '../components/quiz-player/QuestionSlide';
import ResultScreen from '../components/quiz-player/ResultScreen';

export default function QuizPlayer() {
  const params = new URLSearchParams(window.location.search);
  const quizId = params.get('id');

  const [phase, setPhase] = useState('loading'); // loading | title | question | result
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({});
  const [resultPersonality, setResultPersonality] = useState(null);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => base44.entities.Quiz.filter({ id: quizId }),
    enabled: !!quizId,
  });

  const quizData = quiz?.[0];

  useEffect(() => {
    if (quizData) {
      setPhase(quizData.show_title_screen !== false ? 'title' : 'question');
    }
  }, [quizData]);

  const handleStart = useCallback(() => {
    setPhase('question');
    // Track session start
    base44.entities.QuizSession.create({
      quiz_id: quizId,
      quiz_title: quizData?.title || '',
      completed: false,
    }).catch(() => {});
  }, [quizId, quizData]);

  const handleAnswer = useCallback((answer) => {
    if (!quizData) return;

    const personalityNames = answer.personalities
      ?.split(',')
      .map(p => p.trim())
      .filter(Boolean) || [];

    setScores(prev => {
      const next = { ...prev };
      personalityNames.forEach(name => {
        next[name] = (next[name] || 0) + 1;
      });
      return next;
    });

    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calculate result
      setTimeout(() => {
        setScores(prevScores => {
          const updatedScores = { ...prevScores };
          personalityNames.forEach(name => {
            updatedScores[name] = (updatedScores[name] || 0);
          });

          let maxScore = 0;
          let winner = null;
          Object.entries(updatedScores).forEach(([name, score]) => {
            if (score > maxScore) {
              maxScore = score;
              winner = name;
            }
          });

          const personality = quizData.personalities?.find(p => p.name === winner) || {
            name: winner || 'Unbekannt',
            description: '',
          };
          setResultPersonality(personality);
          setPhase('result');

          // Track completion
          base44.entities.QuizSession.create({
            quiz_id: quizId,
            quiz_title: quizData?.title || '',
            completed: true,
          }).catch(() => {});

          // Save result
          base44.entities.QuizResult.create({
            quiz_id: quizId,
            personality_name: personality.name,
            scores: updatedScores,
          }).catch(() => {});

          return updatedScores;
        });
      }, 50);
    }
  }, [currentQuestion, quizData, quizId]);

  const handleRetake = useCallback(() => {
    setCurrentQuestion(0);
    setScores({});
    setResultPersonality(null);
    setPhase(quizData?.show_title_screen !== false ? 'title' : 'question');
  }, [quizData]);

  if (isLoading || phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Quiz nicht gefunden.</p>
        <Link to="/" className="text-primary hover:underline">Zurück zur Übersicht</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #46178F 0%, #7B2FBE 60%, #9B59B6 100%)' }}>
      {/* Brand Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/10 py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <img
            src="https://media.base44.com/images/public/6a0c17d634c6c9dc26ecc859/c941e491b_Logovorschlag_adFort.png"
            alt="adFort"
            className="h-28 brightness-0 invert"
          />
          {phase !== 'result' && (
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Zurück
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">

        {/* Progress bar */}
        {phase === 'question' && quizData.questions && (
          <div className="mb-8">
            <ProgressBar
              current={currentQuestion + 1}
              total={quizData.questions.length}
              color={quizData.progress_color}
            />
          </div>
        )}

        {/* Phases */}
        <AnimatePresence mode="wait">
          {phase === 'title' && (
            <TitleScreen quiz={quizData} onStart={handleStart} />
          )}

          {phase === 'question' && quizData.questions?.[currentQuestion] && (
            <QuestionSlide
              key={currentQuestion}
              question={quizData.questions[currentQuestion]}
              questionIndex={currentQuestion}
              onAnswer={handleAnswer}
              accentColor={quizData.button_color}
              
            />
          )}

          {phase === 'result' && resultPersonality && (
            <ResultScreen
              personality={resultPersonality}
              scores={scores}
              allPersonalities={quizData.personalities}
              onRetake={handleRetake}
              animation={quizData.result_animation}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}