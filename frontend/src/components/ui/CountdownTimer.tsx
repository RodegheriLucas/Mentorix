import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Liberado!'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`);
    };
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div style={{
      fontFamily: 'monospace',
      fontSize: '28px',
      fontWeight: 700,
      color: 'var(--color-danger)',
      background: 'var(--color-danger-bg)',
      border: '1px solid var(--color-danger)',
      borderRadius: '8px',
      padding: '12px 24px',
      letterSpacing: '2px',
    }}>
      {timeLeft}
    </div>
  );
};
