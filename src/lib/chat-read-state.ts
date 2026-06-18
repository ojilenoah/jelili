'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useSender, type Sender } from '@/context/sender-context';

type ReadStateMap = Record<Sender, string | null>;

/**
 * Live mirror of the chat_read_state table for both senders, plus a
 * `markRead` helper to bump the current user's last_read_at to now.
 */
export function useChatReadState() {
  const { sender } = useSender();
  const other: Sender = sender === 'Noah' ? 'Jelili' : 'Noah';
  const [readState, setReadState] = useState<ReadStateMap>({
    Noah: null,
    Jelili: null,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.from('chat_read_state').select('sender, last_read_at');
      if (!active) return;
      const next: ReadStateMap = { Noah: null, Jelili: null };
      for (const row of (data ?? []) as { sender: Sender; last_read_at: string }[]) {
        if (row.sender === 'Noah' || row.sender === 'Jelili') {
          next[row.sender] = row.last_read_at;
        }
      }
      setReadState(next);
    })();

    const channel = supabase
      .channel('chat-read-state-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_read_state' },
        (payload) => {
          const row = (payload.new ?? payload.old) as
            | { sender: Sender; last_read_at: string }
            | undefined;
          if (!row?.sender) return;
          setReadState((prev) => ({ ...prev, [row.sender]: row.last_read_at ?? null }));
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const markRead = useCallback(async () => {
    const nowIso = new Date().toISOString();
    setReadState((prev) => ({ ...prev, [sender]: nowIso }));
    await supabase
      .from('chat_read_state')
      .update({ last_read_at: nowIso })
      .eq('sender', sender);
  }, [sender]);

  return {
    sender,
    other,
    myLastReadAt: readState[sender],
    otherLastReadAt: readState[other],
    markRead,
  };
}

/**
 * Unread count for the current user — messages from the OTHER sender
 * created after my last_read_at, excluding soft-deletes.
 */
export function useChatUnreadCount() {
  const { sender } = useSender();
  const other: Sender = sender === 'Noah' ? 'Jelili' : 'Noah';
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;

    const recount = async () => {
      const { data: rs } = await supabase
        .from('chat_read_state')
        .select('last_read_at')
        .eq('sender', sender)
        .maybeSingle();
      const last = rs?.last_read_at ?? null;

      let query = supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('sender', other)
        .is('deleted_at', null);
      if (last) query = query.gt('created_at', last);
      const { count: c } = await query;
      if (active) setCount(c ?? 0);
    };

    recount();

    const channel = supabase
      .channel(`chat-unread-${sender}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const row = payload.new as { sender: Sender; deleted_at: string | null };
          if (row.sender === other && !row.deleted_at) {
            setCount((c) => c + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_read_state',
          filter: `sender=eq.${sender}`,
        },
        () => {
          void recount();
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [sender, other]);

  return count;
}
