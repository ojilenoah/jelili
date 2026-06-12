'use client';

import { useState, useEffect } from 'react';

export default function QuestCard() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <article className="relative bg-card border border-border rounded-lg px-8 py-10 md:px-12 md:py-14">
      <header className="mb-8 flex items-center justify-between text-xs text-muted-foreground font-code">
        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          <span className="tracking-wide uppercase">A letter</span>
        </div>
        <span suppressHydrationWarning>
          {currentTime ? currentTime.toLocaleString() : ''}
        </span>
      </header>

      <h1 className="font-headline text-2xl md:text-3xl text-foreground mb-6">
        To my Jelili,
      </h1>

      <div className="space-y-5 text-base md:text-lg leading-relaxed text-foreground/85 font-body">
        <p>
          they say life is a series of connections, but ours feels more like two
          boomerangs that can&rsquo;t help but{' '}
          <span className="text-accent">return back to each other</span>. It started
          with the secret name we gave ourselves, <em>Jellii &amp; Labubu</em>, a
          language only we understood while the rest of the group was just noise.
        </p>
        <p>
          We&rsquo;ve navigated everything, even the occasional &ldquo;shading,&rdquo;
          which was really just a cover for my heart beating too fast every time I
          saw you typing. You are my princess, a{' '}
          <span className="text-accent">first daughter</span> who carries the world
          on her shoulders but still finds time to get high on those gees 😔🤣.
        </p>
        <p>
          I&rsquo;m your &ldquo;prisoner&rdquo; with the unkempt beard, the one who
          promises to always be the person{' '}
          <span className="text-accent">rooting for you</span>. This is our story.
          A somewhat messy, sometimes beautiful kind of love that I would choose{' '}
          <em>over and over again</em>.
        </p>
      </div>

      <div className="mt-10 flex items-center gap-3 text-xs text-muted-foreground font-code">
        <span className="h-px flex-1 bg-border" />
        <span>·</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </article>
  );
}
