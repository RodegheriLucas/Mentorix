import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const MinhasHoras: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Minhas Horas Complementares</h1>
      <div className="glass" style={{ borderRadius: 'var(--border-radius-lg)', padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 72, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 8 }}>
          {Number(user?.horas_complementares || 0).toFixed(1)}
        </div>
        <div style={{ fontSize: 18, color: 'var(--color-text-secondary)', marginBottom: 24 }}>horas complementares acumuladas</div>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          Horas são consolidadas após a avaliação de cada encontro pelo aluno mentoreado.
        </div>
      </div>
    </div>
  );
};
