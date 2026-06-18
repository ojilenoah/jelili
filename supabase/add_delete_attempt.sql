-- One-off migration: track Jelili's "fake" delete attempts separately
-- from real soft-deletes.
--
-- Behaviour:
--   * Noah deletes  -> set deleted_at        (real soft-delete; both see
--                                             a tombstone bubble).
--   * Jelili deletes -> set delete_attempt_at (Jelili's view tombstones;
--                                              Noah keeps the original
--                                              bubble with a "she tried
--                                              to delete this" hint).
--
-- Paste into the Supabase SQL editor and run once.

alter table chat_messages
  add column if not exists delete_attempt_at timestamptz;
