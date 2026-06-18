'use client';

import { useRef, useState } from 'react';
import { format } from 'date-fns';
import {
  Pencil,
  Trash2,
  CornerUpLeft,
  Loader2,
  X,
  Check,
  CheckCheck,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase-client';
import { useSender } from '@/context/sender-context';
import { useToast } from '@/hooks/use-toast';
import MarkdownView from '@/components/markdown-view';
import GrowingTextarea from '@/components/growing-textarea';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import type { ChatMessageRich, ContentFormat } from '@/lib/types';

const QUICK_REACTIONS = ['❤️', '😂', '😭', '😍', '🔥', '👍', '👎', '🙏'];

const FORMATS: { value: ContentFormat; label: string }[] = [
  { value: 'plain', label: 'Plain' },
  { value: 'markdown', label: 'MD' },
  { value: 'code', label: 'Code' },
  { value: 'quote', label: 'Quote' },
];

interface ChatBubbleProps {
  message: ChatMessageRich;
  replyToMessage: ChatMessageRich | null;
  otherLastReadAt: string | null;
  onReply: (message: ChatMessageRich) => void;
  onJumpToMessage: (id: string) => void;
  /**
   * Optimistic patch into the parent's message list — used so the
   * actor sees their delete reflect instantly instead of waiting for
   * the Supabase realtime round-trip.
   */
  onMessagePatch?: (id: string, patch: Partial<ChatMessageRich>) => void;
}

export default function ChatBubble({
  message,
  replyToMessage,
  otherLastReadAt,
  onReply,
  onJumpToMessage,
  onMessagePatch,
}: ChatBubbleProps) {
  const { sender } = useSender();
  const { toast } = useToast();
  const plainOnly = sender === 'Jelili';
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(message.body);
  const [editFormat, setEditFormat] = useState<ContentFormat>(message.format);
  const [busy, setBusy] = useState(false);
  // The emoji of *my* reaction the user is currently editing (the popover
  // is anchored to that pill).
  const [editingEmoji, setEditingEmoji] = useState<string | null>(null);
  // Context menu open state — triggered by right-click on desktop or
  // long-press on touch. Radix positions the menu relative to the bubble.
  const [menuOpen, setMenuOpen] = useState(false);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelLongPress = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const startLongPress = () => {
    if (isDeletedForLongPress() || editing) return;
    cancelLongPress();
    pressTimerRef.current = setTimeout(() => {
      setMenuOpen(true);
      pressTimerRef.current = null;
    }, 450);
  };

  // Helper inside startLongPress; declared as a function so the closure
  // captures the freshest values from the render.
  function isDeletedForLongPress() {
    return (
      !!message.deleted_at ||
      (sender === 'Jelili' && !!message.delete_attempt_at)
    );
  }

  const isMine = message.sender === sender;
  const isNoah = message.sender === 'Noah';
  const isReallyDeleted = !!message.deleted_at;
  const isAttempted = !!message.delete_attempt_at;
  // Jelili sees her own delete-attempt as a tombstone too. Noah only
  // sees the tombstone for real (deleted_at) deletes.
  const isDeleted = isReallyDeleted || (sender === 'Jelili' && isAttempted);
  const showAttemptHint = sender === 'Noah' && isAttempted && !isReallyDeleted;

  const renderFormat: ContentFormat =
    message.format === 'plain' ? 'markdown' : message.format;

  const bubbleTone = isNoah
    ? 'bg-card border-foreground/60'
    : 'bg-card border-rose-500/60';

  const grouped = groupReactions(message.chat_reactions, sender);
  const seenByOther =
    isMine &&
    !isDeleted &&
    otherLastReadAt !== null &&
    new Date(message.created_at).getTime() <= new Date(otherLastReadAt).getTime();

  const toggleReaction = async (emoji: string) => {
    const existing = message.chat_reactions.find((r) => r.sender === sender && r.emoji === emoji);
    if (existing) {
      await supabase.from('chat_reactions').delete().eq('id', existing.id);
    } else {
      const { error } = await supabase
        .from('chat_reactions')
        .insert([{ message_id: message.id, sender, emoji }]);
      if (error)
        toast({ title: 'Could not react', description: error.message, variant: 'destructive' });
    }
  };

  // Change one of my own reactions to a different emoji (or remove it
  // when the picked emoji matches what's already there). Picking an
  // emoji I have *elsewhere* on this message just collapses the two
  // into one (delete the edited row).
  const changeMyReaction = async (oldEmoji: string, newEmoji: string) => {
    setEditingEmoji(null);
    if (oldEmoji === newEmoji) {
      const mine = message.chat_reactions.find(
        (r) => r.sender === sender && r.emoji === oldEmoji
      );
      if (mine) await supabase.from('chat_reactions').delete().eq('id', mine.id);
      return;
    }
    const mine = message.chat_reactions.find(
      (r) => r.sender === sender && r.emoji === oldEmoji
    );
    if (!mine) return;
    const conflict = message.chat_reactions.some(
      (r) => r.sender === sender && r.emoji === newEmoji
    );
    if (conflict) {
      await supabase.from('chat_reactions').delete().eq('id', mine.id);
      return;
    }
    const { error } = await supabase
      .from('chat_reactions')
      .update({ emoji: newEmoji })
      .eq('id', mine.id);
    if (error)
      toast({ title: 'Could not change reaction', description: error.message, variant: 'destructive' });
  };

  const onPillClick = (emoji: string, byMe: boolean) => {
    if (byMe) {
      setEditingEmoji((cur) => (cur === emoji ? null : emoji));
    } else {
      // Joining someone else's reaction adds mine with the same emoji.
      void toggleReaction(emoji);
    }
  };

  const saveEdit = async () => {
    if (busy) return;
    setBusy(true);
    const { error } = await supabase
      .from('chat_messages')
      .update({ body: editBody, format: plainOnly ? 'plain' : editFormat })
      .eq('id', message.id);
    setBusy(false);
    if (error) {
      toast({ title: 'Could not edit', description: error.message, variant: 'destructive' });
      return;
    }
    setEditing(false);
  };

  const remove = async () => {
    if (busy) return;
    if (!confirm('Delete this message?')) return;
    setBusy(true);
    // Jelili's delete is a fake-out — only stamps delete_attempt_at, the
    // row stays alive. Noah's delete is a real soft-delete.
    const nowIso = new Date().toISOString();
    const patch: Partial<ChatMessageRich> =
      sender === 'Jelili' ? { delete_attempt_at: nowIso } : { deleted_at: nowIso };

    // Optimistic — don't wait for realtime to bounce the change back.
    onMessagePatch?.(message.id, patch);

    const { error } = await supabase
      .from('chat_messages')
      .update(patch)
      .eq('id', message.id);
    setBusy(false);
    if (error) {
      // Roll back the optimistic patch.
      const rollback: Partial<ChatMessageRich> =
        sender === 'Jelili' ? { delete_attempt_at: null } : { deleted_at: null };
      onMessagePatch?.(message.id, rollback);
      toast({ title: 'Could not delete', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div
      id={`msg-${message.id}`}
      className={cn(
        'group flex flex-col gap-1 min-w-0 max-w-[85%] md:max-w-[70%]',
        isMine ? 'self-end items-end' : 'self-start items-start'
      )}
    >
      <span className="px-2 text-[10px] uppercase tracking-widest text-muted-foreground font-code">
        {message.sender}
      </span>

      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverAnchor asChild>
          <div
            draggable={!isDeleted && !editing}
            onDragStart={(e) => {
              e.dataTransfer.setData('application/x-chat-message-id', message.id);
              e.dataTransfer.effectAllowed = 'copy';
            }}
            onContextMenu={(e) => {
              if (isDeleted || editing) return;
              e.preventDefault();
              setMenuOpen(true);
            }}
            onTouchStart={startLongPress}
            onTouchEnd={cancelLongPress}
            onTouchMove={cancelLongPress}
            onTouchCancel={cancelLongPress}
            style={{ WebkitTouchCallout: 'none', WebkitUserSelect: menuOpen ? 'none' : undefined }}
            className={cn(
              'relative w-full min-w-0 overflow-hidden rounded-2xl border-2 px-3 py-2 text-sm shadow-sm [overflow-wrap:anywhere] select-none md:select-text',
              isDeleted
                ? 'bg-muted border-border text-muted-foreground italic'
                : bubbleTone,
              showAttemptHint && 'opacity-70',
              !isDeleted && !editing && 'cursor-grab active:cursor-grabbing'
            )}
          >
        {replyToMessage && !isDeleted && (
          <button
            type="button"
            onClick={() => onJumpToMessage(replyToMessage.id)}
            className="mb-2 flex w-full items-start gap-2 rounded-md border-l-2 border-foreground/40 bg-background/60 px-2 py-1.5 text-left text-xs hover:bg-background"
          >
            <CornerUpLeft className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-code uppercase tracking-wider text-muted-foreground">
                {replyToMessage.sender}
              </p>
              <p className="truncate text-foreground/80">
                {replyToMessage.deleted_at ||
                (sender === 'Jelili' && replyToMessage.delete_attempt_at)
                  ? '(deleted)'
                  : replyToMessage.body || '[image]'}
              </p>
            </div>
          </button>
        )}

        {message.chat_attachments && message.chat_attachments.length > 0 && !isDeleted && (
          <div
            className={cn(
              'mb-2 grid gap-1.5',
              message.chat_attachments.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            )}
          >
            {message.chat_attachments
              .slice()
              .sort((a, b) => a.position - b.position)
              .map((att) => (
                <a
                  key={att.id}
                  href={att.public_url ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-md overflow-hidden border border-border"
                >
                  <img
                    src={att.public_url ?? ''}
                    alt={att.file_name ?? ''}
                    className="w-full h-auto max-h-80 object-cover"
                    draggable={false}
                  />
                </a>
              ))}
          </div>
        )}

        {isDeleted ? (
          <p>This message was deleted</p>
        ) : editing ? (
          <div className="flex flex-col gap-2 min-w-[240px]">
            <GrowingTextarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              minRows={2}
              maxRows={10}
              className="rounded-md border border-border bg-background p-2 text-sm"
            />
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {!plainOnly ? (
                <div className="flex items-center gap-0.5 p-0.5 rounded-md border border-border bg-background text-[10px] font-code uppercase tracking-wider">
                  {FORMATS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setEditFormat(f.value)}
                      className={cn(
                        'px-1.5 py-0.5 rounded transition-colors',
                        editFormat === f.value
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
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setEditBody(message.body);
                    setEditFormat(message.format);
                  }}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                  aria-label="Cancel"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={busy || editBody.trim() === ''}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background disabled:opacity-40"
                  aria-label="Save"
                >
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <MarkdownView body={message.body} format={renderFormat} className="text-sm" />
        )}
          </div>
        </PopoverAnchor>
        <PopoverContent
          align={isMine ? 'end' : 'start'}
          side="top"
          sideOffset={6}
          className="w-auto min-w-[180px] p-1"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {!isDeleted && (
            <div className="flex gap-0.5 px-1 py-1 border-b border-border mb-1">
              {QUICK_REACTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => {
                    void toggleReaction(e);
                    setMenuOpen(false);
                  }}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-muted text-base"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
          {!isDeleted && (
            <button
              type="button"
              onClick={() => {
                onReply(message);
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted"
            >
              <CornerUpLeft className="h-4 w-4" />
              Reply
            </button>
          )}
          {isMine && !isDeleted && (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void remove();
                }}
                className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </>
          )}
          {isDeleted && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              No actions available.
            </div>
          )}
        </PopoverContent>
      </Popover>

      {grouped.length > 0 && !isDeleted && (
        <div className="flex flex-wrap gap-1 px-1">
          {grouped.map((g) => (
            <div key={g.emoji} className="relative">
              <button
                type="button"
                onClick={() => onPillClick(g.emoji, g.byMe)}
                title={g.byMe ? 'Tap to change your reaction' : 'Tap to react with this too'}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] transition-colors',
                  g.byMe
                    ? 'bg-foreground/10 border-foreground/40 hover:bg-foreground/15'
                    : 'bg-card border-border hover:bg-muted'
                )}
              >
                <span>{g.emoji}</span>
                <span className="font-code text-muted-foreground">{g.count}</span>
              </button>
              {editingEmoji === g.emoji && g.byMe && (
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-20 flex gap-0.5 rounded-full border border-border bg-card p-1 shadow-sm">
                  {QUICK_REACTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => changeMyReaction(g.emoji, e)}
                      title={e === g.emoji ? 'Remove' : `Change to ${e}`}
                      className={cn(
                        'h-7 w-7 inline-flex items-center justify-center rounded-full hover:bg-muted text-base',
                        e === g.emoji && 'ring-1 ring-foreground/40'
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 px-2 text-[10px] text-muted-foreground font-code">
        <span>{format(new Date(message.created_at), 'p')}</span>
        {message.edited_at && !isDeleted && <span>· edited</span>}
        {showAttemptHint && (
          <span
            className="inline-flex items-center gap-1 italic text-rose-500"
            title="Jelili tried to delete this — visible only to you"
          >
            <EyeOff className="h-3 w-3" />
            she tried to delete this
          </span>
        )}
        {isMine && !isDeleted && (
          <span
            className={cn('inline-flex items-center', seenByOther && 'text-emerald-500')}
            title={seenByOther ? 'Seen' : 'Sent'}
            aria-label={seenByOther ? 'Seen' : 'Sent'}
          >
            {seenByOther ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
          </span>
        )}
      </div>
    </div>
  );
}

function groupReactions(
  reactions: ChatMessageRich['chat_reactions'],
  me: ChatMessageRich['sender']
) {
  const map = new Map<string, { emoji: string; count: number; byMe: boolean }>();
  for (const r of reactions) {
    const cur = map.get(r.emoji) ?? { emoji: r.emoji, count: 0, byMe: false };
    cur.count += 1;
    if (r.sender === me) cur.byMe = true;
    map.set(r.emoji, cur);
  }
  return Array.from(map.values());
}
