'use client';

import { useAgent } from '@/context/AgentProvider';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const { isOpen } = useAgent();

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        isOpen ? 'lg:mr-[400px]' : ''
      }`}
    >
      {children}
    </div>
  );
}
