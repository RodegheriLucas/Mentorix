import React from 'react';
import { PhoneFrame } from './PhoneFrame';
import { MobileTabBar } from './MobileTabBar';

interface MobileShellProps {
  children: React.ReactNode;
}

export const MobileShell: React.FC<MobileShellProps> = ({ children }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--primary-dark)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      boxSizing: 'border-box',
    }}>
      <PhoneFrame bottomBar={<MobileTabBar />}>
        <div style={{ padding: '16px', boxSizing: 'border-box' }}>
          {children}
        </div>
      </PhoneFrame>
    </div>
  );
};
