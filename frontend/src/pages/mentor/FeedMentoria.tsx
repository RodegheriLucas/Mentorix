import React, { useEffect, useMemo, useState } from 'react';
import { FaFire } from "react-icons/fa6";
import api from '../../config/api';
import { Avatar, MxLogo, TopicBadge } from '../../components/ui/DesignSystem';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/AuthContext';


const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#6f5ad0,#4632a0)',
  'linear-gradient(135deg,#4a78d6,#2854b4)',
  'linear-gradient(135deg,#8a6fe0,#5c3fc0)',
  'linear-gradient(135deg,#e64a19,#bf360c)',
  'linear-gradient(135deg,#506fc7,#2e4ea0)',
  'linear-gradient(135deg,#7a5fd0,#4a35a0)',
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

function matchRatio(mentorTopics: string[], cardTopics: string[]) {
  if (!cardTopics.length || !mentorTopics.length) return 0;
  return cardTopics.filter((t) => mentorTopics.includes(t)).length / cardTopics.length;
}

function interpolateHeatColor(ratio: number): string {
  const r = Math.min(1, Math.max(0, ratio));
  const red = Math.round(232 - 139 * r);
  const green = Math.round(230 - 160 * r);
  const blue = Math.round(240 - 56 * r);
  return `rgb(${red},${green},${blue})`;
}

function heatLabel(ratio: number): string {
  if (ratio >= 0.8) return 'Conexão Forte';
  if (ratio >= 0.5) return 'Conexão Boa';
  if (ratio >= 0.25) return 'Conexão Parcial';
  if (ratio > 0) return 'Conexão Baixa';
  return 'Sem conexão';
}

function needsWhiteText(ratio: number): boolean {
  return ratio >= 0.75;
}

// ── SlotModal ─────────────────────────────────────────────────
interface SlotModalProps {
  card: any; slots: any[]; loading: boolean;
  selectedSlot: any; onSelectSlot: (s: any) => void;
  onConfirm: () => void; onClose: () => void; confirming: boolean;
}

