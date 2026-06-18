import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, Trash2, Loader2, ImageIcon, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function MediaLibrary() {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: media = [], isLoading } = useQuery({
    queryKey: ['media-items'],
    queryFn: () => base44.entities.MediaItem.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MediaItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-items'] });
      toast.success('Bild gelöscht');
    },
  });

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.MediaItem.create({ url: file_url, name: file.name });
    }
    queryClient.invalidateQueries({ queryKey: ['media-items'] });
    toast.success(`${files.length} Bild(er) hochgeladen`);
    setUploading(false);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <img
          src="https://media.base44.com/images/public/6a0c17d634c6c9dc26ecc859/c941e491b_Logovorschlag_adFort.png"
          alt="adFort"
          className="h-12 mb-6"
        />

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Zurück
            </Link>
            <h1 className="font-heading text-2xl font-bold">Mediendatenbank</h1>
          </div>
          <label className="cursor-pointer">
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Bilder hochladen
            </span>
          </label>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && media.length === 0 && (
          <div className="text-center py-20 border border-dashed rounded-2xl">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground">Noch keine Bilder. Lade dein erstes Bild hoch.</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((item) => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden border bg-muted flex flex-col">
              <div className="relative aspect-square">
                <img src={item.url} alt={item.name || ''} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8"
                    onClick={() => deleteMutation.mutate(item.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="px-2 py-1.5 border-t bg-background space-y-0.5">
                {item.name && (
                  <p className="text-xs font-medium truncate text-foreground">{item.name}</p>
                )}
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground truncate flex-1">{item.url}</p>
                  <button
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    title="URL kopieren"
                    onClick={() => { navigator.clipboard.writeText(item.url); toast.success('URL kopiert'); }}
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}