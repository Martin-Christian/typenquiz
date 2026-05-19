import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, User } from 'lucide-react';

export default function PersonalityEditor({ personalities, onChange }) {
  const items = personalities || [];

  const add = () => {
    onChange([...items, { name: '', description: '', image_url: '' }]);
  };

  const remove = (idx) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const update = (idx, field, value) => {
    const updated = items.map((p, i) => i === idx ? { ...p, [field]: value } : p);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Persönlichkeiten</Label>
        <Button type="button" variant="outline" size="sm" onClick={add} className="gap-1">
          <Plus className="w-4 h-4" /> Hinzufügen
        </Button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
          Noch keine Persönlichkeiten. Füge mindestens 2 hinzu.
        </p>
      )}

      {items.map((p, idx) => (
        <div key={idx} className="border rounded-xl p-4 space-y-3 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium text-sm">Persönlichkeit {idx + 1}</span>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(idx)} className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <Input
            placeholder="Name (z.B. Gryffindor)"
            value={p.name || ''}
            onChange={(e) => update(idx, 'name', e.target.value)}
          />
          <Textarea
            placeholder="Beschreibung"
            value={p.description || ''}
            onChange={(e) => update(idx, 'description', e.target.value)}
            rows={2}
          />
          <Input
            placeholder="Bild-URL (optional)"
            value={p.image_url || ''}
            onChange={(e) => update(idx, 'image_url', e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}