-- One-off migration to enable realtime on chat_read_state so the
-- read receipts (single tick / double tick) update live for the
-- sender as the recipient marks the conversation as read.
--
-- Paste into the Supabase SQL editor and run once.

alter table chat_read_state replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table chat_read_state;
    exception when duplicate_object then null; end;
  end if;
end $$;
