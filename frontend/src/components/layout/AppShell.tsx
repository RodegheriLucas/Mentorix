import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileTabBar } from './MobileTabBar';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F2EFE9' }}>
        <Sidebar />
        <main style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width)',
          padding: '28px 32px',
          overflowY: 'auto',
          minHeight: '100vh',
        }}>
          {children}
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#F2EFE9' }}>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '16px 16px 44px',
        boxSizing: 'border-box',
      }}>
        {children}
      </div>
      <MobileTabBar />
    </div>
  );
};
