import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}

const variantMap = {
  default: { bg: 'var(--color-bg-glass)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' },
  success: { bg: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid var(--color-success)' },
  warning: { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', border: '1px solid var(--color-warning)' },
  danger: { bg: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' },
  info: { bg: 'var(--color-info-bg)', color: 'var(--color-info)', border: '1px solid var(--color-info)' },
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children }) => {
  const style = variantMap[variant];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      ...style,
    }}>
      {children}
    </span>
  );
};

export function statusToBadge(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    ABERTO: 'info',
    ACEITO: 'success',
    AGENDADO: 'success',
    EM_ANDAMENTO: 'warning',
    CONCLUIDO: 'default',
    CANCELADO: 'danger',
    PENDENTE_GESTOR: 'warning',
    DISPUTA: 'danger',
  };
  return map[status] || 'default';
}
