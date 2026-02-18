import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function QuestCard() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-4">
      <Card className="frosted-glass border-primary/10 soft-glow shadow-xl rounded-2xl">
        <CardHeader className="items-center pt-8 pb-4">
        </CardHeader>
        <CardContent className="text-center text-primary/80">
          <p className="font-headline text-lg text-primary/90 mb-4">To my Jelili,</p>
          <div className="space-y-4 text-base md:text-lg leading-relaxed font-body">
            <p>
              they say life is a series of connections, but ours feels more like two boomerangs that can’t help but return back to each other. It started with the secret name we gave ourselves, Jellii & Labubu, a language only we understood while the rest of the group was just noise.
            </p>
            <p>
              We’ve navigated everything, even the occasional “shading,” which was really just a cover for my heart beating too fast every time I saw you typing. You are my princess, a first daughter who carries the world on her shoulders but still finds time to get high on those gees 😔🤣 and dream of the perfect ebelebo fruit.
            </p>
            <p>
              I’m your “prisoner” with the unkempt beard, the one who promises to always be the person rooting for you. This is our story. A somewhat messy, sometimes beautiful kind of love that I would choose over and over again.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
