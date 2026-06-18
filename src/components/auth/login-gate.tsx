'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/sender-context';
import { cn } from '@/lib/utils';

export default function LoginGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { sender, hydrated, login } = useAuth();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [reveal, setReveal] = useState(false);
  // When true, we're between "login accepted" and "router landed on /".
  // Show the same hydration spinner so the previous route never paints.
  const [redirecting, setRedirecting] = useState(false);

  // Clear the redirect flag as soon as the navigation lands.
  useEffect(() => {
    if (redirecting && pathname === '/') setRedirecting(false);
  }, [pathname, redirecting]);

  if (!hydrated || redirecting) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (sender) return <>{children}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = login(value);
    if (!matched) {
      setError('That word does not open the door.');
      return;
    }
    setError(null);
    setValue('');
    // Always land on the diary after logging in. Bridge the route
    // transition with a loader so the previous page never flashes.
    if (pathname !== '/') {
      setRedirecting(true);
      router.push('/');
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm flex flex-col gap-5 rounded-lg border border-border bg-card p-8 animate-card-in"
      >
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-code">
            N&amp;J
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="relative">
            <input
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              type={reveal ? 'text' : 'password'}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              placeholder="a fruit"
              className={cn(
                'w-full rounded-md border bg-background px-3 py-2 pr-10 text-center text-sm outline-none transition-colors',
                error
                  ? 'border-destructive focus:border-destructive'
                  : 'border-border focus:border-foreground'
              )}
            />
            <button
              type="button"
              onClick={() => setReveal((r) => !r)}
              aria-label={reveal ? 'Hide' : 'Show'}
              title={reveal ? 'Hide' : 'Show'}
              className="absolute top-1/2 right-2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && (
            <p className="text-xs text-destructive text-center font-code">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={value.trim() === ''}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-foreground text-sm text-background hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          Enter
        </button>
      </form>
    </main>
  );
}
