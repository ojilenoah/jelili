export type Sender = 'Noah' | 'Jelili';

export type ContentFormat = 'plain' | 'markdown' | 'code' | 'quote';

export interface ChatAttachment {
  id: string;
  message_id: string;
  storage_path: string;
  public_url: string | null;
  file_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  position: number;
  created_at: string;
}

export interface ChatReaction {
  id: string;
  message_id: string;
  sender: Sender;
  emoji: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender: Sender;
  body: string;
  format: ContentFormat;
  reply_to_id: string | null;
  forwarded: boolean;
  edited_at: string | null;
  created_at: string;
  deleted_at: string | null;
  /**
   * Set when Jelili tries to delete a message. The row stays alive;
   * Jelili sees a tombstone in her view, Noah sees the original bubble
   * with a "she tried to delete this" hint.
   */
  delete_attempt_at: string | null;
}

export interface ChatMessageRich extends ChatMessage {
  chat_attachments: ChatAttachment[];
  chat_reactions: ChatReaction[];
}

/**
 * Back-compat alias for the legacy diary route while it still imports
 * the simple `Message` name.
 */
export type Message = ChatMessage;

export interface DiaryEntry {
  id: string;
  author: Sender;
  title: string | null;
  body: string;
  format: ContentFormat;
  card_color: string | null;
  entry_date: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
