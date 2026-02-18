'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function QuestCard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-4">
      <Card className="frosted-glass border-primary/10 soft-glow shadow-xl rounded-2xl">
        <CardHeader className="items-center pt-8 pb-4">
          <div className="w-full max-w-md mx-auto mb-4 p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-primary/10 flex items-center justify-between text-xs font-code">
            <div className="flex items-center gap-2 text-mint-green">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-mint-green"></span>
              </span>
              <span>New Message</span>
            </div>
            <span className="text-foreground/70">{currentTime.toLocaleString()}</span>
          </div>
        </CardHeader>
        <CardContent className="text-center text-primary/80">
          <p className="font-headline text-lg text-primary/90 mb-4">To my Jelili,</p>
          <div className="space-y-4 text-base md:text-lg leading-relaxed font-body">
            <p>
              they say life is a series of connections, but ours feels more like two boomerangs that can’t help but <strong className="text-primary/95">return back to each other</strong>. It started with the secret name we gave ourselves, <em>Jellii & Labubu</em>, a language only we understood while the rest of the group was just noise.
            </p>
            <p>
              We’ve navigated everything, even the occasional “shading,” which was really just a cover for my heart beating too fast every time I saw you typing. You are my princess, a <strong className="text-primary/95">first daughter</strong> who carries the world on her shoulders but still finds time to get high on those gees 😔🤣.
            </p>
            <p>
              I’m your “prisoner” with the unkempt beard, the one who promises to always be the person <strong className="text-primary/95">rooting for you</strong>. This is our story. A somewhat messy, sometimes beautiful kind of love that I would choose <em className="text-primary">over and over again</em>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
