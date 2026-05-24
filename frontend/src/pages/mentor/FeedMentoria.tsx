import React, { useEffect, useMemo, useState } from 'react';
import api from '../../config/api';
import { Avatar, MxLogo } from '../../components/ui/DesignSystem';
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

// Escala cinza claro (#E8E6F0) → roxo primário (#5D46B8) conforme o ratio
function interpolateHeatColor(ratio: number): string {
  const r = Math.min(1, Math.max(0, ratio));
  const red   = Math.round(232 - 139 * r); // 232→93
  const green = Math.round(230 - 160 * r); // 230→70
  const blue  = Math.round(240 - 56  * r); // 240→184
  return `rgb(${red},${green},${blue})`;
}

function heatLabel(ratio: number): string {
  if (ratio >= 0.8) return 'Match Forte';
  if (ratio >= 0.5) return 'Match Bom';
  if (ratio >= 0.25) return 'Match Parcial';
  if (ratio > 0)    return 'Match Baixo';
  return 'Sem match';
}

// Branco passa WCAG AA somente quando o fundo é escuro o suficiente (~75% de match)
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
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(18,18,18,0.5)',
      backdropFilter: 'blur(6px)', display: 'flex',
      alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 402,
        background: '#fff', borderRadius: '24px 24px 0 0',
        padding: '20px 20px 32px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
        maxHeight: 680, overflowY: 'auto',
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 99,
          background: 'var(--border)', margin: '0 auto 18px',
        }}/>

        <p className="mx-caption" style={{
          textTransform: 'uppercase', fontSize: 9, fontWeight: 700, letterSpacing: 1,
          color: 'var(--primary)', marginBottom: 4,
        }}>Aceitar mentoria</p>
        <h2 style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 17, lineHeight: 1.25, color: 'var(--text)', marginBottom: 3 }}>
          {card?.titulo}
        </h2>
        <p className="mx-caption" style={{ marginBottom: 18, fontSize: 12 }}>
          por {card?.aluno?.nome}
        </p>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} height={56}/>)}
          </div>
        ) : slots.length === 0 ? (
          <p style={{ color: 'var(--text-3)', textAlign: 'center', padding: '20px 0', fontSize: 13 }}>Nenhum slot disponível no momento.</p>
        ) : (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Horários compatíveis</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {slots.map((slot, i) => {
                const on = selectedSlot === slot;
                return (
                  <button key={i} onClick={() => onSelectSlot(slot)} style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 12, cursor: 'pointer', border: on ? '2px solid var(--primary)' : '1px solid var(--border)', background: on ? 'var(--primary-light)' : '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: on ? '5px solid var(--primary)' : '2px solid var(--border)', background: '#fff' }}/>
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

// ─── ContraProposta Modal (TCC sem preferência) ───────────────────────────────
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
        <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--border)', margin: '0 auto 18px' }}/>

        <p className="mx-caption" style={{ textTransform: 'uppercase', fontSize: 9, fontWeight: 700, letterSpacing: 1, color: 'var(--secondary)', marginBottom: 4 }}>
          {'Enviar proposta de orienta\u00e7\u00e3o'}
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
            placeholder={'Apresente-se, fale sobre sua experi\u00eancia com o tema do TCC, como pretende orientar...'}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 12,
              border: '1px solid var(--border)', background: 'var(--surface)',
              fontFamily: 'var(--f-body)', fontSize: 13, color: 'var(--text)',
              resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5,
            }}
          />
          <div style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'right', marginTop: 3 }}>{mensagem.length}/1000</div>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--accent-light)', border: '1px solid var(--accent)', fontSize: 12, color: 'var(--accent-dark)', marginBottom: 14 }}>
            {error}
          </div>
        )}

        <button
          onClick={enviar}
          disabled={sending}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 12, border: 0,
            cursor: sending ? 'not-allowed' : 'pointer',
            background: sending ? 'rgba(46,125,50,0.4)' : 'linear-gradient(135deg, var(--secondary), var(--secondary-dark))',
            color: '#fff', fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 14,
            boxShadow: sending ? 'none' : '0 4px 14px rgba(46,125,50,0.3)',
          }}
        >
          {sending ? 'Enviando…' : 'Enviar proposta →'}
        </button>
        <button onClick={onClose} style={{ width: '100%', marginTop: 10, padding: '12px 0', borderRadius: 12, border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', fontFamily: 'var(--f-body)', fontWeight: 500, fontSize: 14, color: 'var(--text-2)' }}>Cancelar</button>
      </div>
    </div>
  );
}

