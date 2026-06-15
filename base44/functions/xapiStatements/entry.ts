import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const quizId = url.searchParams.get('quiz_id') || null;

  const [sessions, results, quizzes] = await Promise.all([
    base44.asServiceRole.entities.QuizSession.list('-created_date', 1000),
    base44.asServiceRole.entities.QuizResult.list('-created_date', 1000),
    base44.asServiceRole.entities.Quiz.list(),
  ]);

  const quizMap = {};
  quizzes.forEach(q => { quizMap[q.id] = q; });

  const appBase = 'https://adfort.quiz/';

  const statements = [];

  // "attempted" statements from sessions (started = not completed)
  for (const s of sessions) {
    if (quizId && s.quiz_id !== quizId) continue;
    const quiz = quizMap[s.quiz_id];
    const quizTitle = quiz?.title || s.quiz_title || s.quiz_id;

    statements.push({
      id: `urn:adfort:session:${s.id}`,
      timestamp: s.created_date,
      actor: {
        objectType: 'Agent',
        account: {
          homePage: appBase,
          name: s.created_by_id || 'anonymous',
        },
      },
      verb: {
        id: s.completed
          ? 'http://adlnet.gov/expapi/verbs/completed'
          : 'http://adlnet.gov/expapi/verbs/attempted',
        display: { 'de-DE': s.completed ? 'abgeschlossen' : 'gestartet' },
      },
      object: {
        objectType: 'Activity',
        id: `${appBase}quiz/${s.quiz_id}`,
        definition: {
          type: 'http://adlnet.gov/expapi/activities/assessment',
          name: { 'de-DE': quizTitle },
        },
      },
    });
  }

  // "completed" statements from results (with score/extensions)
  for (const r of results) {
    if (quizId && r.quiz_id !== quizId) continue;
    const quiz = quizMap[r.quiz_id];
    const quizTitle = quiz?.title || r.quiz_id;
    const totalScore = r.scores
      ? Object.values(r.scores).reduce((a, b) => a + b, 0)
      : 0;

    statements.push({
      id: `urn:adfort:result:${r.id}`,
      timestamp: r.created_date,
      actor: {
        objectType: 'Agent',
        account: {
          homePage: appBase,
          name: r.created_by_id || 'anonymous',
        },
      },
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/completed',
        display: { 'de-DE': 'abgeschlossen' },
      },
      object: {
        objectType: 'Activity',
        id: `${appBase}quiz/${r.quiz_id}`,
        definition: {
          type: 'http://adlnet.gov/expapi/activities/assessment',
          name: { 'de-DE': quizTitle },
        },
      },
      result: {
        score: { raw: totalScore },
        completion: true,
        extensions: {
          'https://adfort.quiz/extensions/personality': r.personality_name,
          'https://adfort.quiz/extensions/scores': r.scores || {},
        },
      },
    });
  }

  // Sort by timestamp descending
  statements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return Response.json({ statements, count: statements.length });
});