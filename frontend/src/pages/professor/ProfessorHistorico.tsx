import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { Avatar } from '../../components/ui/DesignSystem';
import { Skeleton } from '../../components/ui/Skeleton';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#6f5ad0,#4632a0)',
  'linear-gradient(135deg,#4a78d6,#2854b4)',
  'linear-gradient(135deg,#8a6fe0,#5c3fc0)',
  'linear-gradient(135deg,#e64a19,#bf360c)',
  'linear-gradient(135deg,#506fc7,#2e4ea0)',
];

function avatarGrad(nome?: string) {
  if (!nome) return AVATAR_GRADIENTS[0];
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[Math.abs(h)];
}

function initials(name: string) {
  return name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '??';
}

function fmtDate(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('T')[0].split('-');
  return new Date(Number(y), Number(m) - 1, Number(d))
    .toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDuration(inicio: string, fim: string) {
  if (!inicio || !fim) return '';
  const [hi, mi] = inicio.split(':').map(Number);
  const [hf, mf] = fim.split(':').map(Number);
  const mins = (hf * 60 + mf) - (hi * 60 + mi);
  if (mins <= 0) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${m}min`;
}

export const ProfessorHistorico: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/agendamentos')
      .then((r) => {
        const concluidos = r.data
          .filter((a: any) => a.status === 'CONCLUIDO')
          .sort((a: any, b: any) => {
            const da = (a.data || '').split('T')[0];
            const db = (b.data || '').split('T')[0];
            return db.localeCompare(da);
          });
        setAgendamentos(concluidos);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 560, margin: '0 auto' }}>

      {/* Cabeçalho */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{
          fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 26,
          color: 'var(--text)', margin: 0, letterSpacing: -0.5,
        }}>
          Histórico
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
          Orientações concluídas
        </p>
      </div>

      {/* Contador */}
      {!loading && (
        <p style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
          textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16,
        }}>
          {agendamentos.length} orientaç{agendamentos.length === 1 ? 'ão' : 'ões'}
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} height={88} />)}
        </div>
      )}

      {/* Vazio */}
      {!loading && agendamentos.length === 0 && (
        <div style={{
          padding: '44px 20px', textAlign: 'center',
          border: '1.5px dashed var(--border)', borderRadius: 16, background: '#fff',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 14px', display: 'block' }}>
            <circle cx="12" cy="12" r="9" stroke="var(--text-3)" strokeWidth="1.5"/>
            <path d="M12 7v5l3 2" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-2)', marginBottom: 4 }}>
            Nenhuma orientação concluída
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
            Suas orientações encerradas aparecerão aqui.
          </p>
        </div>
      )}

      {/* Lista */}
      {!loading && agendamentos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {agendamentos.map((ag) => {
            const alunoNome = ag.card?.aluno?.nome || 'Aluno';
            const duracao   = fmtDuration(ag.hora_inicio, ag.hora_fim);
            const sala      = ag.ambiente
              ? `${ag.ambiente.bloco ? ag.ambiente.bloco + ' · ' : ''}${ag.ambiente.nome}`
              : null;

            return (
              <div key={ag.id} style={{
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: 14, padding: '14px 16px',
                borderLeft: '4px solid #7bb87b',
              }}>
                {/* Título + badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                  <span style={{
                    fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 13,
                    color: 'var(--text)', lineHeight: 1.3, flex: 1,
                  }}>
                    {ag.card?.titulo || 'Orientação'}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
                    background: '#F0F4F0', color: '#3A6B3A', whiteSpace: 'nowrap', flexShrink: 0,
                    textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>
                    Concluída
                  </span>
                </div>

                {/* Aluno */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Avatar initials={initials(alunoNome)} color={avatarGrad(alunoNome)} size={26}/>
                  <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{alunoNome}</span>
                </div>

                {/* Infos */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '4px 9px', borderRadius: 8, background: 'var(--surface)',
                    fontSize: 11, color: 'var(--text-2)', fontWeight: 500,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                      <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    {fmtDate(ag.data)}
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '4px 9px', borderRadius: 8, background: 'var(--surface)',
                    fontSize: 11, color: 'var(--text-2)', fontWeight: 500,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    {ag.hora_inicio}–{ag.hora_fim}{duracao ? ` · ${duracao}` : ''}
                  </div>

                  {sala && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '4px 9px', borderRadius: 8, background: 'var(--surface)',
                      fontSize: 11, color: 'var(--text-2)', fontWeight: 500,
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                        <path d="M3 12h18M8 5v14M16 5v14" stroke="currentColor" strokeWidth="1.2"/>
                      </svg>
                      {sala}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
