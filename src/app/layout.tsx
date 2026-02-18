import type { Metadata } from 'next';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AppInitializer } from '@/app/app-initializer';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { SenderProvider } from '@/context/sender-context';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'Boomerang Hearts',
  description: 'A somewhat messy, sometimes beautiful kind of love.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${jetbrainsMono.variable} ${spaceGrotesk.variable} font-body antialiased bg-background text-foreground`}>
        <FirebaseClientProvider>
          <SenderProvider>
            <AppInitializer>
              {children}
            </AppInitializer>
          </SenderProvider>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