function SlotModal({ card, slots, loading, selectedSlot, onSelectSlot, onConfirm, onClose, confirming }: SlotModalProps) {
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#fff',
      zIndex: 1000, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        width: '100%', height: '100%',
        padding: '20px 20px 32px',
        overflowY: 'auto', boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)' }}>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none'>
              <path d='M18 6L6 18M6 6l12 12' stroke='currentColor' strokeWidth='2' strokeLinecap='round'/>
            </svg>
          </button>
        </div>
        <p className="mx-caption" style={{ textTransform: 'uppercase', fontSize: 9, fontWeight: 700, letterSpacing: 1, color: 'var(--primary)', marginBottom: 4 }}>
          Aceitar mentoria
        </p>
        <h2 style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 17, lineHeight: 1.25, color: 'var(--text)', marginBottom: 3 }}>
          {card?.titulo}
        </h2>
        <p className="mx-caption" style={{ marginBottom: 18, fontSize: 12 }}>por {card?.aluno?.nome}</p>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} height={56} />)}
          </div>
        ) : slots.length === 0 ? (
          <p style={{ color: 'var(--text-3)', textAlign: 'center', padding: '20px 0', fontSize: 13 }}>Nenhuma sala disponível no momento.</p>
        ) : (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Horários compatíveis</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {slots.map((slot, i) => {
                const on = selectedSlot === slot;
                return (
                  <button key={i} onClick={() => onSelectSlot(slot)} style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 12, cursor: 'pointer', border: on ? '2px solid var(--primary)' : '1px solid var(--border)', background: on ? 'var(--primary-light)' : '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: on ? '5px solid var(--primary)' : '2px solid var(--border)', background: '#fff' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                        {slot.data ? new Date(slot.data + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }) : ''} · {slot.hora_inicio} – {slot.hora_fim}
                      </div>
                      <div className="mx-caption" style={{ fontSize: 11 }}>{slot.ambiente?.nome}{slot.ambiente?.bloco ? ` · ${slot.ambiente.bloco}` : ''}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={onConfirm} disabled={!selectedSlot || confirming} style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 0, cursor: (!selectedSlot || confirming) ? 'not-allowed' : 'pointer', background: (!selectedSlot || confirming) ? 'rgba(93,70,184,0.4)' : 'linear-gradient(135deg, #5D46B8, #3A2885)', color: '#fff', fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 14, boxShadow: (!selectedSlot || confirming) ? 'none' : '0 4px 14px rgba(93,70,184,0.35)' }}>
              {confirming ? 'Confirmando…' : 'Aceitar mentoria'}
            </button>
          </>
        )}
        <button onClick={onClose} style={{ width: '100%', marginTop: 10, padding: '12px 0', borderRadius: 12, border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', fontFamily: 'var(--f-body)', fontWeight: 500, fontSize: 14, color: 'var(--text-2)' }}>Cancelar</button>
      </div>
    </div>
  );
}



// ─── ContraProposta Modal ─────────────────────────────────────────────────────
function ContraPropostaModal({ card, onClose, onSent }: { card: any; onClose: () => void; onSent: (cardId: number) => void }) {
  const [mensagem, setMensagem] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const enviar = async () => {
    setSending(true);
    setError('');
    try {
      await api.post(`/contra-propostas/card/${card.id}`, { mensagem });
      onSent(card.id);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar proposta.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(18,18,18,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 402, background: '#fff', borderRadius: '24px 24px 0 0', padding: '20px 20px 36px', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--border)', margin: '0 auto 18px' }} />
        <p className="mx-caption" style={{ textTransform: 'uppercase', fontSize: 9, fontWeight: 700, letterSpacing: 1, color: 'var(--secondary)', marginBottom: 4 }}>
          Enviar proposta de orientação
        </p>
        <h2 style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 17, lineHeight: 1.25, color: 'var(--text)', marginBottom: 3 }}>{card?.titulo}</h2>
        <p className="mx-caption" style={{ marginBottom: 18, fontSize: 12 }}>por {card?.aluno?.nome}</p>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
            Mensagem para o aluno <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(opcional)</span>
          </label>
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Apresente-se, fale sobre sua experiência com o tema do TCC, como pretende orientar..."
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface)', fontFamily: 'var(--f-body)', fontSize: 13, color: 'var(--text)', resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5 }}
          />
          <div style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'right', marginTop: 3 }}>{mensagem.length}/1000</div>
        </div>
        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--accent-light)', border: '1px solid var(--accent)', fontSize: 12, color: 'var(--accent-dark)', marginBottom: 14 }}>
            {error}
          </div>
        )}
        <button onClick={enviar} disabled={sending} style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 0, cursor: sending ? 'not-allowed' : 'pointer', background: sending ? 'rgba(46,125,50,0.4)' : 'linear-gradient(135deg, var(--secondary), var(--secondary-dark))', color: '#fff', fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 14, boxShadow: sending ? 'none' : '0 4px 14px rgba(46,125,50,0.3)' }}>
          {sending ? 'Enviando…' : 'Enviar proposta →'}
        </button>
        <button onClick={onClose} style={{ width: '100%', marginTop: 10, padding: '12px 0', borderRadius: 12, border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', fontFamily: 'var(--f-body)', fontWeight: 500, fontSize: 14, color: 'var(--text-2)' }}>Cancelar</button>
      </div>
    </div>
  );
}

