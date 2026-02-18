import { Timestamp } from 'firebase/firestore';

export interface Message {
  id: string;
  text: string;
  sender: 'Noah' | 'Jelili';
  createdAt: Timestamp;
}
