import React from 'react';

export interface Note {
  id: number;
  text: string;
  Icon: string;
  position: { top: string; left: string };
  color: string;
}

const noteColors = [
  'bg-red-500/5', 'bg-green-500/5', 'bg-blue-500/5', 'bg-yellow-500/5', 
  'bg-purple-500/5', 'bg-pink-500/5', 'bg-indigo-500/5', 'bg-teal-500/5',
  'bg-red-500/5', 'bg-green-500/5', 'bg-blue-500/5', 'bg-yellow-500/5', 
  'bg-purple-500/5', 'bg-pink-500/5', 'bg-indigo-500/5', 'bg-teal-500/5',
  'bg-red-500/5', 'bg-green-500/5', 'bg-blue-500/5', 'bg-yellow-500/5',
];

const fruitIcons = ['🍓', '🍇', '🍉', '🍊', '🍋', '🍌', '🍍', '🍎', '🍏', '🍐', '🍑', '🍒', '🥝', '🥑', '🥥', '🥭', '🫐', '🍈', '🍓', '🍇'];

const positions = [
    { top: '8%', left: '10%' },
    { top: '10%', left: '90%' },
    { top: '92%', left: '8%' },
    { top: '90%', left: '92%' },
    { top: '25%', left: '6%' },
    { top: '28%', left: '94%' },
    { top: '75%', left: '5%' },
    { top: '72%', left: '95%' },
    { top: '5%', left: '30%' },
    { top: '6%', left: '70%' },
    { top: '95%', left: '33%' },
    { top: '94%', left: '67%' },
    { top: '50%', left: '4%' },
    { top: '48%', left: '96%' },
    { top: '4%', left: '50%' },
    { top: '96%', left: '50%' },
    { top: '15%', left: '22%' },
    { top: '18%', left: '78%' },
    { top: '85%', left: '25%' },
    { top: '82%', left: '75%' },
];

export const notes: Note[] = [
  {
    id: 1,
    text: 'You gave me the name Labubu so our connection would be a private world that only we understood in the middle of all that noise.',
    Icon: fruitIcons[0],
    position: positions[0],
    color: noteColors[0]
  },
  {
    id: 2,
    text: 'Your mix of “tough love” and tenderness melts my heart like a candle when it’s just us.',
    Icon: fruitIcons[1],
    position: positions[1],
    color: noteColors[1]
  },
  {
    id: 3,
    text: 'Whether you’re cooking in bulk for others or just boiling a simple pot of spaghetti for yourself, I know your heart is always the main ingredient.',
    Icon: fruitIcons[2],
    position: positions[2],
    color: noteColors[2]
  },
  {
    id: 4,
    text: 'Even when your stomach says no, you still want zobo 💀, and I love how you’d risk the burning sensation just for a sour sip.',
    Icon: fruitIcons[3],
    position: positions[3],
    color: noteColors[3]
  },
  {
    id: 5,
    text: 'We aren’t just in love; we are “finished” people, helplessly and shamelessly (yes, you said that 😳) choosing each other every single day.',
    Icon: fruitIcons[4],
    position: positions[4],
    color: noteColors[4]
  },
  {
    id: 6,
    text: 'I love how you protect me in public, even when you’re playfully “dragging” me for the world to see.',
    Icon: fruitIcons[5],
    position: positions[5],
    color: noteColors[5]
  },
  {
    id: 7,
    text: 'I hate seeing you in pain, but I admire how you fight through it with Omeprazole and sheer willpower, even when fried beans are tempting.',
    Icon: fruitIcons[6],
    position: positions[6],
    color: noteColors[6]
  },
  {
    id: 8,
    text: 'You call me a Software Guru, but the only reason I think I’m a guru is because I somehow figured out the path to your heart.',
    Icon: fruitIcons[7],
    position: positions[7],
    color: noteColors[7]
  },
  {
    id: 9,
    text: 'We made a deal, 1 to 10. You did your three, so I owe you thirty. I still owe you a hundred.',
    Icon: fruitIcons[8],
    position: positions[8],
    color: noteColors[8]
  },
  {
    id: 10,
    text: 'The day your heart couldn’t settle until you unblocked me was the day our real story truly began.',
    Icon: fruitIcons[9],
    position: positions[9],
    color: noteColors[9]
  },
  {
    id: 11,
    text: 'You might claim you can’t dance, but the way you move to Shallipopi tells a beautiful “water water” story I could watch for hours 💀.',
    Icon: fruitIcons[10],
    position: positions[10],
    color: noteColors[10]
  },
  {
    id: 12,
    text: 'We played games with aliases and masks, but you always had the conviction that I was the friend behind the screen. Silentwin 💀',
    Icon: fruitIcons[11],
    position: positions[11],
    color: noteColors[11]
  },
  {
    id: 13,
    text: 'The hours we spend staring at each other when the world is finally quiet are the moments where I truly see you.',
    Icon: fruitIcons[12],
    position: positions[12],
    color: noteColors[12]
  },
  {
    id: 14,
    text: 'You’re a gangster in the group chat, but you’re my shy baby girl the moment we’re alone. Why are you shy on a voice note? 😭😭😭',
    Icon: fruitIcons[13],
    position: positions[13],
    color: noteColors[13]
  },
  {
    id: 15,
    text: 'Thank you for trusting me with your darkest chapters. It only makes me respect your strength more as we write a brighter one together.',
    Icon: fruitIcons[14],
    position: positions[14],
    color: noteColors[14]
  },
  {
    id: 16,
    text: 'You told me you’d choose me over and over again, and I’ve spent every day since trying to be worthy of that choice.',
    Icon: fruitIcons[15],
    position: positions[15],
    color: noteColors[15]
  },
  {
    id: 17,
    text: 'Our secret language will always feel louder than any room full of noise.',
    Icon: fruitIcons[16],
    position: positions[16],
    color: noteColors[16]
  },
  {
    id: 18,
    text: 'Even in silence, I feel you choosing me.',
    Icon: fruitIcons[17],
    position: positions[17],
    color: noteColors[17]
  },
  {
    id: 19,
    text: 'We are chaos and calm at the same time, and somehow it works.',
    Icon: fruitIcons[18],
    position: positions[18],
    color: noteColors[18]
  },
  {
    id: 20,
    text: 'If I had to do this life again, I would still find my way back to you.',
    Icon: fruitIcons[19],
    position: positions[19],
    color: noteColors[19]
  },
];
