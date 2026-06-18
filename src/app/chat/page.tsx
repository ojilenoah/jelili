'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { supabase } from '@/lib/supabase-client';
import { Skeleton } from '@/components/ui/skeleton';
import PageNav from '@/components/page-nav';
import ChatBubble from '@/components/chat/chat-bubble';
import ChatComposer from '@/components/chat/chat-composer';
import { useChatReadState } from '@/lib/chat-read-state';
import type { ChatAttachment, ChatMessageRich, ChatReaction } from '@/lib/types';

export default function ChatPage() {
  const { otherLastReadAt, markRead } = useChatReadState();
  const [messages, setMessages] = useState<ChatMessageRich[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<ChatMessageRich | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const upsertMessage = useCallback((msg: ChatMessageRich) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === msg.id);
      if (idx === -1) {
        return [...prev, msg].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
      const next = prev.slice();
      // preserve attachments / reactions if the patch lacks them
      next[idx] = {
        ...next[idx],
        ...msg,
        chat_attachments: msg.chat_attachments ?? next[idx].chat_attachments,
        chat_reactions: msg.chat_reactions ?? next[idx].chat_reactions,
      };
      return next;
    });
  }, []);

  const patchMessage = useCallback((id: string, patch: Partial<ChatMessageRich>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const upsertAttachment = useCallback((att: ChatAttachment) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== att.message_id) return m;
        const existing = m.chat_attachments.find((a) => a.id === att.id);
        const next = existing
          ? m.chat_attachments.map((a) => (a.id === att.id ? att : a))
          : [...m.chat_attachments, att];
        return { ...m, chat_attachments: next };
      })
    );
  }, []);

  const upsertReaction = useCallback((r: ChatReaction) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== r.message_id) return m;
        const existing = m.chat_reactions.find((x) => x.id === r.id);
        const next = existing
          ? m.chat_reactions.map((x) => (x.id === r.id ? r : x))
          : [...m.chat_reactions, r];
        return { ...m, chat_reactions: next };
      })
    );
  }, []);

  const removeReaction = useCallback((id: string, messageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, chat_reactions: m.chat_reactions.filter((x) => x.id !== id) }
          : m
      )
    );
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*, chat_attachments(*), chat_reactions(*)')
        .order('created_at', { ascending: true });
      if (!active) return;
      if (error) {
        console.error('Error fetching chat', error);
      } else {
        setMessages((data ?? []) as ChatMessageRich[]);
      }
      setLoading(false);
    })();

    const channel = supabase
      .channel('chat-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new as ChatMessageRich;
            upsertMessage({ ...row, chat_attachments: [], chat_reactions: [] });
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new as ChatMessageRich;
            patchMessage(row.id, row);
          } else if (payload.eventType === 'DELETE') {
            const row = payload.old as ChatMessageRich;
            if (row?.id) {
              setMessages((prev) => prev.filter((m) => m.id !== row.id));
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_attachments' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            upsertAttachment(payload.new as ChatAttachment);
          } else if (payload.eventType === 'DELETE') {
            const row = payload.old as ChatAttachment;
            if (row?.id && row?.message_id) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === row.message_id
                    ? { ...m, chat_attachments: m.chat_attachments.filter((a) => a.id !== row.id) }
                    : m
                )
              );
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_reactions' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            upsertReaction(payload.new as ChatReaction);
          } else if (payload.eventType === 'DELETE') {
            const row = payload.old as ChatReaction;
            if (row?.id && row?.message_id) removeReaction(row.id, row.message_id);
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [upsertMessage, patchMessage, upsertAttachment, upsertReaction, removeReaction]);

  useEffect(() => {
    if (loading) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [loading, messages.length]);

  // Mark the chat as read whenever the page is mounted or new messages
  // arrive from the other side while we're here.
  useEffect(() => {
    if (loading) return;
    void markRead();
  }, [loading, messages.length, markRead]);

  const messageMap = useMemo(() => {
    const m = new Map<string, ChatMessageRich>();
    for (const msg of messages) m.set(msg.id, msg);
    return m;
  }, [messages]);

  // Both parties see real soft-deletes as tombstones. Jelili's
  // "fake" delete attempts are rendered by ChatBubble itself — the row
  // stays in the feed for both senders.
  const visibleMessages = messages;

  const onDropReply = (id: string) => {
    const m = messageMap.get(id);
    if (m) setReplyTo(m);
  };

  const onJumpToMessage = (id: string) => {
    const el = document.getElementById(`msg-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('ring-2', 'ring-foreground/40');
    setTimeout(() => el.classList.remove('ring-2', 'ring-foreground/40'), 1200);
  };

  return (
    <main className="h-screen h-[100dvh] w-full bg-background flex flex-col">
      <header className="flex items-center justify-between gap-3 px-4 md:px-8 py-4 border-b border-border bg-background">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-code">
            Chat
          </p>
          <h1 className="font-headline text-lg md:text-xl text-foreground">
            Just us
          </h1>
        </div>
        <PageNav />
      </header>

      <div className="flex-1 min-h-0">
        <div
          className="mx-auto max-w-3xl h-full px-4 pt-4 flex flex-col gap-4 min-h-0"
          style={{
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
          }}
        >
          <div
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-y-auto no-scrollbar rounded-md border border-border bg-card p-4 md:p-6"
          >
            {loading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-16 w-2/3 rounded-2xl" />
                <Skeleton className="h-16 w-2/3 rounded-2xl self-end" />
                <Skeleton className="h-16 w-1/2 rounded-2xl" />
              </div>
            ) : visibleMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                Nothing here yet. Send the first one.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {visibleMessages.map((m, i) => {
                  const prev = visibleMessages[i - 1];
                  const showDayDivider =
                    !prev || !isSameDay(new Date(prev.created_at), new Date(m.created_at));
                  return (
                    <div key={m.id} className="flex flex-col gap-3">
                      {showDayDivider && (
                        <div className="self-center my-2 px-3 py-0.5 rounded-full bg-muted text-[10px] font-code uppercase tracking-widest text-muted-foreground">
                          {format(new Date(m.created_at), 'EEEE, MMM d')}
                        </div>
                      )}
                      <ChatBubble
                        message={m}
                        replyToMessage={m.reply_to_id ? messageMap.get(m.reply_to_id) ?? null : null}
                        otherLastReadAt={otherLastReadAt}
                        onReply={(target) => setReplyTo(target)}
                        onJumpToMessage={onJumpToMessage}
                        onMessagePatch={patchMessage}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <ChatComposer
            replyTo={replyTo}
            onClearReply={() => setReplyTo(null)}
            onDropReply={onDropReply}
          />
        </div>
      </div>
    </main>
  );
}
