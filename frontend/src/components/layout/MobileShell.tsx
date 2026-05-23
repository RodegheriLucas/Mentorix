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

interface MobileShellProps {
  children: React.ReactNode;
}

export const MobileShell: React.FC<MobileShellProps> = ({ children }) => {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F2EFE9' }}>
        <Sidebar />
        <main style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width)',
          minHeight: '100vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
          padding: '32px 40px',
        }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      background: '#F2EFE9',
    }}>
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