// ── FeedCard ──────────────────────────────────────────────────
// ─── TCC Card (professor view) ────────────────────────────────────────────────
function TccCard({
  item, onAceitar, onEnviarProposta, propostaEnviada,
}: {
  item: { card: any; is_preferido: boolean; tem_preferencias: boolean };
  onAceitar: (card: any) => void;
  onEnviarProposta: (card: any) => void;
  propostaEnviada: boolean;
}) {
  const { card, is_preferido } = item;
  const [expanded, setExpanded] = useState(false);

  const cardTopics: string[] = card.tags || [];
  const ratio      = matchRatio(mentorTopics, cardTopics);
  const hotTopics  = cardTopics.filter((t) => mentorTopics.includes(t));
  const hasMentor  = mentorTopics.length > 0;
  const isFullMatch = hasMentor && ratio >= 1;

  // Cor de topo: cinza claro (#E8E6F0) → roxo (#5D46B8) proporcional ao ratio
  const topColor  = interpolateHeatColor(hasMentor ? ratio : 0);
  const whiteText = hasMentor && needsWhiteText(ratio);

  // Tokens adaptativos: fundo claro → texto escuro / fundo escuro → texto branco
  const clr = {
    label:    whiteText ? 'rgba(255,255,255,0.78)' : 'var(--primary-dark)',
    pct:      whiteText ? '#fff'                    : 'var(--primary-dark)',
    name:     whiteText ? '#fff'                    : 'var(--text)',
    meta:     whiteText ? 'rgba(255,255,255,0.7)'   : 'var(--text-2)',
    barTrack: whiteText ? 'rgba(255,255,255,0.25)'  : 'rgba(93,70,184,0.15)',
    barFill:  whiteText ? 'rgba(255,255,255,0.92)'  : '#5D46B8',
    chevron:  whiteText ? '#fff'                    : 'var(--primary)',
    chevronBg:whiteText ? 'rgba(255,255,255,0.18)'  : 'rgba(93,70,184,0.08)',
    chevronBorder: whiteText ? 'rgba(255,255,255,0.3)' : 'rgba(93,70,184,0.2)',
    ring:     whiteText ? 'rgba(255,255,255,0.45)'  : 'rgba(93,70,184,0.3)',
    // Tokens para corpo e footer (só mudam no full match)
    bodyTitle:   isFullMatch ? '#fff'                     : 'var(--text)',
    bodyDesc:    isFullMatch ? 'rgba(255,255,255,0.8)'    : 'var(--text-2)',
    footerBorder:isFullMatch ? 'rgba(255,255,255,0.18)'   : 'var(--border)',
    footerIcon:  isFullMatch ? 'rgba(255,255,255,0.65)'   : 'var(--text-3)',
    footerCaption:isFullMatch ? 'rgba(255,255,255,0.7)'   : undefined,
    btnBg:       isFullMatch ? 'rgba(255,255,255,0.95)'   : 'linear-gradient(135deg, #5D46B8, #3A2885)',
    btnColor:    isFullMatch ? '#3A2885'                   : '#fff',
    btnShadow:   isFullMatch ? '0 2px 10px rgba(0,0,0,0.15)' : '0 2px 10px rgba(93,70,184,0.32)',
    btnArrow:    isFullMatch ? '#3A2885'                   : '#fff',
  };

  const aluno    = card.aluno || {};
  const grad     = avatarGrad(aluno.nome || '?');
  const curso    = aluno.curso || '';
  const periodo  = aluno.periodo || aluno.semestre || '';
  const metaLine = [curso, periodo].filter(Boolean).join(' · ');
  const slotCount = card.disponibilidades?.length ?? 0;

  return (
    <div
      onClick={() => setExpanded((v) => !v)}
      style={{
        overflow: 'hidden', cursor: 'pointer',
        // Full match → roxo sólido; parcial → gradiente heat → branco
        background: isFullMatch
          ? 'linear-gradient(135deg, #5D46B8 0%, #3A2885 100%)'
          : `linear-gradient(180deg, ${topColor} 0%, #ffffff 75%)`,
        border: isFullMatch ? '1.5px solid rgba(255,255,255,0.15)' : undefined,
        ...(!isFullMatch && { border: expanded ? `1.5px solid ${topColor}` : '1px solid var(--border)' }),
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        boxShadow: expanded
          ? '0 8px 28px rgba(93,70,184,0.18), 0 1px 2px rgba(18,18,18,0.06)'
          : '0 1px 2px rgba(18,18,18,0.05)',
      }}
    >
      {/* ── Header (transparente — gradiente vem do card) ── */}
      <div style={{ padding: '14px 14px 16px' }}>

        {/* Linha de match */}
        <div style={{ marginBottom: 12 }}>
          {hasMentor ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{
                  fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                  color: clr.label, fontFamily: 'var(--f-body)',
                }}>
                  {heatLabel(ratio)}
                </span>
                <span style={{ fontFamily: 'var(--f-head)', fontWeight: 800, fontSize: 14, color: clr.pct, letterSpacing: -0.3 }}>
                  {Math.round(ratio * 100)}%
                </span>
              </div>
              {/* Barra de progresso */}
              <div style={{ height: 4, borderRadius: 99, background: clr.barTrack, overflow: 'hidden' }}>
                <div style={{
                  width: `${ratio * 100}%`, height: '100%', borderRadius: 99,
                  background: clr.barFill, transition: 'width .5s ease',
                }}/>
              </div>
            </>
          ) : (
            <span style={{
              fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
              color: 'var(--text-3)', fontFamily: 'var(--f-body)',
            }}>
              Nova solicitação
            </span>
          )}
      {/* Destaque banner */}
      {is_preferido && (
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          padding: '6px 14px',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: '#fff' }}>
            {'Voc\u00ea foi escolhido como orientador preferido'}
          </span>
        </div>

        {/* Linha do aluno */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ boxShadow: `0 0 0 2.5px ${clr.ring}`, borderRadius: '50%', flexShrink: 0 }}>
            <Avatar initials={initials(aluno.nome || '?')} color={grad} size={40}/>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: clr.name, lineHeight: 1.2, letterSpacing: -0.2 }}>
              {aluno.nome || '—'}
            </div>
            {metaLine && (
              <div style={{ fontSize: 11, color: clr.meta, marginTop: 2, fontFamily: 'var(--f-body)' }}>
                {metaLine}
              </div>
            )}
          </div>

          {/* Chevron de expandir */}
          <div style={{
            width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
            background: clr.chevronBg, border: `1px solid ${clr.chevronBorder}`,
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.22s' }}>
              <path d="M6 9l6 6 6-6" stroke={clr.chevron} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── Corpo (área branca do gradiente) ── */}
      <div style={{ padding: '12px 14px 0' }}>
        <div style={{
          fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 14,
          lineHeight: 1.35, color: clr.bodyTitle, marginBottom: 10,
        }}>
          {card.titulo}
        </div>

        {/* Description (expanded) */}
        {expanded && card.descricao && (
          <p style={{
            fontSize: 13, color: clr.bodyDesc, lineHeight: 1.55, marginBottom: 12,
            fontFamily: 'var(--f-body)', animation: 'mxFadeIn 0.18s ease',
          }}>
            {card.descricao}
          </p>
        )}

        {cardTopics.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
            {cardTopics.map((t) => (
              <TopicBadge key={t} tone={isFullMatch ? 'accent' : (hotTopics.includes(t) ? 'accent' : 'gray')}>
                {hotTopics.includes(t) && (
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M12 2C9 6 6 8 6 13a6 6 0 1 0 12 0c0-2-1-3-1-5 0-3-3-5-5-6z"/>
                  </svg>
                )}
                #{t}
              </TopicBadge>
            ))}
          </div>
        )}
      </div>
        {/* Document link */}
        {expanded && card.documento_url && (
          <a
            href={card.documento_url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 12px', borderRadius: 10, marginBottom: 12,
              background: 'var(--primary-light)', color: 'var(--primary-dark)',
              fontSize: 12, fontWeight: 600, textDecoration: 'none',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Ver documento do aluno
          </a>
        )}

      {/* ── Footer ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px 14px', borderTop: `1px solid ${clr.footerBorder}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="3" stroke={clr.footerIcon} strokeWidth="1.8" fill="none"/>
            <path d="M3 10h18M8 4v6M16 4v6" stroke={clr.footerIcon} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span className="mx-caption" style={{ fontSize: 11, ...(clr.footerCaption && { color: clr.footerCaption }) }}>
            {slotCount} slot{slotCount !== 1 ? 's' : ''} disponível{slotCount !== 1 ? 'is' : ''}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onAccept(card); }}
          style={{
            padding: '8px 16px', borderRadius: 10, border: 0, cursor: 'pointer',
            background: clr.btnBg,
            color: clr.btnColor, fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 12,
            boxShadow: clr.btnShadow,
            display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          Ver slots
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke={clr.btnArrow} strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </button>

          {propostaEnviada ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '7px 12px', borderRadius: 10,
              background: 'var(--secondary-light)', color: 'var(--secondary-dark)',
              fontSize: 12, fontWeight: 600,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Proposta enviada
            </div>
          ) : is_preferido ? (
            <button
              onClick={(e) => { e.stopPropagation(); onAceitar(card); }}
              style={{
                padding: '8px 16px', borderRadius: 10, border: 0, cursor: 'pointer',
                background: 'linear-gradient(135deg, #5D46B8, #3A2885)',
                color: '#fff', fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 12,
                boxShadow: '0 2px 10px rgba(93,70,184,0.35)',
              }}
            >
              Aceitar TCC →
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onEnviarProposta(card); }}
              style={{
                padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
                border: '1.5px solid var(--secondary)', background: 'var(--secondary-light)',
                color: 'var(--secondary-dark)', fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 12,
              }}
            >
              Enviar proposta →
            </button>
          )}
        </div>
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
  const aluno = card.aluno || {};

  return (
    <div onClick={() => setExpanded((v) => !v)} className="mx-card" style={{ overflow: 'hidden', cursor: 'pointer', border: expanded ? '1.5px solid var(--primary)' : '1px solid transparent', transition: 'border-color 0.15s' }}>
      {hasMentorTopics && <div style={{ padding: '12px 14px 0' }}><MatchBar ratio={ratio}/></div>}
      <div style={{ padding: hasMentorTopics ? '0 14px 14px' : '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Avatar initials={initials(aluno.nome || '?')} color={avatarGrad(aluno.nome || '?')} size={38}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mx-caption" style={{ fontSize: 10, marginBottom: 2, color: 'var(--text-3)' }}>{aluno.curso || ''}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>{aluno.nome || '—'}</div>
          </div>
          <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: expanded ? 'var(--primary)' : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <path d="M6 9l6 6 6-6" stroke={expanded ? '#fff' : 'var(--text-3)'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: 'var(--text)', marginBottom: 10 }}>{card.titulo}</div>
        {expanded && card.descricao && (
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55, marginBottom: 12, fontFamily: 'var(--f-body)', animation: 'mxFadeIn 0.2s ease' }}>{card.descricao}</p>
        )}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
          {cardTopics.map((t) => (
            <span key={t} style={{
              padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 500,
              background: hotTopics.includes(t) ? 'var(--primary)' : 'var(--surface)',
              color: hotTopics.includes(t) ? '#fff' : 'var(--text-2)',
              border: `1px solid ${hotTopics.includes(t) ? 'var(--primary)' : 'var(--border)'}`,
            }}>#{t}</span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          <span className="mx-caption" style={{ fontSize: 11 }}>{card.disponibilidades?.length ?? 0} slot{(card.disponibilidades?.length ?? 0) !== 1 ? 's' : ''} disponível</span>
          <button onClick={(e) => { e.stopPropagation(); onAccept(card); }} style={{ padding: '8px 14px', borderRadius: 10, border: 0, cursor: 'pointer', background: 'linear-gradient(135deg, #5D46B8, #3A2885)', color: '#fff', fontFamily: 'var(--f-body)', fontWeight: 600, fontSize: 12, boxShadow: '0 2px 8px rgba(93,70,184,0.3)' }}>
            Ver slots →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FeedMentoria (página principal) ──────────────────────────
// ─── Main Component ───────────────────────────────────────────────────────────
export const FeedMentoria: React.FC = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState<any[]>([]);
  const [tccItems, setTccItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // GERAL modal state
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [confirming, setConfirming] = useState(false);

  // TCC state
  const [propostaCard, setPropostaCard] = useState<any>(null);
  const [propostasEnviadas, setPropostasEnviadas] = useState<Set<number>>(new Set());
  const [aceitandoTcc, setAceitandoTcc] = useState<number | null>(null);

  const isTCC = user?.papel === 'PROFESSOR_MENTOR';
  const mentorTopics: string[] = user?.tags_competencia || [];

  useEffect(() => {
    api.get('/feed')
      .then((r) => {
        if (isTCC) setTccItems(r.data);
        else setCards(r.data);
      })
      .finally(() => setLoading(false));
  }, [isTCC]);

  // Filtra cards com pelo menos 1 match e ordena por maior match primeiro
  const filteredCards = useMemo(() => {
    if (!mentorTopics.length) return cards;
    return cards
      .filter((card) => {
        const cardTopics: string[] = card.tags || [];
        return cardTopics.some((t) => mentorTopics.includes(t));
      })
      .sort((a, b) => {
        const ratioA = matchRatio(mentorTopics, a.tags || []);
        const ratioB = matchRatio(mentorTopics, b.tags || []);
        return ratioB - ratioA;
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

  const firstName = user?.nome?.split(' ')[0] || '';

  // ─── TCC feed sections ───
  const preferidos = tccItems.filter((i) => i.is_preferido);
  const geral = tccItems.filter((i) => !i.is_preferido);
  const totalTcc = tccItems.length;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div style={{ padding: '12px 0 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MxLogo size={20}/>
            <span style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 16, letterSpacing: -0.2, color: 'var(--primary-dark)' }}>mentorix</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--primary-dark)', background: 'var(--primary-light)', padding: '2px 6px', borderRadius: 6 }}>
              {isTCC ? 'Orientador' : 'Mentor'}
            </span>
          </div>
        </div>
        <h1 className="mx-h1" style={{ fontSize: 22 }}>{isTCC ? 'Feed TCC' : 'Descobrir'}</h1>
        <p className="mx-caption" style={{ marginTop: 2 }}>
          {loading ? '…' : `${filteredCards.length} solicitação${filteredCards.length !== 1 ? 'ões' : ''} disponível${filteredCards.length !== 1 ? 'is' : ''}`}
          {loading ? '\u2026' : isTCC
            ? `${totalTcc} ${totalTcc === 1 ? 'solicita\u00e7\u00e3o dispon\u00edvel' : 'solicita\u00e7\u00f5es dispon\u00edveis'}`
            : `${cards.length} ${cards.length === 1 ? 'solicita\u00e7\u00e3o dispon\u00edvel' : 'solicita\u00e7\u00f5es dispon\u00edveis'}`}
        </p>
      </div>

      {/* MENTOR: competências */}
      {!isTCC && mentorTopics.length > 0 && (
        <div style={{ marginBottom: 14, padding: '10px 12px', borderRadius: 12, background: '#fff', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className="mx-caption" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-3)', flexShrink: 0 }}>Seus assuntos</span>
          {mentorTopics.map((t) => (
            <span key={t} style={{ padding: '3px 8px', borderRadius: 999, background: 'var(--primary-light)', color: 'var(--primary-dark)', fontSize: 11, fontWeight: 500 }}>#{t}</span>
          ))}
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1,2,3].map((i) => <Skeleton key={i} height={160}/>)}</div>
      )}

      {/* ─── TCC professor view ─── */}
      {!loading && isTCC && (
        <>
          {/* Preferred section */}
          {preferidos.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--primary)">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {'Para voc\u00ea \u00b7 '}{preferidos.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {preferidos.map((item) => (
                  <TccCard
                    key={item.card.id}
                    item={item}
                    onAceitar={aceitarTcc}
                    onEnviarProposta={setPropostaCard}
                    propostaEnviada={propostasEnviadas.has(item.card.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* General feed section */}
          {geral.length > 0 && (
            <div>
              {preferidos.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{'Feed geral \u00b7 '}{geral.length}</span>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {geral.map((item) => (
                  <TccCard
                    key={item.card.id}
                    item={item}
                    onAceitar={aceitarTcc}
                    onEnviarProposta={setPropostaCard}
                    propostaEnviada={propostasEnviadas.has(item.card.id)}
                  />
                ))}
              </div>
            </div>
          )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} height={180}/>)}
        </div>
      )}

          {totalTcc === 0 && (
            <div className="mx-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, margin: '0 auto 14px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2-6-2z" stroke="var(--primary)" strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="M9 3v16M15 5v16" stroke="var(--primary)" strokeWidth="1.8"/>
                </svg>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-2)' }}>{'Nenhuma solicita??o de TCC dispon?vel agora.'}</p>
            </div>
          )}
        </>
      )}

      {/* ─── MENTOR (GERAL) view ─── */}
      {!loading && !isTCC && (
        <>
          {cards.length === 0 && (
            <div className="mx-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, margin: '0 auto 14px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2-6-2z" stroke="var(--primary)" strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 3v16M15 5v16" stroke="var(--primary)" strokeWidth="1.8"/></svg>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Nenhuma solicitação disponível agora.</p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cards.map((card) => (
              <GeralCard key={card.id} card={card} mentorTopics={mentorTopics} onAccept={openAccept}/>
            ))}
          </div>
        </>
      {!loading && filteredCards.length === 0 && (
        <div className="mx-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, margin: '0 auto 14px',
            background: 'var(--primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2-6-2z" stroke="var(--primary)" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M9 3v16M15 5v16" stroke="var(--primary)" strokeWidth="1.8"/>
            </svg>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Nenhuma solicitação disponível agora.</p>
        </div>
      )}

      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredCards.map((card) => (
            <FeedCard
              key={card.id}
              card={card}
              mentorTopics={mentorTopics}
              onAccept={openAccept}
            />
          ))}
        </div>
      )}

      {/* GERAL slot modal */}
      {selectedCard && !isTCC && (
        <SlotModal card={selectedCard} slots={slots} loading={loadingSlots} selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} onConfirm={aceitar} onClose={() => setSelectedCard(null)} confirming={confirming}/>
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