// ─── TCC Card (professor view) ────────────────────────────────────────────────
function TccCard({
  item, mentorTopics, onAceitar, onEnviarProposta, onNegar, propostaEnviada,
}: {
  item: { card: any; is_preferido: boolean; tem_preferencias: boolean };
  mentorTopics: string[];
  onAceitar: (card: any) => void;
  onEnviarProposta: (card: any) => void;
  onNegar: (card: any) => void;
  propostaEnviada: boolean;
}) {
  const { card, is_preferido } = item;
  const [expanded, setExpanded] = useState(false);

  const cardTopics: string[] = card.tags || [];
  const ratio = matchRatio(mentorTopics, cardTopics);
  const hotTopics = cardTopics.filter((t) => mentorTopics.includes(t));
  const hasMentor = mentorTopics.length > 0;
  const isFullMatch = hasMentor && ratio >= 1;

  const topColor = interpolateHeatColor(hasMentor ? ratio : 0);
  const whiteText = hasMentor && needsWhiteText(ratio);

  const clr = {
    label: whiteText ? 'rgba(255,255,255,0.78)' : 'var(--primary-dark)',
    pct: whiteText ? '#fff' : 'var(--primary-dark)',
    name: whiteText ? '#fff' : 'var(--text)',
    meta: whiteText ? 'rgba(255,255,255,0.7)' : 'var(--text-2)',
    barTrack: whiteText ? 'rgba(255,255,255,0.25)' : 'rgba(93,70,184,0.15)',
    barFill: whiteText ? 'rgba(255,255,255,0.92)' : '#5D46B8',
    chevron: whiteText ? '#fff' : 'var(--primary)',
    chevronBg: whiteText ? 'rgba(255,255,255,0.18)' : 'rgba(93,70,184,0.08)',
    chevronBorder: whiteText ? 'rgba(255,255,255,0.3)' : 'rgba(93,70,184,0.2)',
    ring: whiteText ? 'rgba(255,255,255,0.45)' : 'rgba(93,70,184,0.3)',
    bodyTitle: whiteText ? '#fff' : 'var(--text)',
    bodyDesc: whiteText ? 'rgba(255,255,255,0.8)' : 'var(--text-2)',
    footerBorder: whiteText ? 'rgba(255,255,255,0.18)' : 'var(--border)',
    footerIcon: whiteText ? 'rgba(255,255,255,0.65)' : 'var(--text-3)',
    footerCaption: whiteText ? 'rgba(255,255,255,0.7)' : undefined,
  };

  const aluno = card.aluno || {};
  const grad = avatarGrad(aluno.nome || '?');
  const curso = aluno.curso || '';
  const periodo = aluno.periodo || aluno.semestre || '';
  const metaLine = [curso, periodo].filter(Boolean).join(' · ');
  const slotCount = card.disponibilidades?.length ?? 0;

  return (
    <div
      onClick={() => setExpanded((v) => !v)}
      style={{
        overflow: 'hidden', cursor: 'pointer',
        background: isFullMatch
          ? 'linear-gradient(135deg, #5D46B8 0%, #3A2885 100%)'
          : `linear-gradient(180deg, ${topColor} 0%, #ffffff 75%)`,
        border: isFullMatch
          ? '1.5px solid rgba(255,255,255,0.15)'
          : expanded ? `1.5px solid ${topColor}` : '1px solid var(--border)',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        boxShadow: expanded
          ? '0 8px 28px rgba(93,70,184,0.18), 0 1px 2px rgba(18,18,18,0.06)'
          : '0 1px 2px rgba(18,18,18,0.05)',
        borderRadius: 14,
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 14px 0' }}>
        {/* Match row */}
        <div style={{ marginBottom: 10 }}>
          {hasMentor ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: clr.label, fontFamily: 'var(--f-body)' }}>
                  {heatLabel(ratio)}
                </span>
                <span style={{ fontFamily: 'var(--f-head)', fontWeight: 800, fontSize: 14, color: clr.pct, letterSpacing: -0.3 }}>
                  {Math.round(ratio * 100)}%
                </span>
              </div>
              <div style={{ height: 4, borderRadius: 99, background: clr.barTrack, overflow: 'hidden' }}>
                <div style={{ width: `${ratio * 100}%`, height: '100%', borderRadius: 99, background: clr.barFill, transition: 'width .5s ease' }} />
              </div>
            </>
          ) : (
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-3)', fontFamily: 'var(--f-body)' }}>
              Nova solicitação
            </span>
          )}
        </div>

        {/* Preferido banner */}
        {is_preferido && (
          <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6, margin: '0 -14px 10px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: '#fff' }}>
              Você foi escolhido como orientador preferido
            </span>
          </div>
        )}

        {/* Aluno row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14 }}>
          <div style={{ boxShadow: `0 0 0 2.5px ${clr.ring}`, borderRadius: '50%', flexShrink: 0 }}>
            <Avatar initials={initials(aluno.nome || '?')} color={grad} size={40} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: clr.name, lineHeight: 1.2, letterSpacing: -0.2 }}>
              {aluno.nome || '—'}
            </div>
            {metaLine && (
              <div style={{ fontSize: 11, color: clr.meta, marginTop: 2, fontFamily: 'var(--f-body)' }}>{metaLine}</div>
            )}
          </div>
          <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: clr.chevronBg, border: `1px solid ${clr.chevronBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.22s' }}>
              <path d="M6 9l6 6 6-6" stroke={clr.chevron} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '0 14px' }}>
        <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 14, lineHeight: 1.35, color: clr.bodyTitle, marginBottom: 10 }}>
          {card.titulo}
        </div>
        {expanded && card.descricao && (
          <p style={{ fontSize: 13, color: clr.bodyDesc, lineHeight: 1.55, marginBottom: 12, fontFamily: 'var(--f-body)', animation: 'mxFadeIn 0.18s ease' }}>
            {card.descricao}
          </p>
        )}
        {cardTopics.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
            {cardTopics.map((t) => (
              <TopicBadge key={t} tone={hotTopics.includes(t) ? 'accent' : 'gray'}>
                {hotTopics.includes(t) && (
                  <FaFire size={9} color="var(--accent)" style={{ flexShrink: 0 }} />
                )}
                #{t}
              </TopicBadge>
            ))}
          </div>
        )}
        {expanded && card.documento_url && (
          <a href={card.documento_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, marginBottom: 12, background: 'var(--primary-light)', color: 'var(--primary-dark)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Ver documento do aluno
          </a>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 14px', borderTop: `1px solid ${clr.footerBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="3" stroke={clr.footerIcon} strokeWidth="1.8" fill="none" />
            <path d="M3 10h18M8 4v6M16 4v6" stroke={clr.footerIcon} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="mx-caption" style={{ fontSize: 11, ...(clr.footerCaption && { color: clr.footerCaption }) }}>
            {slotCount} sala{slotCount !== 1 ? 's' : ''} disponível{slotCount !== 1 ? 'is' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {propostaEnviada ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 10, background: 'var(--secondary-light)', color: 'var(--secondary-dark)', fontSize: 12, fontWeight: 600 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Proposta enviada
            </div>
          ) : (
            <>
              {/* Botão negar */}
              <button
                onClick={(e) => { e.stopPropagation(); onNegar(card); }}
                title="Ignorar"
                style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid rgba(230,74,25,0.25)', background: 'var(--accent-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </button>

              {is_preferido ? (
                <button
                  onClick={(e) => { e.stopPropagation(); onAceitar(card); }}
                  style={{ height: 34, padding: '0 16px', borderRadius: 8, border: 0, cursor: 'pointer', background: 'linear-gradient(135deg, #5D46B8, #3A2885)', color: '#fff', fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 12, boxShadow: '0 2px 8px rgba(93,70,184,0.3)', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  Aceitar TCC
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); onEnviarProposta(card); }}
                  style={{ height: 34, padding: '0 16px', borderRadius: 8, border: 0, cursor: 'pointer', background: 'linear-gradient(135deg, #5D46B8, #3A2885)', color: '#fff', fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 12, boxShadow: '0 2px 8px rgba(93,70,184,0.3)', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  Enviar proposta
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MatchBar ─────────────────────────────────────────────────────────────────
function MatchBar({ ratio }: { ratio: number }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-3)', fontFamily: 'var(--f-body)' }}>
          {heatLabel(ratio)}
        </span>
        <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 12, color: 'var(--primary)', letterSpacing: -0.3 }}>
          {Math.round(ratio * 100)}%
        </span>
      </div>
      <div style={{ height: 3, borderRadius: 99, background: 'rgba(93,70,184,0.12)', overflow: 'hidden' }}>
        <div style={{ width: `${ratio * 100}%`, height: '100%', borderRadius: 99, background: 'var(--primary)', transition: 'width .5s ease' }} />
      </div>
    </div>
  );
}

