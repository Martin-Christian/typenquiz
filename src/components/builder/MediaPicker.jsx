import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Image, Check, Loader2, Upload } from 'lucide-react';

export default function MediaPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: media = [] } = useQuery({
    queryKey: ['media-items'],
    queryFn: () => base44.entities.MediaItem.list('-created_date'),
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MediaItem.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media-items'] }),
  });

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await createMutation.mutateAsync({ url: file_url, name: file.name });
    setUploading(false);
  };

  const handleSelect = (url) => {
    onChange(url);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2">
        {value ? (
          <div className="relative">
            <img src={value} alt="" className="h-20 rounded-lg object-cover border" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        ) : null}
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-2">
            <Image className="w-4 h-4" />
            {value ? 'Bild ändern' : 'Bild auswählen'}
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Mediendatenbank</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 mb-4">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-input text-sm font-medium hover:bg-accent transition-colors">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Bild hochladen
            </span>
          </label>
          <span className="text-sm text-muted-foreground">{media.length} Bilder</span>
        </div>

        {media.length === 0 && !uploading && (
          <p className="text-sm text-muted-foreground text-center py-10 border border-dashed rounded-lg">
            Noch keine Bilder. Lade dein erstes Bild hoch.
          </p>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
          {media.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.url)}
              className="relative group rounded-lg overflow-hidden border-2 aspect-square hover:border-primary transition-colors"
              style={{ borderColor: value === item.url ? 'hsl(var(--primary))' : 'transparent' }}
            >
              <img src={item.url} alt={item.name || ''} className="w-full h-full object-cover" />
              {value === item.url && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-primary" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}