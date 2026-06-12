'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { supabase } from '@/lib/supabase-client';
import { Skeleton } from '@/components/ui/skeleton';
import SenderToggle from '@/components/diary/sender-toggle';
import DiaryComposer from '@/components/diary/diary-composer';
import DiaryCard from '@/components/diary/diary-card';
import DiaryModal from '@/components/diary/diary-modal';
import type { DiaryEntry } from '@/lib/types';

function dateLabel(iso: string) {
  const d = parseISO(iso);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'EEEE, MMMM d');
}

export default function HomePage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const upsert = useCallback((entry: DiaryEntry) => {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === entry.id);
      if (idx === -1) return [entry, ...prev];
      const next = prev.slice();
      next[idx] = entry;
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .is('deleted_at', null)
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false });
      if (!active) return;
      if (error) {
        console.error('Error fetching diary entries', error);
      } else {
        setEntries((data ?? []) as DiaryEntry[]);
      }
      setLoading(false);
    })();

    const channel = supabase
      .channel('diary-entries-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'diary_entries' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const row = payload.new as DiaryEntry;
            if (row.deleted_at) remove(row.id);
            else upsert(row);
          } else if (payload.eventType === 'DELETE') {
            const row = payload.old as DiaryEntry;
            if (row?.id) remove(row.id);
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [upsert, remove]);

  const grouped = useMemo(() => {
    const pinned = entries.filter((e) => e.pinned);
    const rest = entries.filter((e) => !e.pinned);
    const byDate = new Map<string, DiaryEntry[]>();
    for (const e of rest) {
      const list = byDate.get(e.entry_date) ?? [];
      list.push(e);
      byDate.set(e.entry_date, list);
    }
    const ordered = Array.from(byDate.entries()).sort(([a], [b]) => (a < b ? 1 : -1));
    return { pinned, ordered };
  }, [entries]);

  const openEntry = entries.find((e) => e.id === openId) ?? null;

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-16 pb-32 flex flex-col gap-8">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-code">
              Diary
            </p>
            <h1 className="font-headline text-2xl md:text-3xl text-foreground mt-1">
              Notes to ourselves
            </h1>
          </div>
          <SenderToggle />
        </header>

        <DiaryComposer onEntryCreated={upsert} />

        {loading ? (
          <div className="grid gap-3 md:grid-cols-2">
            <Skeleton className="h-32 rounded-md" />
            <Skeleton className="h-32 rounded-md" />
            <Skeleton className="h-32 rounded-md" />
            <Skeleton className="h-32 rounded-md" />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            Nothing here yet. Write the first one.
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            {grouped.pinned.length > 0 && (
              <section>
                <h2 className="text-[10px] uppercase tracking-widest font-code text-muted-foreground mb-3">
                  Pinned
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {grouped.pinned.map((e) => (
                    <DiaryCard key={e.id} entry={e} onOpen={() => setOpenId(e.id)} />
                  ))}
                </div>
              </section>
            )}

            {grouped.ordered.map(([date, dayEntries]) => (
              <section key={date}>
                <h2 className="text-[10px] uppercase tracking-widest font-code text-muted-foreground mb-3 sticky top-0 bg-background py-1 z-10">
                  {dateLabel(date)}
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {dayEntries.map((e) => (
                    <DiaryCard key={e.id} entry={e} onOpen={() => setOpenId(e.id)} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {openEntry && (
        <DiaryModal
          entry={openEntry}
          onClose={() => setOpenId(null)}
          onUpdated={upsert}
          onDeleted={remove}
        />
      )}
    </main>
  );
}
