import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CountdownTimer } from '../components/ui/CountdownTimer';
import { Button } from '../components/ui/Button';

export const PenaltyBlockScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className="animate-glow"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a0a0a 0%, #2d0a0a 100%)',
        padding: '20px',
      }}
    >
      <div style={{
        maxWidth: 500,
        width: '100%',
        background: 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 20,
        padding: '48px 40px',
        textAlign: 'center',
        boxShadow: '0 0 40px rgba(239, 68, 68, 0.2)',
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>⛔</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-danger)', marginBottom: 8 }}>
          Conta Suspensa
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32, lineHeight: 1.7 }}>
          Sua conta foi suspensa por violação das regras da plataforma.
        </p>

        {user?.suspenso_ate && (
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>Tempo restante de suspensão:</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CountdownTimer targetDate={user.suspenso_ate} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 12 }}>
              Liberação: {new Date(user.suspenso_ate).toLocaleString('pt-BR')}
            </p>
          </div>
        )}

        <Button variant="danger" onClick={handleLogout}>
          Sair da conta
        </Button>
      </div>
    </div>
  );
};
