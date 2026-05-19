import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';
import PersonalityEditor from '../components/builder/PersonalityEditor';
import QuestionEditor from '../components/builder/QuestionEditor';

export default function QuizBuilder() {
  const params = new URLSearchParams(window.location.search);
  const quizId = params.get('id');
  const isEdit = !!quizId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: '',
    description: '',
    title_image_url: '',
    personalities: [],
    questions: [],
    button_color: '4D5DAA',
    progress_color: '38B755',
    result_animation: 'fade-in',
    show_title_screen: true,
    is_published: false,
  });

  const { data: existingQuiz } = useQuery({
    queryKey: ['quiz-edit', quizId],
    queryFn: () => base44.entities.Quiz.filter({ id: quizId }),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingQuiz?.[0]) {
      setForm(existingQuiz[0]);
    }
  }, [existingQuiz]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isEdit) {
        await base44.entities.Quiz.update(quizId, form);
      } else {
        const created = await base44.entities.Quiz.create(form);
        return created;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Quiz gespeichert!');
      if (!isEdit && data?.id) {
        navigate(`/builder?id=${data.id}`);
      }
    },
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const personalityNames = (form.personalities || []).map(p => p.name).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </Link>
          <div className="flex items-center gap-2">
            {isEdit && (
              <Link to={`/play?id=${quizId}`}>
                <Button variant="outline" size="sm" className="gap-1">
                  <Eye className="w-4 h-4" /> Vorschau
                </Button>
              </Link>
            )}
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              size="sm"
              className="gap-1"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? 'Speichern...' : 'Speichern'}
            </Button>
          </div>
        </div>

        <h1 className="font-heading text-3xl font-bold mb-8">
          {isEdit ? 'Quiz bearbeiten' : 'Neues Quiz erstellen'}
        </h1>

        <div className="space-y-8">
          {/* Basic info */}
          <section className="space-y-4">
            <h2 className="font-heading text-lg font-semibold border-b pb-2">Allgemein</h2>
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Welches Hogwarts-Haus passt zu dir?"
              />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung (optional)</Label>
              <Textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Finde heraus, welches Haus am besten zu deiner Persönlichkeit passt..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Titelbild URL (optional)</Label>
              <Input
                value={form.title_image_url}
                onChange={(e) => update('title_image_url', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </section>

          {/* Settings */}
          <section className="space-y-4">
            <h2 className="font-heading text-lg font-semibold border-b pb-2">Einstellungen</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ergebnis-Animation</Label>
                <Select value={form.result_animation} onValueChange={(v) => update('result_animation', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keine</SelectItem>
                    <SelectItem value="fade-in">Einblenden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Buttonfarbe (Hex)</Label>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 rounded-lg border" style={{ backgroundColor: `#${form.button_color}` }} />
                  <Input
                    value={form.button_color}
                    onChange={(e) => update('button_color', e.target.value.replace('#', ''))}
                    placeholder="4D5DAA"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fortschrittsbalken-Farbe (Hex)</Label>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 rounded-lg border" style={{ backgroundColor: `#${form.progress_color}` }} />
                  <Input
                    value={form.progress_color}
                    onChange={(e) => update('progress_color', e.target.value.replace('#', ''))}
                    placeholder="38B755"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={form.show_title_screen}
                  onCheckedChange={(v) => update('show_title_screen', v)}
                />
                <Label>Titelbildschirm anzeigen</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.is_published}
                  onCheckedChange={(v) => update('is_published', v)}
                />
                <Label>Veröffentlicht</Label>
              </div>
            </div>
          </section>

          {/* Personalities */}
          <section>
            <h2 className="font-heading text-lg font-semibold border-b pb-2 mb-4">Persönlichkeiten</h2>
            <PersonalityEditor
              personalities={form.personalities}
              onChange={(v) => update('personalities', v)}
            />
          </section>

          {/* Questions */}
          <section>
            <h2 className="font-heading text-lg font-semibold border-b pb-2 mb-4">Fragen</h2>
            <QuestionEditor
              questions={form.questions}
              personalityNames={personalityNames}
              onChange={(v) => update('questions', v)}
            />
          </section>
        </div>
      </div>
    </div>
  );
}