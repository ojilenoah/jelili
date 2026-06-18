-- One-off migration: enforce "one reaction per sender per message" at
-- the database level (mirror of the new client behaviour).
--
-- This collapses any existing duplicates (a sender having multiple
-- emojis on the same message) down to the newest one, then swaps the
-- (message_id, sender, emoji) unique constraint for (message_id, sender).
--
-- Paste into the Supabase SQL editor and run once.

-- 1. Collapse duplicates per (message_id, sender) — keep the newest row.
delete from chat_reactions a
using chat_reactions b
where a.message_id = b.message_id
  and a.sender = b.sender
  and a.created_at < b.created_at;

-- 2. Drop whichever auto-named (message_id, sender, emoji) unique
--    constraint Postgres created. Names can vary between projects, so
--    look it up by definition rather than hard-coding.
do $$
declare
  cname text;
begin
  select conname
    into cname
  from pg_constraint
  where conrelid = 'chat_reactions'::regclass
    and contype  = 'u'
    and pg_get_constraintdef(oid) ilike '%(message_id, sender, emoji)%';
  if cname is not null then
    execute format('alter table chat_reactions drop constraint %I', cname);
  end if;
end$$;

-- 3. Add the new, tighter unique.
alter table chat_reactions
  drop constraint if exists chat_reactions_message_id_sender_key;
alter table chat_reactions
  add constraint chat_reactions_message_id_sender_key
  unique (message_id, sender);
