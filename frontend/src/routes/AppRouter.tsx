import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShell } from '../components/layout/AppShell';
import { MobileShell } from '../components/layout/MobileShell';
import { LoginPage } from '../pages/LoginPage';
import { ContaPage } from '../pages/ContaPage';

// Aluno
import { NovoCard } from '../pages/aluno/NovoCard';
import { MeusCards } from '../pages/aluno/MeusCards';
import { AvaliarEncontro } from '../pages/aluno/AvaliarEncontro';

// Mentor
import { FeedMentoria } from '../pages/mentor/FeedMentoria';
import { MinhasHoras } from '../pages/mentor/MinhasHoras';
import { AbrirContestacao } from '../pages/mentor/AbrirContestacao';

// Gestor
import { PainelPortaria } from '../pages/gestor/PainelPortaria';
import { GerenciarAmbientes } from '../pages/gestor/GerenciarAmbientes';
import { ResolverDisputas } from '../pages/gestor/ResolverDisputas';

const AgendamentosPage = React.lazy(() =>
  import('../pages/AgendamentosPage').then(m => ({ default: m.AgendamentosPage }))
);

const RoleRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const routes: Record<string, string> = {
    ALUNO: '/aluno',
    ALUNO_MENTOR: '/mentor/agendamentos',
    PROFESSOR_MENTOR: '/professor/agendamentos',
    GESTOR: '/gestor/portaria',
  };
  return <Navigate to={routes[user.papel] || '/login'} replace />;
};

const MW = ({ roles, children }: { roles: string[]; children: React.ReactNode }) => (
  <ProtectedRoute roles={roles}><MobileShell>{children}</MobileShell></ProtectedRoute>
);

const GW = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute roles={['GESTOR']} checkPenalty={false}><AppShell>{children}</AppShell></ProtectedRoute>
);

export const AppRouter: React.FC = () => (
  <BrowserRouter>
    <React.Suspense fallback={<div style={{ padding: 40, color: 'var(--text-3)' }}>Carregando...</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* ALUNO */}
        <Route path="/aluno"               element={<MW roles={['ALUNO']}><MeusCards /></MW>} />
        <Route path="/aluno/meus-cards"    element={<MW roles={['ALUNO']}><MeusCards /></MW>} />
        <Route path="/aluno/novo-card"     element={<MW roles={['ALUNO']}><NovoCard /></MW>} />
        <Route path="/aluno/editar-card/:id" element={<MW roles={['ALUNO']}><NovoCard /></MW>} />
        <Route path="/aluno/agendamentos"  element={<MW roles={['ALUNO']}><AgendamentosPage /></MW>} />
        <Route path="/aluno/avaliar"       element={<MW roles={['ALUNO']}><AvaliarEncontro /></MW>} />
        <Route path="/aluno/conta"         element={<MW roles={['ALUNO']}><ContaPage /></MW>} />

        {/* MENTOR — landing redirects to agenda */}
        <Route path="/mentor"              element={<Navigate to="/mentor/agendamentos" replace />} />
        <Route path="/mentor/feed"         element={<MW roles={['ALUNO_MENTOR']}><FeedMentoria /></MW>} />
        <Route path="/mentor/agendamentos" element={<MW roles={['ALUNO_MENTOR']}><AgendamentosPage /></MW>} />
        <Route path="/mentor/horas"        element={<MW roles={['ALUNO_MENTOR']}><MinhasHoras /></MW>} />
        <Route path="/mentor/contestacao"  element={<MW roles={['ALUNO_MENTOR']}><AbrirContestacao /></MW>} />
        <Route path="/mentor/conta"        element={<MW roles={['ALUNO_MENTOR']}><ContaPage /></MW>} />

        {/* PROFESSOR — landing redirects to agenda */}
        <Route path="/professor"              element={<Navigate to="/professor/agendamentos" replace />} />
        <Route path="/professor/feed"         element={<MW roles={['PROFESSOR_MENTOR']}><FeedMentoria /></MW>} />
        <Route path="/professor/agendamentos" element={<MW roles={['PROFESSOR_MENTOR']}><AgendamentosPage /></MW>} />
        <Route path="/professor/conta"        element={<MW roles={['PROFESSOR_MENTOR']}><ContaPage /></MW>} />

        {/* GESTOR */}
        <Route path="/gestor"           element={<Navigate to="/gestor/portaria" replace />} />
        <Route path="/gestor/portaria"  element={<GW><PainelPortaria /></GW>} />
        <Route path="/gestor/ambientes" element={<GW><GerenciarAmbientes /></GW>} />
        <Route path="/gestor/disputas"  element={<GW><ResolverDisputas /></GW>} />

        <Route path="/" element={<RoleRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  </BrowserRouter>
);
