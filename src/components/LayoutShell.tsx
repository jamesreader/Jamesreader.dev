'use client';

import { usePathname } from 'next/navigation';
import { useAgent } from '@/context/AgentProvider';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const { intent } = useAgent();
  const pathname = usePathname();

  // Hide footer when stage view is active (intent set on home page)
  const isStageActive = intent && pathname === '/';

  return (
    <>
      <Nav />
      <main className={isStageActive ? 'h-[100dvh] pt-16 overflow-hidden' : 'min-h-screen pt-16'}>
        {children}
      </main>
      {!isStageActive && <Footer />}
    </>
  );
}
