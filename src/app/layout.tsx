import './globals.css';
import { AgentProvider } from '@/context/AgentProvider';
import LayoutShell from '@/components/LayoutShell';

export const metadata = {
  title: {
    default: 'James Reader | Builder, IT Leader, AI Engineer',
    template: '%s | James Reader',
  },
  description: 'I build systems that think, infrastructure that scales, and tools that solve real problems. IT Director, AI engineer, and entrepreneur based in New Mexico.',
  metadataBase: new URL('https://jamesreader.dev'),
  openGraph: {
    title: 'James Reader | Builder, IT Leader, AI Engineer',
    description: 'I build systems that think, infrastructure that scales, and tools that solve real problems.',
    url: 'https://jamesreader.dev',
    siteName: 'James Reader',
    type: 'website',
  },
};

const themeScript = `
(function(){
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="site-version" content="2026.03.26.3" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body data-version="2026.03.26.3" className="bg-cream dark:bg-dark-bg text-charcoal dark:text-dark-text antialiased">
        <AgentProvider>
          <LayoutShell>
            {children}
          </LayoutShell>
        </AgentProvider>
      </body>
    </html>
  );
}
