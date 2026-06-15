import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart2, CheckCircle, PlayCircle, Users, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '@/components/ui/button';

const COLORS = ['#4D5DAA', '#7B2FBE', '#38B755', '#E07B39', '#E84393', '#2BB5C8'];

async function downloadXapi(quizId = null) {
  const res = await base44.functions.invoke('xapiStatements', quizId ? { quiz_id: quizId } : {});
  const statements = res.data?.statements || [];
  const blob = new Blob([JSON.stringify(statements, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = quizId ? `xapi-quiz-${quizId}.json` : 'xapi-statements.json';
  a.click();
  URL.revokeObjectURL(url);
}

export default function Analytics() {
  const [downloading, setDownloading] = useState(null);
  const { data: quizzes = [] } = useQuery({
    queryKey: ['quizzes-analytics'],
    queryFn: () => base44.entities.Quiz.list(),
  });
  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.QuizSession.list('-created_date', 500),
  });
  const { data: results = [] } = useQuery({
    queryKey: ['results'],
    queryFn: () => base44.entities.QuizResult.list('-created_date', 500),
  });

  const quizMap = useMemo(() => {
    const m = {};
    quizzes.forEach(q => { m[q.id] = q; });
    return m;
  }, [quizzes]);

  // Per-quiz stats
  const quizStats = useMemo(() => {
    return quizzes.map(quiz => {
      const started = sessions.filter(s => s.quiz_id === quiz.id).length;
      const completed = results.filter(r => r.quiz_id === quiz.id).length;
      const completionRate = started > 0 ? Math.round((completed / started) * 100) : 0;
      return { quiz, started, completed, completionRate };
    }).sort((a, b) => b.started - a.started);
  }, [quizzes, sessions, results]);

  // Personality distribution per quiz
  const personalityStats = useMemo(() => {
    const byQuiz = {};
    results.forEach(r => {
      if (!byQuiz[r.quiz_id]) byQuiz[r.quiz_id] = {};
      const name = r.personality_name || 'Unbekannt';
      byQuiz[r.quiz_id][name] = (byQuiz[r.quiz_id][name] || 0) + 1;
    });
    return byQuiz;
  }, [results]);

  const totalStarted = sessions.length;
  const totalCompleted = results.length;
  const overallRate = totalStarted > 0 ? Math.round((totalCompleted / totalStarted) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2d2a7a] to-[#4D5DAA] py-5 px-6 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <img
            src="https://media.base44.com/images/public/6a0c17d634c6c9dc26ecc859/c941e491b_Logovorschlag_adFort.png"
            alt="adFort"
            className="h-32 brightness-0 invert"
          />
          <span className="text-white/70 text-sm font-medium tracking-widest uppercase hidden md:block">Analytics</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Zurück zum Dashboard
        </Link>

        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <BarChart2 className="w-7 h-7 text-primary" />
            <h1 className="font-heading text-3xl font-bold">Nutzerverhalten</h1>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            disabled={downloading === 'all'}
            onClick={async () => { setDownloading('all'); await downloadXapi(); setDownloading(null); }}
          >
            <Download className="w-4 h-4" />
            {downloading === 'all' ? 'Wird exportiert…' : 'xAPI exportieren'}
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <KpiCard icon={<PlayCircle className="w-6 h-6 text-primary" />} label="Gestartete Quizze" value={totalStarted} />
          <KpiCard icon={<CheckCircle className="w-6 h-6 text-green-600" />} label="Abgeschlossene Quizze" value={totalCompleted} />
          <KpiCard icon={<Users className="w-6 h-6 text-purple-600" />} label="Abschlussrate" value={`${overallRate}%`} />
        </div>

        {/* Per-quiz breakdown */}
        <div className="space-y-8">
          {quizStats.map(({ quiz, started, completed, completionRate }) => {
            const persDist = personalityStats[quiz.id] || {};
            const persData = Object.entries(persDist).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

            return (
              <div key={quiz.id} className="bg-card border rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                  <h2 className="font-heading text-xl font-bold">{quiz.title}</h2>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${quiz.is_published ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                      {quiz.is_published ? 'Veröffentlicht' : 'Entwurf'}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 text-xs"
                      disabled={downloading === quiz.id}
                      onClick={async () => { setDownloading(quiz.id); await downloadXapi(quiz.id); setDownloading(null); }}
                    >
                      <Download className="w-3 h-3" />
                      {downloading === quiz.id ? '…' : 'xAPI'}
                    </Button>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <StatBadge label="Gestartet" value={started} color="text-primary" />
                  <StatBadge label="Abgeschlossen" value={completed} color="text-green-600" />
                  <StatBadge label="Abschlussrate" value={`${completionRate}%`} color="text-purple-600" />
                </div>

                {/* Personality distribution */}
                {persData.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ergebnis-Verteilung</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={persData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                        <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v) => [`${v} Mal`, 'Ergebnis']} />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                          {persData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {persData.length === 0 && completed === 0 && (
                  <p className="text-sm text-muted-foreground italic">Noch keine Ergebnisse vorhanden.</p>
                )}
              </div>
            );
          })}
        </div>

        {quizStats.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">Noch keine Quiz-Daten vorhanden.</div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value }) {
  return (
    <div className="bg-card border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <p className="text-2xl font-bold font-heading">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function StatBadge({ label, value, color }) {
  return (
    <div className="bg-muted/50 rounded-xl p-3 text-center">
      <p className={`text-xl font-bold font-heading ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}