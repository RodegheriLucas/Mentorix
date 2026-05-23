import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MxLogo } from '../components/ui/DesignSystem';

export const LoginPage: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roleRoutes: Record<string, string> = {
    ALUNO: '/aluno',
    ALUNO_MENTOR: '/mentor',
    PROFESSOR_MENTOR: '/professor',
    GESTOR: '/gestor',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, senha);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (user) navigate(roleRoutes[user.papel] || '/');
  }, [user]);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: '1px solid var(--border)', background: '#fff',
    fontFamily: 'var(--f-body)', fontSize: 14, color: 'var(--text)',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--primary-dark)',
      padding: '20px',
    }}>
      <div className="animate-fadeIn" style={{
        width: '100%', maxWidth: 400,
        background: '#fff', borderRadius: 24, padding: '40px 36px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <MxLogo size={28}/>
          <div>
            <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 20, color: 'var(--text)', letterSpacing: -0.3 }}>
              mentorix
            </div>
            <div className="mx-caption" style={{ fontSize: 11 }}>Plataforma de Mentoria Acadêmica</div>
          </div>
        </div>

        <h1 style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 22, color: 'var(--text)', marginBottom: 6, margin: '0 0 6px' }}>
          Bom ver você!
        </h1>
        <p className="mx-caption" style={{ marginBottom: 24 }}>Entre com seu email institucional.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {error && (
            <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--accent-dark)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="mx-btn"
            disabled={loading}
            style={{ width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 600, marginTop: 4 }}
          >
            {loading ? 'Entrando…' : 'Entrar →'}
          </button>
        </form>

        <p className="mx-caption" style={{ marginTop: 20, textAlign: 'center', fontSize: 11 }}>
          Acesso restrito a usuários cadastrados
        </p>
      </div>
    </div>
  );
};
