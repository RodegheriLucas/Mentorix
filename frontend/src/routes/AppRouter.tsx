import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShell } from '../components/layout/AppShell';
import { LoginPage } from '../pages/LoginPage';

// Aluno
import { AlunoDashboard } from '../pages/aluno/AlunoDashboard';
import { NovoCard } from '../pages/aluno/NovoCard';
import { MeusCards } from '../pages/aluno/MeusCards';
import { AvaliarEncontro } from '../pages/aluno/AvaliarEncontro';

// Mentor
import { MentorDashboard } from '../pages/mentor/MentorDashboard';
import { FeedMentoria } from '../pages/mentor/FeedMentoria';
import { MinhasHoras } from '../pages/mentor/MinhasHoras';
import { AbrirContestacao } from '../pages/mentor/AbrirContestacao';

// Gestor
import { GestorDashboard } from '../pages/gestor/GestorDashboard';
import { PainelPortaria } from '../pages/gestor/PainelPortaria';
import { GerenciarAmbientes } from '../pages/gestor/GerenciarAmbientes';
import { ResolverDisputas } from '../pages/gestor/ResolverDisputas';

const AgendamentosPage = React.lazy(() => import('../pages/AgendamentosPage').then(m => ({ default: m.AgendamentosPage })));

const RoleRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const routes: Record<string, string> = {
    ALUNO: '/aluno', ALUNO_MENTOR: '/mentor', PROFESSOR_MENTOR: '/professor', GESTOR: '/gestor',
  };
  return <Navigate to={routes[user.papel] || '/login'} replace />;
};

export const AppRouter: React.FC = () => (
  <BrowserRouter>
    <React.Suspense fallback={<div style={{ padding: 40, color: 'var(--color-text-secondary)' }}>Carregando...</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* ALUNO */}
        <Route path="/aluno" element={<ProtectedRoute roles={['ALUNO']}><AppShell><MeusCards /></AppShell></ProtectedRoute>} />
        <Route path="/aluno/novo-card" element={<ProtectedRoute roles={['ALUNO']}><AppShell><NovoCard /></AppShell></ProtectedRoute>} />
        <Route path="/aluno/meus-cards" element={<ProtectedRoute roles={['ALUNO']}><AppShell><MeusCards /></AppShell></ProtectedRoute>} />
        <Route path="/aluno/agendamentos" element={<ProtectedRoute roles={['ALUNO']}><AppShell><AgendamentosPage /></AppShell></ProtectedRoute>} />
        <Route path="/aluno/avaliar" element={<ProtectedRoute roles={['ALUNO']}><AppShell><AvaliarEncontro /></AppShell></ProtectedRoute>} />

        {/* MENTOR */}
        <Route path="/mentor" element={<ProtectedRoute roles={['ALUNO_MENTOR']}><AppShell><MentorDashboard /></AppShell></ProtectedRoute>} />
        <Route path="/mentor/feed" element={<ProtectedRoute roles={['ALUNO_MENTOR']}><AppShell><FeedMentoria /></AppShell></ProtectedRoute>} />
        <Route path="/mentor/agendamentos" element={<ProtectedRoute roles={['ALUNO_MENTOR']}><AppShell><AgendamentosPage /></AppShell></ProtectedRoute>} />
        <Route path="/mentor/horas" element={<ProtectedRoute roles={['ALUNO_MENTOR']}><AppShell><MinhasHoras /></AppShell></ProtectedRoute>} />
        <Route path="/mentor/contestacao" element={<ProtectedRoute roles={['ALUNO_MENTOR']}><AppShell><AbrirContestacao /></AppShell></ProtectedRoute>} />

        {/* PROFESSOR */}
        <Route path="/professor" element={<ProtectedRoute roles={['PROFESSOR_MENTOR']}><AppShell><MentorDashboard /></AppShell></ProtectedRoute>} />
        <Route path="/professor/feed" element={<ProtectedRoute roles={['PROFESSOR_MENTOR']}><AppShell><FeedMentoria /></AppShell></ProtectedRoute>} />
        <Route path="/professor/agendamentos" element={<ProtectedRoute roles={['PROFESSOR_MENTOR']}><AppShell><AgendamentosPage /></AppShell></ProtectedRoute>} />

        {/* GESTOR */}
        <Route path="/gestor" element={<ProtectedRoute roles={['GESTOR']} checkPenalty={false}><AppShell><GestorDashboard /></AppShell></ProtectedRoute>} />
        <Route path="/gestor/portaria" element={<ProtectedRoute roles={['GESTOR']} checkPenalty={false}><AppShell><PainelPortaria /></AppShell></ProtectedRoute>} />
        <Route path="/gestor/ambientes" element={<ProtectedRoute roles={['GESTOR']} checkPenalty={false}><AppShell><GerenciarAmbientes /></AppShell></ProtectedRoute>} />
        <Route path="/gestor/disputas" element={<ProtectedRoute roles={['GESTOR']} checkPenalty={false}><AppShell><ResolverDisputas /></AppShell></ProtectedRoute>} />

        <Route path="/" element={<RoleRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  </BrowserRouter>
);
