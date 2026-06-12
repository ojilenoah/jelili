export type Sender = 'Noah' | 'Jelili';

export type ContentFormat = 'plain' | 'markdown' | 'code' | 'quote';

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
}

/**
 * Back-compat alias. The existing diary route renders a chat view that
 * was built against the old `messages` table (id:number, text:string).
 * New code should prefer `ChatMessage`.
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
