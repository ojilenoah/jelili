-- ============================================================
--  Love-log: Supabase schema
--  Two surfaces:
--    1. diary_entries  - personal cards each of you writes to
--                        yourself, stacked by date, opened in a
--                        modal. Noah = green, Jelili = red.
--    2. chat_messages  - shared WhatsApp-style chat between the
--                        two of you (send / edit / delete /
--                        reply / images / reactions / realtime).
--
--  Paste this whole file into the Supabase SQL editor of a NEW
--  project and run it once. Then drop your URL + anon key into
--  .env.local as:
--    NEXT_PUBLIC_SUPABASE_URL=...
--    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
--  Shared enums
-- ------------------------------------------------------------
do $$ begin
  create type sender_name as enum ('Noah', 'Jelili');
exception when duplicate_object then null; end $$;

do $$ begin
  -- 'plain' = textarea, 'markdown' = rendered md, 'code' = fenced code block,
  -- 'quote' = blockquote-styled card. Add more modes here later.
  create type content_format as enum ('plain', 'markdown', 'code', 'quote');
exception when duplicate_object then null; end $$;


-- ============================================================
--  DIARY ENTRIES
--  Each row is a card on the home page. Author writes it to
--  themselves. Cards are stacked by entry_date desc, then
--  created_at desc, and opened in a modal on click.
-- ============================================================
create table if not exists diary_entries (
  id           uuid primary key default gen_random_uuid(),
  author       sender_name not null,
  title        text,
  body         text not null default '',
  format       content_format not null default 'plain',
  -- Optional per-card color override (hex like '#ff5d5d').
  -- When null, the client uses the author default
  -- (Noah = green, Jelili = red).
  card_color   text,
  -- The date the entry is filed under for the date-stacked feed.
  entry_date   date not null default current_date,
  pinned       boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create index if not exists diary_entries_feed_idx
  on diary_entries (entry_date desc, created_at desc)
  where deleted_at is null;
create index if not exists diary_entries_author_idx
  on diary_entries (author);


-- ============================================================
--  CHAT MESSAGES
--  Shared chat between Noah and Jelili. Soft-deleted so reply
--  quotes do not break and so "deleted for everyone" still shows
--  a tombstone bubble.
-- ============================================================
create table if not exists chat_messages (
  id                 uuid primary key default gen_random_uuid(),
  sender             sender_name not null,
  body               text not null default '',
  format             content_format not null default 'plain',
  -- Drag-to-reply target. ON DELETE SET NULL so a hard-deleted
  -- parent does not nuke the child; soft-delete keeps the ref.
  reply_to_id        uuid references chat_messages(id) on delete set null,
  forwarded          boolean not null default false,
  edited_at          timestamptz,
  created_at         timestamptz not null default now(),
  -- Real soft-delete. Set when Noah deletes; visible as a tombstone
  -- bubble to both parties.
  deleted_at         timestamptz,
  -- Jelili's "fake" delete attempt. The message stays alive; only
  -- Jelili's view tombstones the bubble, and Noah's view shows a
  -- small "she tried to delete this" hint.
  delete_attempt_at  timestamptz
);

-- Pick up the new column on existing projects without losing data.
alter table chat_messages
  add column if not exists delete_attempt_at timestamptz;

create index if not exists chat_messages_feed_idx
  on chat_messages (created_at asc);
create index if not exists chat_messages_sender_idx
  on chat_messages (sender);
create index if not exists chat_messages_reply_to_idx
  on chat_messages (reply_to_id);


-- ============================================================
--  CHAT ATTACHMENTS
--  One row per image/file on a message (a message can carry
--  several, dragged in together). Files live in the
--  'chat-media' storage bucket created at the bottom of this
--  file; storage_path is the key inside that bucket.
-- ============================================================
create table if not exists chat_attachments (
  id            uuid primary key default gen_random_uuid(),
  message_id    uuid not null references chat_messages(id) on delete cascade,
  storage_path  text not null,
  public_url    text,
  file_name     text,
  mime_type     text,
  size_bytes    bigint,
  width         int,
  height        int,
  position      int not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists chat_attachments_message_idx
  on chat_attachments (message_id, position);


-- ============================================================
--  CHAT REACTIONS  (WhatsApp-style emoji reactions)
-- ============================================================
create table if not exists chat_reactions (
  id          uuid primary key default gen_random_uuid(),
  message_id  uuid not null references chat_messages(id) on delete cascade,
  sender      sender_name not null,
  emoji       text not null,
  created_at  timestamptz not null default now(),
  -- One reaction per sender per message; reacting with a different
  -- emoji UPDATEs this row instead of inserting a second.
  unique (message_id, sender)
);

create index if not exists chat_reactions_message_idx
  on chat_reactions (message_id);


-- ============================================================
--  READ STATE  (so the chat can show unread counts / dots)
-- ============================================================
create table if not exists chat_read_state (
  sender        sender_name primary key,
  last_read_at  timestamptz not null default now()
);

insert into chat_read_state (sender, last_read_at)
values ('Noah', now()), ('Jelili', now())
on conflict (sender) do nothing;


-- ============================================================
--  TRIGGERS
-- ============================================================

-- diary: keep updated_at honest
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists diary_entries_set_updated_at on diary_entries;
create trigger diary_entries_set_updated_at
  before update on diary_entries
  for each row execute function set_updated_at();

-- chat: stamp edited_at only when the visible content actually
-- changed (so deleting / reacting does not look like an edit).
create or replace function set_chat_edited_at()
returns trigger
language plpgsql
as $$
begin
  if new.body is distinct from old.body
     or new.format is distinct from old.format then
    new.edited_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists chat_messages_set_edited_at on chat_messages;
create trigger chat_messages_set_edited_at
  before update on chat_messages
  for each row execute function set_chat_edited_at();


-- ============================================================
--  ROW LEVEL SECURITY
--  The app has no Supabase Auth; the "who am I" toggle is
--  client-side. We enable RLS and grant the anon role full
--  access, which mirrors the current trust model. If you ever
--  add real auth, tighten the USING / WITH CHECK clauses to
--  compare against auth.jwt() ->> 'sender' or similar.
-- ============================================================
alter table diary_entries     enable row level security;
alter table chat_messages     enable row level security;
alter table chat_attachments  enable row level security;
alter table chat_reactions    enable row level security;
alter table chat_read_state   enable row level security;

drop policy if exists "diary_entries anon all"    on diary_entries;
drop policy if exists "chat_messages anon all"    on chat_messages;
drop policy if exists "chat_attachments anon all" on chat_attachments;
drop policy if exists "chat_reactions anon all"   on chat_reactions;
drop policy if exists "chat_read_state anon all"  on chat_read_state;

create policy "diary_entries anon all"
  on diary_entries     for all to anon using (true) with check (true);
create policy "chat_messages anon all"
  on chat_messages     for all to anon using (true) with check (true);
create policy "chat_attachments anon all"
  on chat_attachments  for all to anon using (true) with check (true);
create policy "chat_reactions anon all"
  on chat_reactions    for all to anon using (true) with check (true);
create policy "chat_read_state anon all"
  on chat_read_state   for all to anon using (true) with check (true);


-- ============================================================
--  REALTIME
--  REPLICA IDENTITY FULL so UPDATE / DELETE payloads include
--  the old row (needed for edit + delete UX on the client).
-- ============================================================
alter table diary_entries    replica identity full;
alter table chat_messages    replica identity full;
alter table chat_attachments replica identity full;
alter table chat_reactions   replica identity full;
alter table chat_read_state  replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table diary_entries;    exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table chat_messages;    exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table chat_attachments; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table chat_reactions;   exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table chat_read_state;  exception when duplicate_object then null; end;
  end if;
end $$;


-- ============================================================
--  STORAGE BUCKET for chat images / files
-- ============================================================
insert into storage.buckets (id, name, public)
values ('chat-media', 'chat-media', true)
on conflict (id) do nothing;

drop policy if exists "chat-media public read"  on storage.objects;
drop policy if exists "chat-media anon write"   on storage.objects;
drop policy if exists "chat-media anon update"  on storage.objects;
drop policy if exists "chat-media anon delete"  on storage.objects;

create policy "chat-media public read"
  on storage.objects for select
  to public
  using (bucket_id = 'chat-media');

create policy "chat-media anon write"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'chat-media');

create policy "chat-media anon update"
  on storage.objects for update
  to anon
  using (bucket_id = 'chat-media');

create policy "chat-media anon delete"
  on storage.objects for delete
  to anon
  using (bucket_id = 'chat-media');
