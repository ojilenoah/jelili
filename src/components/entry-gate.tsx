"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface EntryGateProps {
  unlocked: boolean;
  onUnlock: (sender: 'Noah' | 'Jelili') => void;
  hidden: boolean;
}

export default function EntryGate({ unlocked, onUnlock, hidden }: EntryGateProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(false);
  const { toast } = useToast();

  const handleCheck = () => {
    const lowerCaseInput = inputValue.toLowerCase();
    if (lowerCaseInput === 'ebelebo') {
      setError(false);
      onUnlock('Jelili');
    } else if (lowerCaseInput === 'constantine') {
      setError(false);
      onUnlock('Noah');
    } else {
      setError(true);
      toast({
        title: "Incorrect Password",
        description: "That's not the one. Try again.",
        variant: "destructive",
      });
      setInputValue('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleCheck();
    }
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-1000',
        unlocked ? 'opacity-0' : 'opacity-100',
        hidden ? 'pointer-events-none' : 'pointer-events-auto'
      )}
    >
      <div className="flex flex-col items-center gap-6 p-8 rounded-lg">
        <h1 className="font-headline text-3xl md:text-5xl text-primary drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
          Who are you?
        </h1>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="password"
            placeholder="Password"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              if(error) setError(false);
            }}
            onKeyDown={handleKeyDown}
            className={cn(
                "h-12 text-center text-lg font-headline tracking-widest focus:text-primary transition-all duration-300",
                error ? "border-destructive ring-destructive ring-2" : "focus:ring-primary"
            )}
            autoFocus
          />
          <Button 
            onClick={handleCheck} 
            className="h-12 text-lg font-headline transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
            variant="default"
          >
            Enter
          </Button>
        </div>
      </div>
    </div>
  );
}
