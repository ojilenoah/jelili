'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Pin, Trash2, X, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase-client';
import { useSender } from '@/context/sender-context';
import { useToast } from '@/hooks/use-toast';
import MarkdownView from '@/components/markdown-view';
import GrowingTextarea from '@/components/growing-textarea';
import type { ContentFormat, DiaryEntry } from '@/lib/types';

const FORMATS: { value: ContentFormat; label: string }[] = [
  { value: 'plain', label: 'Plain' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'code', label: 'Code' },
  { value: 'quote', label: 'Quote' },
];

interface DiaryModalProps {
  entry: DiaryEntry;
  onClose: () => void;
  onUpdated: (entry: DiaryEntry) => void;
  onDeleted: (id: string) => void;
}

export default function DiaryModal({ entry, onClose, onUpdated, onDeleted }: DiaryModalProps) {
  const { sender } = useSender();
  const { toast } = useToast();
  const plainOnly = sender === 'Jelili';
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(entry.title ?? '');
  const [body, setBody] = useState(entry.body);
  const [fmt, setFmt] = useState<ContentFormat>(entry.format);
  const [busy, setBusy] = useState(false);

  const isMine = entry.author === sender;
  const isNoah = entry.author === 'Noah';
  const accent = isNoah ? 'border-foreground/50' : 'border-rose-500/50';
  const dot = isNoah ? 'bg-foreground' : 'bg-rose-500';
  const renderFormat: ContentFormat =
    entry.format === 'plain' ? 'markdown' : entry.format;
  const saveFormat: ContentFormat = plainOnly ? 'plain' : fmt;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const save = async () => {
    if (busy) return;
    setBusy(true);
    const { data, error } = await supabase
      .from('diary_entries')
      .update({
        title: title.trim() || null,
        body,
        format: saveFormat,
      })
      .eq('id', entry.id)
      .select()
      .single();
    setBusy(false);
    if (error) {
      toast({ title: 'Could not save', description: error.message, variant: 'destructive' });
      return;
    }
    if (data) {
      onUpdated(data as DiaryEntry);
      setEditing(false);
    }
  };

  const togglePin = async () => {
    const { data, error } = await supabase
      .from('diary_entries')
      .update({ pinned: !entry.pinned })
      .eq('id', entry.id)
      .select()
      .single();
    if (error) {
      toast({ title: 'Could not pin', description: error.message, variant: 'destructive' });
      return;
    }
    if (data) onUpdated(data as DiaryEntry);
  };

  const remove = async () => {
    if (busy) return;
    if (!confirm('Delete this entry?')) return;
    setBusy(true);
    const { error } = await supabase
      .from('diary_entries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', entry.id);
    setBusy(false);
    if (error) {
      toast({ title: 'Could not delete', description: error.message, variant: 'destructive' });
      return;
    }
    onDeleted(entry.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm animate-card-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-lg border-2 bg-card p-6 md:p-8',
          accent
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className={cn('h-2 w-2 rounded-full', dot)} />
          <span className="text-[10px] font-code uppercase tracking-wider text-muted-foreground">
            {entry.author} · {format(new Date(entry.created_at), 'PPP p')}
          </span>
          {entry.pinned && <Pin className="h-3 w-3 text-muted-foreground" />}
        </div>

        {editing ? (
          <div className="flex flex-col gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="bg-transparent border-0 outline-none text-lg md:text-xl font-headline placeholder:text-muted-foreground"
            />
            <GrowingTextarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              minRows={4}
              maxRows={20}
              className="text-sm"
            />
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {!plainOnly ? (
                <div className="flex items-center gap-1 p-1 rounded-md border border-border bg-background text-[10px] font-code uppercase tracking-wider">
                  {FORMATS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFmt(f.value)}
                      className={cn(
                        'px-2 py-1 rounded transition-colors',
                        fmt === f.value
                          ? 'bg-foreground text-background'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="text-[10px] font-code uppercase tracking-wider text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={busy || body.trim() === ''}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-foreground px-3 text-xs text-background hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {entry.title && (
              <h2 className="font-headline text-xl md:text-2xl text-foreground mb-3">
                {entry.title}
              </h2>
            )}
            <MarkdownView body={entry.body} format={renderFormat} className="text-base leading-relaxed" />

            {isMine && (
              <div className="mt-6 flex items-center gap-2 pt-4 border-t border-border">
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={togglePin}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pin className="h-3.5 w-3.5" />
                  {entry.pinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  onClick={remove}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors ml-auto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
