'use client';

import { useRef, useState, useEffect } from 'react';
import { Image as ImageIcon, Loader2, Send, X, CornerUpLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase-client';
import { useSender } from '@/context/sender-context';
import { useToast } from '@/hooks/use-toast';
import MarkdownView from '@/components/markdown-view';
import GrowingTextarea from '@/components/growing-textarea';
import type { ContentFormat, ChatMessageRich } from '@/lib/types';

const FORMATS: { value: ContentFormat; label: string }[] = [
  { value: 'plain', label: 'Plain' },
  { value: 'markdown', label: 'MD' },
  { value: 'code', label: 'Code' },
  { value: 'quote', label: 'Quote' },
];

interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
}

interface ChatComposerProps {
  replyTo: ChatMessageRich | null;
  onClearReply: () => void;
  onDropReply?: (payload: string) => void;
}

export default function ChatComposer({ replyTo, onClearReply, onDropReply }: ChatComposerProps) {
  const { sender } = useSender();
  const { toast } = useToast();
  const plainOnly = sender === 'Jelili';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState('');
  const [format, setFormat] = useState<ContentFormat>('markdown');
  const [preview, setPreview] = useState(false);
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const effectiveFormat: ContentFormat = plainOnly ? 'plain' : format;

  useEffect(
    () => () => {
      pending.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    },
    [pending]
  );

  const addFiles = (files: FileList | File[]) => {
    const next: PendingImage[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('image/')) continue;
      next.push({
        id: crypto.randomUUID(),
        file: f,
        previewUrl: URL.createObjectURL(f),
      });
    }
    if (next.length > 0) setPending((p) => [...p, ...next]);
  };

  const removePending = (id: string) => {
    setPending((p) => {
      const removed = p.find((x) => x.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return p.filter((x) => x.id !== id);
    });
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (body.trim() === '' && pending.length === 0) return;
    setSubmitting(true);

    try {
      const uploads = await Promise.all(
        pending.map(async (p, idx) => {
          const ext = p.file.name.split('.').pop() ?? 'bin';
          const path = `${sender.toLowerCase()}/${Date.now()}-${idx}-${crypto.randomUUID()}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from('chat-media')
            .upload(path, p.file, {
              cacheControl: '3600',
              upsert: false,
              contentType: p.file.type,
            });
          if (upErr) throw upErr;
          const { data: pub } = supabase.storage.from('chat-media').getPublicUrl(path);
          const dim = await readImageDimensions(p.file).catch(() => null);
          return {
            storage_path: path,
            public_url: pub.publicUrl,
            file_name: p.file.name,
            mime_type: p.file.type,
            size_bytes: p.file.size,
            width: dim?.width ?? null,
            height: dim?.height ?? null,
            position: idx,
          };
        })
      );

      const { data: msg, error: msgErr } = await supabase
        .from('chat_messages')
        .insert([
          {
            sender,
            body,
            format: effectiveFormat,
            reply_to_id: replyTo?.id ?? null,
          },
        ])
        .select()
        .single();
      if (msgErr) throw msgErr;

      if (uploads.length > 0 && msg) {
        const { error: attErr } = await supabase
          .from('chat_attachments')
          .insert(uploads.map((u) => ({ ...u, message_id: msg.id })));
        if (attErr) throw attErr;
      }

      pending.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setPending([]);
      setBody('');
      setPreview(false);
      onClearReply();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: 'Could not send', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void send(e as unknown as React.FormEvent);
    }
  };

  return (
    <form
      onSubmit={send}
      onDragOver={(e) => {
        if (
          e.dataTransfer.types.includes('Files') ||
          e.dataTransfer.types.includes('application/x-chat-message-id')
        ) {
          e.preventDefault();
          setDragOver(true);
        }
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        setDragOver(false);
        const replyId = e.dataTransfer.getData('application/x-chat-message-id');
        if (replyId && onDropReply) {
          e.preventDefault();
          onDropReply(replyId);
          return;
        }
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }
      }}
      className={cn(
        'flex flex-col gap-2 rounded-md border bg-card p-3 transition-colors',
        dragOver ? 'border-foreground' : 'border-border'
      )}
    >
      {replyTo && (
        <div className="flex items-start gap-2 rounded-md border-l-2 border-foreground/40 bg-muted/50 px-3 py-2 text-xs">
          <CornerUpLeft className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-code uppercase tracking-wider text-muted-foreground">
              Replying to {replyTo.sender}
            </p>
            <p className="truncate text-foreground/80">
              {replyTo.deleted_at ? '(deleted)' : replyTo.body || '[image]'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClearReply}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Clear reply"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {pending.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pending.map((p) => (
            <div key={p.id} className="relative h-16 w-16 rounded-md overflow-hidden border border-border">
              <img src={p.previewUrl} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePending(p.id)}
                className="absolute -top-1 -right-1 h-5 w-5 inline-flex items-center justify-center rounded-full bg-foreground text-background"
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {preview && !plainOnly ? (
        <div className="min-h-[40px] rounded-md border border-dashed border-border p-2">
          {body.trim() === '' ? (
            <p className="text-xs text-muted-foreground">Preview…</p>
          ) : (
            <MarkdownView body={body} format={effectiveFormat} className="text-sm" />
          )}
        </div>
      ) : (
        <GrowingTextarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={dragOver ? 'Drop to attach / reply' : `Message as ${sender}…  (⌘/Ctrl + Enter to send)`}
          minRows={1}
          maxRows={8}
          className="text-sm placeholder:text-muted-foreground"
        />
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Attach image"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = '';
            }}
          />

          {!plainOnly && (
            <>
              <div className="ml-1 flex items-center gap-0.5 p-0.5 rounded-md border border-border bg-background text-[10px] font-code uppercase tracking-wider">
                {FORMATS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFormat(f.value)}
                    className={cn(
                      'px-1.5 py-0.5 rounded transition-colors',
                      format === f.value
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setPreview((p) => !p)}
                className="ml-1 text-[10px] font-code uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                {preview ? 'Edit' : 'Preview'}
              </button>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || (body.trim() === '' && pending.length === 0)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-foreground text-background hover:opacity-90 disabled:opacity-40 transition-opacity"
          aria-label="Send"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </form>
  );
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
