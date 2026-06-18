import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AppInitializer } from '@/app/app-initializer';
import { Toaster } from '@/components/ui/toaster';
import { SenderProvider } from '@/context/sender-context';
import { ThemeProvider } from '@/context/theme-context';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'N&J',
  description: 'A somewhat messy, sometimes beautiful kind of love.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // When the on-screen keyboard appears, shrink the layout viewport
  // instead of letting it overlay fixed/absolute content. Without this,
  // the floating composer + chat input get hidden behind the keyboard
  // on mobile.
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var m = localStorage.getItem('theme-mode');
                var isDark =
                  m === 'dark' ||
                  ((m === 'system' || !m) &&
                    window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${jetbrainsMono.variable} ${spaceGrotesk.variable} font-body antialiased bg-background text-foreground`}>
        <ThemeProvider>
          <SenderProvider>
            <AppInitializer>
              {children}
            </AppInitializer>
          </SenderProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
