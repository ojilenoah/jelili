'use client';

import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { useSender } from '@/context/sender-context';
import { useToast } from '@/hooks/use-toast';
import type { ContentFormat, DiaryEntry } from '@/lib/types';
import { cn } from '@/lib/utils';
import MarkdownView from '@/components/markdown-view';

const FORMATS: { value: ContentFormat; label: string }[] = [
  { value: 'plain', label: 'Plain' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'code', label: 'Code' },
  { value: 'quote', label: 'Quote' },
];

interface DiaryComposerProps {
  onEntryCreated: (entry: DiaryEntry) => void;
}

export default function DiaryComposer({ onEntryCreated }: DiaryComposerProps) {
  const { sender } = useSender();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [format, setFormat] = useState<ContentFormat>('plain');
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitle('');
    setBody('');
    setFormat('plain');
    setPreview(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (body.trim() === '' || submitting) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from('diary_entries')
      .insert([
        {
          author: sender,
          title: title.trim() || null,
          body,
          format,
        },
      ])
      .select()
      .single();
    setSubmitting(false);
    if (error) {
      toast({ title: 'Could not save', description: error.message, variant: 'destructive' });
      return;
    }
    if (data) onEntryCreated(data as DiaryEntry);
    reset();
  };

  const accent = sender === 'Noah' ? 'border-emerald-500/40' : 'border-rose-500/40';

  return (
    <form
      onSubmit={submit}
      className={cn(
        'flex flex-col gap-3 rounded-md border bg-card p-4',
        accent
      )}
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="bg-transparent border-0 outline-none text-base font-headline placeholder:text-muted-foreground"
      />

      {preview ? (
        <div className="min-h-[120px] rounded-md border border-dashed border-border p-3">
          {body.trim() === '' ? (
            <p className="text-xs text-muted-foreground">Nothing to preview yet.</p>
          ) : (
            <MarkdownView body={body} format={format} />
          )}
        </div>
      ) : (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`Write to yourself, ${sender}…`}
          rows={4}
          className="bg-transparent border-0 outline-none text-sm leading-relaxed placeholder:text-muted-foreground resize-y min-h-[100px]"
        />
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-md border border-border bg-background text-[10px] font-code uppercase tracking-wider">
          {FORMATS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFormat(f.value)}
              className={cn(
                'px-2 py-1 rounded transition-colors',
                format === f.value
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="text-[10px] font-code uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button
            type="submit"
            disabled={submitting || body.trim() === ''}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-foreground px-3 text-xs text-background hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Save
          </button>
        </div>
      </div>
    </form>
  );
}
