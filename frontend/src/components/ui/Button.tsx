import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    borderRadius: '8px',
    width: fullWidth ? '100%' : undefined,
    opacity: disabled || loading ? 0.6 : 1,
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 12px', fontSize: '13px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '14px 28px', fontSize: '16px' },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--color-primary)', color: '#fff' },
    secondary: { background: 'var(--color-bg-glass)', color: 'var(--color-text)', border: '1px solid var(--color-border)' },
    danger: { background: 'var(--color-danger)', color: '#fff' },
    ghost: { background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid transparent' },
  };

  return (
    <button
      style={{ ...baseStyle, ...sizeStyles[size], ...variantStyles[variant] }}
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {loading ? <span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} /> : null}
      {children}
    </button>
  );
};