// ─── GERAL Card ───────────────────────────────────────────────────────────────
function GeralCard({ card, mentorTopics, onAccept }: { card: any; mentorTopics: string[]; onAccept: (c: any) => void }) {
  const [expanded, setExpanded] = useState(false);
  const cardTopics: string[] = card.tags || [];
  const ratio = matchRatio(mentorTopics, cardTopics);
  const hotTopics = cardTopics.filter((t) => mentorTopics.includes(t));
  const hasMentorTopics = mentorTopics.length > 0;
  const isFullMatch = hasMentorTopics && ratio >= 1;
  const aluno = card.aluno || {};

  const topColor = interpolateHeatColor(hasMentorTopics ? ratio : 0);
  const whiteText = hasMentorTopics && needsWhiteText(ratio);

  const clr = {
    label: whiteText ? 'rgba(255,255,255,0.78)' : 'var(--primary-dark)',
    pct: whiteText ? '#fff' : 'var(--primary-dark)',
    name: whiteText ? '#fff' : 'var(--text)',
    meta: whiteText ? 'rgba(255,255,255,0.7)' : 'var(--text-2)',
    barTrack: whiteText ? 'rgba(255,255,255,0.25)' : 'rgba(93,70,184,0.15)',
    barFill: whiteText ? 'rgba(255,255,255,0.92)' : '#5D46B8',
    chevron: whiteText ? '#fff' : 'var(--primary)',
    chevronBg: whiteText ? 'rgba(255,255,255,0.18)' : 'rgba(93,70,184,0.08)',
    chevronBorder: whiteText ? 'rgba(255,255,255,0.3)' : 'rgba(93,70,184,0.2)',
    ring: whiteText ? 'rgba(255,255,255,0.45)' : 'rgba(93,70,184,0.3)',
    bodyTitle: whiteText ? '#fff' : 'var(--text)',
    bodyDesc: whiteText ? 'rgba(255,255,255,0.8)' : 'var(--text-2)',
    footerBorder: whiteText ? 'rgba(255,255,255,0.18)' : 'var(--border)',
    footerCaption: whiteText ? 'rgba(255,255,255,0.7)' : undefined,
  };

  const grad = avatarGrad(aluno.nome || '?');
  const slotCount = card.disponibilidades?.length ?? 0;

  return (
    <div
      onClick={() => setExpanded((v) => !v)}
      style={{
        overflow: 'hidden', cursor: 'pointer',
        background: isFullMatch
          ? 'linear-gradient(135deg, #5D46B8 0%, #3A2885 100%)'
          : hasMentorTopics
            ? `linear-gradient(180deg, ${topColor} 0%, #ffffff 75%)`
            : '#ffffff',
        border: isFullMatch
          ? '1.5px solid rgba(255,255,255,0.15)'
          : expanded ? `1.5px solid ${topColor}` : '1px solid var(--border)',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        boxShadow: expanded
          ? '0 8px 28px rgba(93,70,184,0.18), 0 1px 2px rgba(18,18,18,0.06)'
          : '0 1px 2px rgba(18,18,18,0.05)',
        borderRadius: 14,
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 14px 0' }}>
        {hasMentorTopics && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: clr.label, fontFamily: 'var(--f-body)' }}>
                {heatLabel(ratio)}
              </span>
              <span style={{ fontFamily: 'var(--f-head)', fontWeight: 800, fontSize: 14, color: clr.pct, letterSpacing: -0.3 }}>
                {Math.round(ratio * 100)}%
              </span>
            </div>
            <div style={{ height: 4, borderRadius: 99, background: clr.barTrack, overflow: 'hidden' }}>
              <div style={{ width: `${ratio * 100}%`, height: '100%', borderRadius: 99, background: clr.barFill, transition: 'width .5s ease' }} />
            </div>
          </div>
        )}

        {/* Aluno row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14 }}>
          <div style={{ boxShadow: `0 0 0 2.5px ${clr.ring}`, borderRadius: '50%', flexShrink: 0 }}>
            <Avatar initials={initials(aluno.nome || '?')} color={grad} size={40} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mx-caption" style={{ fontSize: 10, marginBottom: 2, color: clr.meta }}>{aluno.curso || ''}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: clr.name, lineHeight: 1.2, letterSpacing: -0.2 }}>{aluno.nome || '—'}</div>
          </div>
          <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: clr.chevronBg, border: `1px solid ${clr.chevronBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.22s' }}>
              <path d="M6 9l6 6 6-6" stroke={clr.chevron} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '0 14px' }}>
        <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 14, lineHeight: 1.35, color: clr.bodyTitle, marginBottom: 10 }}>
          {card.titulo}
        </div>
        {expanded && card.descricao && (
          <p style={{ fontSize: 13, color: clr.bodyDesc, lineHeight: 1.55, marginBottom: 12, fontFamily: 'var(--f-body)', animation: 'mxFadeIn 0.18s ease' }}>
            {card.descricao}
          </p>
        )}
        {cardTopics.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
            {cardTopics.map((t) => (
              <TopicBadge key={t} tone={hotTopics.includes(t) ? 'accent' : 'gray'}>
                {hotTopics.includes(t) && (
                  <FaFire size={9} color="var(--accent)" style={{ flexShrink: 0 }} />
                )}
                #{t}
              </TopicBadge>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 14px', borderTop: `1px solid ${clr.footerBorder}` }}>
        <span className="mx-caption" style={{ fontSize: 11, ...(clr.footerCaption && { color: clr.footerCaption }) }}>
          {slotCount} sala{slotCount !== 1 ? 's' : ''} disponível{slotCount !== 1 ? 'is' : ''}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onAccept(card); }}
          style={{ height: 34, padding: '0 16px', borderRadius: 8, border: isFullMatch ? 0 : 0, cursor: 'pointer', background: isFullMatch ? '#fff' : 'linear-gradient(135deg, #5D46B8, #3A2885)', color: isFullMatch ? 'var(--primary-dark)' : '#fff', fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 12, boxShadow: isFullMatch ? '0 2px 8px rgba(0,0,0,0.12)' : '0 2px 8px rgba(93,70,184,0.3)', display: 'flex', alignItems: 'center', gap: 5 }}
        >
          Ver salas
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke={isFullMatch ? 'var(--primary-dark)' : '#fff'} strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const FeedMentoria: React.FC = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState<any[]>([]);
  const [tccItems, setTccItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [confirming, setConfirming] = useState(false);

  const [propostaCard, setPropostaCard] = useState<any>(null);
  const [propostasEnviadas, setPropostasEnviadas] = useState<Set<number>>(new Set());
  const [aceitandoTcc, setAceitandoTcc] = useState<number | null>(null);

  const isTCC = user?.papel === 'PROFESSOR_MENTOR';
  const mentorTopics: string[] = user?.tags_competencia || [];

  useEffect(() => {
    api.get('/feed')
      .then((r) => {
        if (isTCC) setTccItems([...r.data].sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()));
        else setCards(r.data);
      })
      .finally(() => setLoading(false));
  }, [isTCC]);

  const filteredCards = useMemo(() => {
    const byDate = (a: any, b: any) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime();
    const base = [...cards].sort(byDate);
    if (!mentorTopics.length) return base;
    return base
      .filter((card) => {
        const cardTopics: string[] = card.tags || [];
        return cardTopics.some((t) => mentorTopics.includes(t));
      })
      .sort((a, b) => {
        const diff = matchRatio(mentorTopics, b.tags || []) - matchRatio(mentorTopics, a.tags || []);
        return diff !== 0 ? diff : byDate(a, b);
      });
  }, [cards, mentorTopics]);

  const openAccept = async (card: any) => {
    setSelectedCard(card);
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const r = await api.get(`/feed/${card.id}/slots`);
      setSlots(r.data);
    } finally {
      setLoadingSlots(false);
    }
  };

  const aceitar = async () => {
    if (!selectedSlot) return;
    setConfirming(true);
    try {
      await api.post(`/feed/${selectedCard.id}/aceitar`, {
        ambienteId: selectedSlot.ambiente.id,
        data: selectedSlot.data,
        horaInicio: selectedSlot.hora_inicio,
        horaFim: selectedSlot.hora_fim,
      });
      setCards((prev) => prev.filter((c) => c.id !== selectedCard.id));
      setSelectedCard(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao aceitar.');
    } finally {
      setConfirming(false);
    }
  };

  const aceitarTcc = async (card: any) => {
    setAceitandoTcc(card.id);
    try {
      await api.post(`/feed/${card.id}/aceitar-tcc`);
      setTccItems((prev) => prev.filter((item) => item.card.id !== card.id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao aceitar TCC.');
    } finally {
      setAceitandoTcc(null);
    }
  };

  const negarTcc = (card: any) => {
    setTccItems((prev) => prev.filter((item) => item.card.id !== card.id));
  };

  // suppress unused warning
  void aceitandoTcc;

  const preferidos = tccItems.filter((i) => i.is_preferido);
  const geral = tccItems.filter((i) => !i.is_preferido);
  const totalTcc = tccItems.length;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div style={{ padding: '12px 0 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MxLogo size={20} />
            <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 16, letterSpacing: -0.2, color: 'var(--primary-dark)' }}>mentorix</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--primary-dark)', background: 'var(--primary-light)', padding: '2px 6px', borderRadius: 6 }}>
              {isTCC ? 'Orientador' : 'Mentor'}
            </span>
          </div>
        </div>
        <h1 className="mx-h1" style={{ fontSize: 22 }}>{isTCC ? 'Feed TCC' : 'Descobrir'}</h1>
        <p className="mx-caption" style={{ marginTop: 2 }}>
          {loading ? '…' : isTCC
            ? `${totalTcc} ${totalTcc === 1 ? 'solicitação disponível' : 'solicitações disponíveis'}`
            : `${cards.length} ${cards.length === 1 ? 'solicitação disponível' : 'solicitações disponíveis'}`}
        </p>
      </div>

      {/* Competências chip (GERAL only) */}
      {!isTCC && mentorTopics.length > 0 && (
        <div style={{ marginBottom: 14, padding: '10px 12px', borderRadius: 12, background: '#fff', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className="mx-caption" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-3)', flexShrink: 0 }}>Seus assuntos</span>
          {mentorTopics.map((t) => (
            <span key={t} style={{ padding: '3px 8px', borderRadius: 999, background: 'var(--primary-light)', color: 'var(--primary-dark)', fontSize: 11, fontWeight: 500 }}>#{t}</span>
          ))}
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} height={160} />)}
        </div>
      )}

      {/* ─── TCC professor view ─── */}
      {!loading && isTCC && (
        <>
          {preferidos.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--primary)">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Para você · {preferidos.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {preferidos.map((item) => (
                  <TccCard
                    key={item.card.id}
                    item={item}
                    mentorTopics={mentorTopics}
                    onAceitar={aceitarTcc}
                    onEnviarProposta={setPropostaCard}
                    onNegar={negarTcc}
                    propostaEnviada={propostasEnviadas.has(item.card.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {geral.length > 0 && (
            <div>
              {preferidos.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Feed geral · {geral.length}</span>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {geral.map((item) => (
                  <TccCard
                    key={item.card.id}
                    item={item}
                    mentorTopics={mentorTopics}
                    onAceitar={aceitarTcc}
                    onEnviarProposta={setPropostaCard}
                    onNegar={negarTcc}
                    propostaEnviada={propostasEnviadas.has(item.card.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {totalTcc === 0 && (
            <div className="mx-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, margin: '0 auto 14px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2-6-2z" stroke="var(--primary)" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M9 3v16M15 5v16" stroke="var(--primary)" strokeWidth="1.8" />
                </svg>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Nenhuma solicitação de TCC disponível agora.</p>
            </div>
          )}
        </>
      )}

      {/* ─── MENTOR (GERAL) view ─── */}
      {!loading && !isTCC && (
        <>
          {filteredCards.length === 0 && (
            <div className="mx-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, margin: '0 auto 14px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2-6-2z" stroke="var(--primary)" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M9 3v16M15 5v16" stroke="var(--primary)" strokeWidth="1.8" />
                </svg>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Nenhuma solicitação disponível agora.</p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredCards.map((card) => (
              <GeralCard key={card.id} card={card} mentorTopics={mentorTopics} onAccept={openAccept} />
            ))}
          </div>
        </>
      )}

      {/* GERAL slot modal */}
      {selectedCard && !isTCC && (
        <SlotModal card={selectedCard} slots={slots} loading={loadingSlots} selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} onConfirm={aceitar} onClose={() => setSelectedCard(null)} confirming={confirming} />
      )}

      {/* TCC contra-proposta modal */}
      {propostaCard && (
        <ContraPropostaModal
          card={propostaCard}
          onClose={() => setPropostaCard(null)}
          onSent={(cardId) => setPropostasEnviadas((prev) => new Set([...prev, cardId]))}
        />
      )}

      <style>{`@keyframes mxFadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
};
