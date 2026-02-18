import MainPageContent from '@/components/main-page-content';

export default function Home() {
  return (
    <main className="relative w-full min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-accent/10 to-background" />
      <MainPageContent />
    </main>
  );
}
