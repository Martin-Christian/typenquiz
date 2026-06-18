import React, { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import TitleScreen from '../components/quiz-player/TitleScreen';
import ProgressBar from '../components/quiz-player/ProgressBar';
import QuestionSlide from '../components/quiz-player/QuestionSlide';
import ResultScreen from '../components/quiz-player/ResultScreen';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizPlayer() {
  const params = new URLSearchParams(window.location.search);
  const quizId = params.get('id');

  const [phase, setPhase] = useState('loading');
  const [sessionId, setSessionId] = useState(null);
  const [questionOrder, setQuestionOrder] = useState([]); // shuffled indices
  const [currentStep, setCurrentStep] = useState(0);      // index into questionOrder
  const [scores, setScores] = useState({});
  const [resultPersonality, setResultPersonality] = useState(null);
  // Guard against duplicate saves
  const savingRef = useRef(false);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => base44.entities.Quiz.filter({ id: quizId }),
    enabled: !!quizId,
  });

  const quizData = quiz?.[0];

  // On load: look for an existing unfinished session for this quiz/user
  useEffect(() => {
    if (!quizData) return;

    async function checkExistingSession() {
      const user = await base44.auth.me().catch(() => null);
      if (!user) {
        // Not logged in: just start fresh
        setPhase(quizData.show_title_screen !== false ? 'title' : 'question');
        return;
      }

      const sessions = await base44.entities.QuizSession.filter({
        quiz_id: quizId,
        created_by_id: user.id,
        completed: false,
      }, '-created_date', 1).catch(() => []);

      const existing = sessions?.[0];

      if (
        existing &&
        existing.question_order?.length === quizData.questions?.length &&
        existing.answers?.length > 0 &&
        existing.answers.length < quizData.questions.length
      ) {
        // Resume session
        setSessionId(existing.id);
        setQuestionOrder(existing.question_order);
        setCurrentStep(existing.answers.length);
        setScores(existing.scores || {});
        setPhase('question');
      } else {
        setPhase(quizData.show_title_screen !== false ? 'title' : 'question');
      }
    }

    checkExistingSession();
  }, [quizData, quizId]);

  const handleStart = useCallback(async () => {
    const order = shuffleArray(quizData.questions.map((_, i) => i));
    setQuestionOrder(order);
    setCurrentStep(0);
    setScores({});

    const session = await base44.entities.QuizSession.create({
      quiz_id: quizId,
      quiz_title: quizData?.title || '',
      completed: false,
      question_order: order,
      answers: [],
      scores: {},
    }).catch(() => null);

    if (session) setSessionId(session.id);
    setPhase('question');
  }, [quizId, quizData]);

  const handleAnswer = useCallback(async (answer) => {
    if (!quizData || savingRef.current) return;

    const personalityNames = answer.personalities
      ?.split(',')
      .map(p => p.trim())
      .filter(Boolean) || [];

    const newScores = { ...scores };
    personalityNames.forEach(name => {
      newScores[name] = (newScores[name] || 0) + 1;
    });
    setScores(newScores);

    const currentQuestionIndex = questionOrder[currentStep];
    const newAnswers_entry = {
      question_index: currentQuestionIndex,
      answer_text: answer.text || '',
      personalities: answer.personalities || '',
    };

    const isLast = currentStep >= quizData.questions.length - 1;

    // Persist progress to session
    if (sessionId) {
      savingRef.current = true;
      // Fetch current answers from session to append
      const sessions = await base44.entities.QuizSession.filter({ id: sessionId }).catch(() => []);
      const currentSession = sessions?.[0];
      const prevAnswers = currentSession?.answers || [];
      const updatedAnswers = [...prevAnswers, newAnswers_entry];

      await base44.entities.QuizSession.update(sessionId, {
        answers: updatedAnswers,
        scores: newScores,
        completed: isLast,
      }).catch(() => {});
      savingRef.current = false;
    }

    if (!isLast) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Calculate winner
      let maxScore = 0;
      let winner = null;
      Object.entries(newScores).forEach(([name, score]) => {
        if (score > maxScore) { maxScore = score; winner = name; }
      });

      const personality = quizData.personalities?.find(p => p.name === winner) || {
        name: winner || 'Unbekannt',
        description: '',
      };
      setResultPersonality(personality);
      setPhase('result');

      // Save final result
      base44.entities.QuizResult.create({
        quiz_id: quizId,
        personality_name: personality.name,
        scores: newScores,
      }).catch(() => {});
    }
  }, [currentStep, questionOrder, scores, quizData, quizId, sessionId]);

  const handleRetake = useCallback(() => {
    setSessionId(null);
    setQuestionOrder([]);
    setCurrentStep(0);
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

  const currentQuestionData = questionOrder.length > 0
    ? quizData.questions[questionOrder[currentStep]]
    : null;

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
              current={currentStep + 1}
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

          {phase === 'question' && currentQuestionData && (
            <QuestionSlide
              key={currentStep}
              question={currentQuestionData}
              questionIndex={currentStep}
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