'use client';

import { usePathname } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  // Every page (home included) uses normal document scrolling, so the world engine's
  // viewport IntersectionObserver sees `data-world` sections as they cross the middle.
  return (
    <>
      <Nav />
      <main id="site-main" className="min-h-screen pt-16">
        {children}
      </main>
      {/* Home pins Reader's prompt to the bottom; keep the footer clear of it. */}
      <div className={isHome ? 'relative z-[1] pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] bg-cream-dark dark:bg-dark-surface' : undefined}>
        <Footer />
      </div>
    </>
  );
}
