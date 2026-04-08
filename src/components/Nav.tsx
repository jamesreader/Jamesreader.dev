'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { useState } from 'react';
import { useAgent } from '@/context/AgentProvider';

const links = [
  { href: '/', label: 'Home' },
  { href: '/work', label: 'Work' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
];

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { intent, clearSession } = useAgent();

  // Show "Talk to Reader" when browsing without an active stage session
  const showReaderLink = !intent && pathname !== '/';

  return (
    <nav id="site-nav" className="fixed top-0 left-0 right-0 z-50 bg-cream/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-stone-dark/30 dark:border-dark-border/30">
      <div id="nav-inner" className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link id="nav-logo" href="/" className="font-serif text-xl font-bold text-charcoal dark:text-cream hover:text-turquoise transition-colors">
          JR
        </Link>

        {/* Desktop links */}
        <div id="nav-links" className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-sans tracking-wide transition-colors ${
                pathname === href
                  ? 'text-turquoise'
                  : 'text-charcoal/70 dark:text-dark-muted hover:text-charcoal dark:hover:text-cream'
              }`}
            >
              {label}
            </Link>
          ))}
          {showReaderLink && (
            <Link
              href="/"
              className="text-sm font-sans tracking-wide text-turquoise hover:text-turquoise-dim transition-colors flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-turquoise animate-pulse" />
              Talk to Reader
            </Link>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile menu button */}
        <div id="nav-mobile-btn" className="flex md:hidden items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-charcoal dark:text-cream p-2"
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div id="nav-mobile-menu" className="md:hidden bg-cream dark:bg-dark-bg border-b border-stone-dark/30 dark:border-dark-border/30 px-6 pb-4">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`block py-3 text-base font-sans transition-colors ${
                pathname === href
                  ? 'text-turquoise'
                  : 'text-charcoal/70 dark:text-dark-muted'
              }`}
            >
              {label}
            </Link>
          ))}
          {showReaderLink && (
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-base font-sans text-turquoise flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-turquoise animate-pulse" />
              Talk to Reader
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
