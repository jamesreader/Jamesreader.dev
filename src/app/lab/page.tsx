import type { Metadata } from 'next';
import WorldGallery from '@/components/world/WorldGallery';

export const metadata: Metadata = {
  title: 'Lab · Worlds',
  description: 'World engine gallery: every scene the site’s particle field can become.',
  robots: { index: false, follow: false },
};

export default function LabPage() {
  return <WorldGallery />;
}
