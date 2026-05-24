import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from '../components/ui/DesignSystem';
import { Skeleton } from '../components/ui/Skeleton';

function initials(name: string) {
  return name?.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase() || '?';
}

function fmtDate(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('T')[0].split('-');
  return new Date(Number(y), Number(m) - 1, Number(d))
    .toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

const STATUS_LABEL: Record<string, string> = {
  AGENDADO: 'Agendado',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
  PENDENTE_GESTOR: 'Pendente',
};

const STATUS_COLOR: Record<string, string> = {
  AGENDADO: '#E64A19',
  EM_ANDAMENTO: '#2E7D32',
  CONCLUIDO: '#3A6B3A',
  CANCELADO: '#888',
  PENDENTE_GESTOR: '#E0A800',
};

interface Mensagem {
  id: number;
  autor_id: number;
  autor: { id: number; nome: string };
  mensagem: string;
  criado_em: string;
}

export const OrientacaoDetalhe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const agId = Number(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [agendamento, setAgendamento] = useState<any>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loadingAg, setLoadingAg] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [encerrando, setEncerrando] = useState(false);
  const [confirmEncerrar, setConfirmEncerrar] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const isProfessor = user?.papel === 'PROFESSOR_MENTOR';

  useEffect(() => {
    api.get(`/agendamentos/${agId}`)
      .then((r) => setAgendamento(r.data))
      .finally(() => setLoadingAg(false));
  }, [agId]);

  const carregarMsgs = () =>
    api.get(`/chat/${agId}`)
      .then((r) => setMensagens(r.data))
      .finally(() => setLoadingMsgs(false));

  useEffect(() => { carregarMsgs(); }, [agId]);

  useEffect(() => {
    if (!loadingMsgs) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, loadingMsgs]);

  const enviar = async () => {
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      await api.post(`/chat/${agId}`, { mensagem: texto.trim() });
      setTexto('');
      await carregarMsgs();
    } finally {
      setEnviando(false);
    }
  };

  const encerrar = async () => {
    setEncerrando(true);
    try {
      const r = await api.patch(`/agendamentos/${agId}/encerrar`);
      setAgendamento(r.data);
      setConfirmEncerrar(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao encerrar.');
    } finally {
      setEncerrando(false);
    }
  };

  const backPath = isProfessor ? '/professor/agendamentos' : '/aluno/agendamentos';

  if (loadingAg) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Skeleton height={200} />
      </div>
    );
  }

  if (!agendamento) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
        Orientação não encontrada.
      </div>
    );
  }

  const ag = agendamento;
  const alunoNome = ag.card?.aluno?.nome || 'Aluno';
  const professorNome = ag.mentor?.nome || 'Orientador';
  const statusColor = STATUS_COLOR[ag.status] || '#888';
  const isConcluido = ag.status === 'CONCLUIDO';

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 120px)', minHeight: 0 }}>
      {/* Header */}
      <div style={{ flexShrink: 0, marginBottom: 16 }}>
        <button
          onClick={() => navigate(backPath)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontSize: 13, fontWeight: 600, padding: '0 0 12px', fontFamily: 'var(--f-body)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Voltar
        </button>

        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 4 }}>
                Orientação TCC
              </p>
              <h2 style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 17, color: 'var(--text)', margin: 0, lineHeight: 1.3 }}>
                {ag.card?.titulo || 'Orientação'}
              </h2>
            </div>
            <span style={{
              flexShrink: 0, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
              background: statusColor + '18', color: statusColor,
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              {STATUS_LABEL[ag.status] || ag.status}
            </span>
          </div>

          {/* Participantes */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'var(--surface)' }}>
              <Avatar initials={initials(alunoNome)} size={28} />
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--text-3)' }}>Aluno</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{alunoNome}</div>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'var(--surface)' }}>
              <Avatar initials={initials(professorNome)} size={28} />
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--text-3)' }}>Orientador</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{professorNome}</div>
              </div>
            </div>
          </div>

          {/* Datas */}
          {ag.data && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: 'var(--text-2)', padding: '4px 9px', borderRadius: 8, background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                  <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                {fmtDate(ag.data)}
              </span>
              {ag.hora_inicio && (
                <span style={{ fontSize: 11, color: 'var(--text-2)', padding: '4px 9px', borderRadius: 8, background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  {ag.hora_inicio.slice(0,5)}–{ag.hora_fim?.slice(0,5)}
                </span>
              )}
            </div>
          )}

          {/* Encerrar button — professor only, only if not concluded */}
          {isProfessor && !isConcluido && (
            <div style={{ marginTop: 12 }}>
              {confirmEncerrar ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={encerrar}
                    disabled={encerrando}
                    style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: encerrando ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#2E7D32,#1B5E20)', color: '#fff', fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 13 }}
                  >
                    {encerrando ? 'Encerrando…' : 'Confirmar encerramento'}
                  </button>
                  <button
                    onClick={() => setConfirmEncerrar(false)}
                    style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', fontFamily: 'var(--f-body)', fontSize: 13, color: 'var(--text-2)' }}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmEncerrar(true)}
                  style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: '1.5px solid #2E7D32', background: '#F0F4F0', cursor: 'pointer', fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 13, color: '#2E7D32' }}
                >
                  Encerrar orientação
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
        background: '#fff', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden',
      }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            Chat de orientação
          </p>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loadingMsgs ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3].map((i) => <Skeleton key={i} height={48} />)}
            </div>
          ) : mensagens.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 0', color: 'var(--text-3)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 10, opacity: 0.4 }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <p style={{ fontSize: 13, textAlign: 'center' }}>Nenhuma mensagem ainda.<br/>Inicie a conversa sobre a orientação.</p>
            </div>
          ) : (
            mensagens.map((msg) => {
              const isMe = msg.autor_id === user?.id;
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
                  {!isMe && (
                    <Avatar initials={initials(msg.autor.nome)} size={26} />
                  )}
                  <div style={{ maxWidth: '72%' }}>
                    {!isMe && (
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', marginBottom: 3, paddingLeft: 4 }}>
                        {msg.autor.nome.split(' ')[0]}
                      </div>
                    )}
                    <div style={{
                      padding: '8px 12px', borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: isMe ? 'linear-gradient(135deg,#5D46B8,#3A2885)' : 'var(--surface)',
                      color: isMe ? '#fff' : 'var(--text)',
                      fontSize: 13, lineHeight: 1.45,
                    }}>
                      {msg.mensagem}
                    </div>
                    <div style={{ fontSize: 9.5, color: 'var(--text-3)', marginTop: 3, textAlign: isMe ? 'right' : 'left', paddingLeft: isMe ? 0 : 4 }}>
                      {fmtTime(msg.criado_em)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {!isConcluido && (
          <div style={{ flexShrink: 0, padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } }}
              rows={1}
              placeholder="Escreva uma mensagem…"
              style={{
                flex: 1, padding: '10px 12px', borderRadius: 12, border: '1px solid var(--border)',
                background: 'var(--surface)', fontFamily: 'var(--f-body)', fontSize: 13,
                resize: 'none', outline: 'none', lineHeight: 1.4, maxHeight: 100, overflowY: 'auto',
              }}
            />
            <button
              onClick={enviar}
              disabled={enviando || !texto.trim()}
              style={{
                flexShrink: 0, width: 40, height: 40, borderRadius: 12, border: 'none',
                background: texto.trim() ? 'linear-gradient(135deg,#5D46B8,#3A2885)' : 'var(--surface)',
                cursor: texto.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={texto.trim() ? '#fff' : 'var(--text-3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
        {isConcluido && (
          <div style={{ flexShrink: 0, padding: '12px 16px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
            Orientação encerrada
          </div>
        )}
      </div>
    </div>
  );
};
