import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, HelpCircle, GripVertical } from 'lucide-react';

export default function QuestionEditor({ questions, personalityNames, onChange }) {
  const items = questions || [];

  const addQuestion = () => {
    onChange([...items, { text: '', image_url: '', answers: [{ text: '', personalities: '' }, { text: '', personalities: '' }] }]);
  };

  const removeQuestion = (idx) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx, field, value) => {
    const updated = items.map((q, i) => i === idx ? { ...q, [field]: value } : q);
    onChange(updated);
  };

  const addAnswer = (qIdx) => {
    const updated = items.map((q, i) => {
      if (i === qIdx) {
        return { ...q, answers: [...(q.answers || []), { text: '', personalities: '' }] };
      }
      return q;
    });
    onChange(updated);
  };

  const removeAnswer = (qIdx, aIdx) => {
    const updated = items.map((q, i) => {
      if (i === qIdx) {
        return { ...q, answers: q.answers.filter((_, j) => j !== aIdx) };
      }
      return q;
    });
    onChange(updated);
  };

  const updateAnswer = (qIdx, aIdx, field, value) => {
    const updated = items.map((q, i) => {
      if (i === qIdx) {
        const answers = q.answers.map((a, j) => j === aIdx ? { ...a, [field]: value } : a);
        return { ...q, answers };
      }
      return q;
    });
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Fragen</Label>
        <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="gap-1">
          <Plus className="w-4 h-4" /> Frage hinzufügen
        </Button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
          Noch keine Fragen. Füge mindestens eine hinzu.
        </p>
      )}

      {items.map((q, qIdx) => (
        <div key={qIdx} className="border rounded-xl p-4 space-y-4 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="font-medium text-sm">Frage {qIdx + 1}</span>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(qIdx)} className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <Input
            placeholder="Fragetext"
            value={q.text || ''}
            onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
          />

          <Input
            placeholder="Bild-URL für die Frage (optional)"
            value={q.image_url || ''}
            onChange={(e) => updateQuestion(qIdx, 'image_url', e.target.value)}
          />

          <div className="space-y-2 ml-4 border-l-2 border-border pl-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Antworten</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => addAnswer(qIdx)} className="text-xs gap-1 h-7">
                <Plus className="w-3 h-3" /> Antwort
              </Button>
            </div>

            {q.answers?.map((a, aIdx) => (
              <div key={aIdx} className="flex items-start gap-2">
                <div className="flex-1 space-y-2 border rounded-lg p-3 bg-background">
                  <Input
                    placeholder="Antworttext"
                    value={a.text || ''}
                    onChange={(e) => updateAnswer(qIdx, aIdx, 'text', e.target.value)}
                    className="text-sm"
                  />
                  {personalityNames.length > 0 ? (
                    <div>
                      <span className="text-xs text-muted-foreground mb-1 block">Persönlichkeit:</span>
                      <div className="flex flex-wrap gap-3">
                        {personalityNames.map((name) => (
                          <label key={name} className="flex items-center gap-1.5 cursor-pointer text-sm">
                            <input
                              type="radio"
                              name={`q${qIdx}-a${aIdx}-personality`}
                              value={name}
                              checked={a.personalities === name}
                              onChange={() => updateAnswer(qIdx, aIdx, 'personalities', name)}
                              className="accent-primary"
                            />
                            {name}
                          </label>
                        ))}
                        <label className="flex items-center gap-1.5 cursor-pointer text-sm text-muted-foreground">
                          <input
                            type="radio"
                            name={`q${qIdx}-a${aIdx}-personality`}
                            value=""
                            checked={!a.personalities}
                            onChange={() => updateAnswer(qIdx, aIdx, 'personalities', '')}
                            className="accent-primary"
                          />
                          Keine
                        </label>
                      </div>
                    </div>
                  ) : (
                    <Input
                      placeholder="Persönlichkeiten (kommagetrennt)"
                      value={a.personalities || ''}
                      onChange={(e) => updateAnswer(qIdx, aIdx, 'personalities', e.target.value)}
                      className="text-sm"
                    />
                  )}
                </div>
                {q.answers.length > 2 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeAnswer(qIdx, aIdx)} className="text-muted-foreground hover:text-destructive mt-1 h-8 w-8">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}