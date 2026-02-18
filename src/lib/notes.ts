import React from 'react';

export interface Note {
  id: number;
  text: string;
  Icon: React.ElementType;
  position: { top: string; left: string };
  animation: 'pulse' | 'jitter' | 'glow';
  size: string;
  color: string;
}

const noteColors = [
  'bg-red-500/5', 'bg-green-500/5', 'bg-blue-500/5', 'bg-yellow-500/5', 
  'bg-purple-500/5', 'bg-pink-500/5', 'bg-indigo-500/5', 'bg-teal-500/5',
  'bg-red-500/5', 'bg-green-500/5', 'bg-blue-500/5', 'bg-yellow-500/5', 
  'bg-purple-500/5', 'bg-pink-500/5', 'bg-indigo-500/5', 'bg-teal-500/5',
  'bg-red-500/5', 'bg-green-500/5', 'bg-blue-500/5', 'bg-yellow-500/5',
];

export const notes: Note[] = [
  {
    id: 1,
    text: 'You gave me the name Labubu so our connection would be a private world that only we understood in the middle of all that noise.',
    Icon: (props) => React.createElement('div', props, '🤫'),
    position: { top: '15%', left: '10%' },
    animation: 'pulse',
    size: '48px',
    color: noteColors[0]
  },
  {
    id: 2,
    text: 'Your mix of “tough love” and tenderness melts my heart like a candle when it’s just us.',
    Icon: (props) => React.createElement('div', props, '🔥'),
    position: { top: '30%', left: '90%' },
    animation: 'glow',
    size: '36px',
    color: noteColors[1]
  },
  {
    id: 3,
    text: 'Whether you’re cooking in bulk for others or just boiling a simple pot of spaghetti for yourself, I know your heart is always the main ingredient.',
    Icon: (props) => React.createElement('div', props, '❤️'),
    position: { top: '80%', left: '20%' },
    animation: 'pulse',
    size: '40px',
    color: noteColors[2]
  },
  {
    id: 4,
    text: 'Even when your stomach says no, you still want zobo 💀, and I love how you’d risk the burning sensation just for a sour sip.',
    Icon: (props) => React.createElement('div', props, '🍓'),
    position: { top: '65%', left: '85%' },
    animation: 'jitter',
    size: '32px',
    color: noteColors[3]
  },
  {
    id: 5,
    text: 'We aren’t just in love; we are “finished” people, helplessly and shamelessly (yes, you said that 😳) choosing each other every single day.',
    Icon: (props) => React.createElement('div', props, '♾️'),
    position: { top: '10%', left: '80%' },
    animation: 'glow',
    size: '44px',
    color: noteColors[4]
  },
  {
    id: 6,
    text: 'I love how you protect me in public, even when you’re playfully “dragging” me for the world to see.',
    Icon: (props) => React.createElement('div', props, '👑'),
    position: { top: '90%', left: '5%' },
    animation: 'pulse',
    size: '38px',
    color: noteColors[5]
  },
  {
    id: 7,
    text: 'I hate seeing you in pain, but I admire how you fight through it with Omeprazole and sheer willpower, even when fried beans are tempting.',
    Icon: (props) => React.createElement('div', props, '❤️'),
    position: { top: '5%', left: '40%' },
    animation: 'jitter',
    size: '28px',
    color: noteColors[6]
  },
  {
    id: 8,
    text: 'You call me a Software Guru, but the only reason I think I’m a guru is because I somehow figured out the path to your heart.',
    Icon: (props) => React.createElement('div', props, '💻'),
    position: { top: '95%', left: '95%' },
    animation: 'glow',
    size: '36px',
    color: noteColors[7]
  },
  {
    id: 9,
    text: 'We made a deal, 1 to 10. You did your three, so I owe you thirty. I still owe you a hundred.',
    Icon: (props) => React.createElement('div', props, '💬'),
    position: { top: '40%', left: '5%' },
    animation: 'jitter',
    size: '30px',
    color: noteColors[8]
  },
  {
    id: 10,
    text: 'The day your heart couldn’t settle until you unblocked me was the day our real story truly began.',
    Icon: (props) => React.createElement('div', props, '❤️'),
    position: { top: '20%', left: '75%' },
    animation: 'pulse',
    size: '34px',
    color: noteColors[9]
  },
  {
    id: 11,
    text: 'You might claim you can’t dance, but the way you move to Shallipopi tells a beautiful “water water” story I could watch for hours 💀.',
    Icon: (props) => React.createElement('div', props, '🎵'),
    position: { top: '85%', left: '70%' },
    animation: 'jitter',
    size: '42px',
    color: noteColors[10]
  },
  {
    id: 12,
    text: 'We played games with aliases and masks, but you always had the conviction that I was the friend behind the screen. Silentwin 💀',
    Icon: (props) => React.createElement('div', props, '🎭'),
    position: { top: '10%', left: '60%' },
    animation: 'glow',
    size: '30px',
    color: noteColors[11]
  },
  {
    id: 13,
    text: 'The hours we spend staring at each other when the world is finally quiet are the moments where I truly see you.',
    Icon: (props) => React.createElement('div', props, '💬'),
    position: { top: '60%', left: '15%' },
    animation: 'pulse',
    size: '38px',
    color: noteColors[12]
  },
  {
    id: 14,
    text: 'You’re a gangster in the group chat, but you’re my shy baby girl the moment we’re alone. Why are you shy on a voice note? 😭😭😭',
    Icon: (props) => React.createElement('div', props, '🎵'),
    position: { top: '5%', left: '25%' },
    animation: 'jitter',
    size: '32px',
    color: noteColors[13]
  },
  {
    id: 15,
    text: 'Thank you for trusting me with your darkest chapters. It only makes me respect your strength more as we write a brighter one together.',
    Icon: (props) => React.createElement('div', props, '❤️'),
    position: { top: '90%', left: '40%' },
    animation: 'glow',
    size: '26px',
    color: noteColors[14]
  },
  {
    id: 16,
    text: 'You told me you’d choose me over and over again, and I’ve spent every day since trying to be worthy of that choice.',
    Icon: (props) => React.createElement('div', props, '♾️'),
    position: { top: '35%', left: '30%' },
    animation: 'pulse',
    size: '30px',
    color: noteColors[15]
  },
  {
    id: 17,
    text: 'Our secret language will always feel louder than any room full of noise.',
    Icon: (props) => React.createElement('div', props, '💬'),
    position: { top: '45%', left: '70%' },
    animation: 'jitter',
    size: '28px',
    color: noteColors[16]
  },
  {
    id: 18,
    text: 'Even in silence, I feel you choosing me.',
    Icon: (props) => React.createElement('div', props, '❤️'),
    position: { top: '70%', left: '45%' },
    animation: 'pulse',
    size: '22px',
    color: noteColors[17]
  },
  {
    id: 19,
    text: 'We are chaos and calm at the same time, and somehow it works.',
    Icon: (props) => React.createElement('div', props, '🔥'),
    position: { top: '25%', left: '55%' },
    animation: 'glow',
    size: '24px',
    color: noteColors[18]
  },
  {
    id: 20,
    text: 'If I had to do this life again, I would still find my way back to you.',
    Icon: (props) => React.createElement('div', props, '♾️'),
    position: { top: '75%', left: '95%' },
    animation: 'pulse',
    size: '36px',
    color: noteColors[19]
  },
];
