import React, { useMemo, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, BookOpen, User } from 'lucide-react';

export default function UserBehaviorSection({ quizzes, sessions }) {
  const [codebookQuizId, setCodebookQuizId] = useState(null);

  // Build a codebook per quiz: Q1..Qn and A1..An for answers
  const codebooks = useMemo(() => {
    const books = {};
    quizzes.forEach(quiz => {
      const questions = quiz.questions || [];
      books[quiz.id] = questions.map((q, qi) => ({
        code: `Q${qi + 1}`,
        text: q.text || '',
        answers: (q.answers || []).map((a, ai) => ({
          code: `A${ai + 1}`,
          text: a.text || '',
        })),
      }));
    });
    return books;
  }, [quizzes]);

  // Resolve Q/A codes for a single session answer
  function getCodes(quizId, questionIndex, answerText) {
    const book = codebooks[quizId] || [];
    const qEntry = book[questionIndex];
    const qCode = qEntry?.code || `Q${(questionIndex ?? 0) + 1}`;
    let aCode = '?';
    if (qEntry) {
      const aIdx = qEntry.answers.findIndex(a => a.text === answerText);
      if (aIdx >= 0) aCode = qEntry.answers[aIdx].code;
    }
    return { qCode, aCode };
  }

  // Group sessions by anonymized user
  const userGroups = useMemo(() => {
    const userIds = [...new Set(sessions.map(s => s.created_by_id).filter(Boolean))];
    userIds.sort();
    const userLabels = {};
    userIds.forEach((uid, i) => { userLabels[uid] = `Nutzer ${String(i + 1).padStart(2, '0')}`; });

    const groups = {};
    sessions.forEach(s => {
      if (!s.created_by_id) return;
      if (!groups[s.created_by_id]) groups[s.created_by_id] = [];
      groups[s.created_by_id].push(s);
    });

    return Object.entries(groups).map(([uid, userSessions]) => ({
      label: userLabels[uid] || 'Unbekannt',
      sessions: userSessions.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)),
    }));
  }, [sessions]);

  const quizMap = useMemo(() => {
    const m = {};
    quizzes.forEach(q => { m[q.id] = q; });
    return m;
  }, [quizzes]);

  const quizzesWithCodebook = quizzes.filter(q => (codebooks[q.id] || []).length > 0);

  return (
    <div className="mt-10">
      <div className="flex items-center gap-3 mb-2">
        <User className="w-6 h-6 text-primary" />
        <h2 className="font-heading text-2xl font-bold">Einzelantworten (codiert)</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Fragen und Antworten sind als Q1, A2 etc. codiert, um die Auswertung übersichtlich zu halten.
        Nutzer sind anonymisiert. Klicke auf ein Quiz, um das Codebuch einzusehen.
      </p>

      {/* Codebook */}
      {quizzesWithCodebook.length > 0 && (
        <div className="space-y-2 mb-6">
          {quizzesWithCodebook.map(quiz => (
            <Collapsible key={quiz.id} open={codebookQuizId === quiz.id} onOpenChange={(o) => setCodebookQuizId(o ? quiz.id : null)}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                <BookOpen className="w-4 h-4" />
                Codebuch: {quiz.title}
                <ChevronDown className={`w-4 h-4 transition-transform ${codebookQuizId === quiz.id ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="bg-card border rounded-xl p-4 mt-2 space-y-3">
                  {(codebooks[quiz.id] || []).map(q => (
                    <div key={q.code} className="text-sm">
                      <p className="font-semibold text-foreground">
                        <span className="text-primary">{q.code}</span> {q.text}
                      </p>
                      <div className="ml-4 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        {q.answers.map(a => (
                          <span key={a.code} className="text-muted-foreground">
                            <span className="font-medium text-foreground">{a.code}</span>: {a.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Per-user coded responses */}
      {userGroups.length === 0 && (
        <p className="text-sm text-muted-foreground italic">Noch keine Sitzungsdaten vorhanden.</p>
      )}

      <div className="space-y-4">
        {userGroups.map(group => (
          <div key={group.label} className="bg-card border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground">
                {group.label.slice(-2)}
              </div>
              <h3 className="font-heading text-lg font-bold">{group.label}</h3>
              <span className="text-xs text-muted-foreground ml-auto">{group.sessions.length} Sitzung(en)</span>
            </div>

            <div className="space-y-3">
              {group.sessions.map(session => {
                const sortedAnswers = [...(session.answers || [])].sort((a, b) => a.question_index - b.question_index);
                return (
                  <div key={session.id} className="border rounded-lg p-3 bg-muted/30">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-medium text-foreground">{session.quiz_title || quizMap[session.quiz_id]?.title || 'Unbekannt'}</span>
                      <div className="flex items-center gap-2">
                        {session.completed
                          ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Abgeschlossen</span>
                          : <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Offen</span>
                        }
                        <span className="text-xs text-muted-foreground">
                          {new Date(session.created_date).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>
                    {sortedAnswers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {sortedAnswers.map((ans, i) => {
                          const { qCode, aCode } = getCodes(session.quiz_id, ans.question_index, ans.answer_text);
                          return (
                            <span key={i} className="inline-flex items-center gap-1 text-xs font-mono bg-white border px-2 py-1 rounded-md">
                              <span className="font-bold text-primary">{qCode}</span>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-bold text-foreground">{aCode}</span>
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Keine Antworten gespeichert.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}