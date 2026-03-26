import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="site-footer" className="bg-cream-dark dark:bg-dark-surface border-t border-stone-dark/20 dark:border-dark-border/20">
      <div id="footer-inner" className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <p className="font-serif text-xl font-bold text-charcoal dark:text-cream mb-2">
              James Reader
            </p>
            <p className="text-sm text-charcoal/60 dark:text-dark-muted leading-relaxed">
              Building systems that think, infrastructure that scales, and tools that solve real problems.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-charcoal/40 dark:text-dark-muted mb-4">
              Navigate
            </p>
            <div className="flex flex-col gap-2">
              {[
                { href: '/work', label: 'Work' },
                { href: '/blog', label: 'Blog' },
                { href: '/about', label: 'About' },
                { href: '/lab', label: 'Lab' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="text-sm text-charcoal/60 dark:text-dark-muted hover:text-turquoise transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-charcoal/40 dark:text-dark-muted mb-4">
              Connect
            </p>
            <div className="flex flex-col gap-2">
              <a href="https://github.com/jamesreader" target="_blank" rel="noopener noreferrer" className="text-sm text-charcoal/60 dark:text-dark-muted hover:text-turquoise transition-colors">
                GitHub
              </a>
              <a href="mailto:james@swds.biz" className="text-sm text-charcoal/60 dark:text-dark-muted hover:text-turquoise transition-colors">
                james@swds.biz
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-stone-dark/10 dark:border-dark-border/10">
          <p className="text-xs text-charcoal/40 dark:text-dark-muted text-center">
            &copy; {new Date().getFullYear()} James Reader. Moriarty, NM.
          </p>
        </div>
      </div>
    </footer>
  );
}
