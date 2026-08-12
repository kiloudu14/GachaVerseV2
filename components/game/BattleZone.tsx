'use client';
import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUltimateStore } from '@/store/ultimateStore';
import { ActiveUltsBar, UltCombatOverlay } from '@/components/game/UltAnimation';
import { PixelSprite } from '@/components/ui/PixelSprite';
import { CharacterCardThumb } from '@/components/ui/CharacterCardThumb';
import { useFallbackImage, buildImageCandidates } from '@/lib/image-fallback';
import { formatNumber } from '@/lib/game/format';
import { getPalierConfig, RARITY_CONFIG } from '@/types/game';
import { PALIER_DROPS } from '@/lib/game/expeditions';
import { getAffinityForId } from '@/lib/game/affinities';
import { parseInstanceKey } from '@/lib/game/editions';
import { AffinityBadge } from '@/components/ui/AffinityBadge';
import { RandomEventOverlay } from '@/components/game/events/RandomEventOverlay';
import { getCharacterById, getCharFormName } from '@/lib/game/characters';
import { getEquipmentDef } from '@/lib/game/items';
import { computeActiveSynergies } from '@/lib/game/synergies';
import { BattleParticles } from '@/components/game/BattleParticles';

interface Dmg { id: number; x: number; y: number; val: number; crit: boolean; }

function PalierBg({ palier, gradient }: { palier: number; gradient: string }) {
  const { src, failed, onError } = useFallbackImage(buildImageCandidates(`/backgrounds/bg_palier_${palier}`));
  if (!failed && src) return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt=""
        onError={onError}
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', imageRendering:'pixelated' }} />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(0,0,0,0.4) 0%,transparent 25%,transparent 60%,rgba(0,0,0,0.85) 100%)' }} />
    </>
  );
  return <div style={{ position:'absolute', inset:0, background:gradient }} />;
}

// ── Carte alliée style gacha ──────────────────────────────────────────────
function AllyCard({ templateId, onManage }: { templateId: string; onManage: () => void }) {
  const { collection, activateCharacterUltimate, getCharDpsBreakdown } = useGameStore();
  const { cooldowns, activeUlts } = useUltimateStore();
  const pureId = parseInstanceKey(templateId).templateId; // clé composite -> id pur (art/nom/ulti partagés entre éditions)
  const tpl   = getCharacterById(pureId);
  const owned = collection[templateId];

  // Slot vide
  if (!tpl || !owned) return (
    <div onClick={onManage} style={{ width:'100%', display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor:'pointer', opacity:0.5 }}>
      <div style={{ width:'100%', aspectRatio:'306 / 517', border:'2px dashed rgba(255,255,255,0.12)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.02)', flexDirection:'column', gap:6 }}>
        <span style={{ fontSize:22, color:'rgba(255,255,255,0.2)' }}>+</span>
        <span style={{ fontFamily:'var(--f-ui)', fontSize:9, color:'rgba(255,255,255,0.2)', fontWeight:600, letterSpacing:1 }}>VIDE</span>
      </div>
    </div>
  );

  const cd       = cooldowns[templateId] ?? 0;
  const ready    = cd === 0;
  const isActive = activeUlts.some(a => a.templateId === templateId);
  const mins     = Math.floor(cd / 60);
  const secs     = cd % 60;
  const ultLabel = `${mins}:${String(secs).padStart(2,'0')}`;
  const formIdx  = owned.currentForm;
  const name     = getCharFormName(tpl, formIdx);

  const rc = RARITY_CONFIG[tpl.rarity];
  const { base, typeMult, final } = getCharDpsBreakdown(templateId);
  const strong = typeMult > 1, weak = typeMult < 1;
  const multCol = strong ? '#4ade80' : weak ? '#f87171' : 'rgba(255,255,255,0.5)';
  const multTxt = typeMult === 1 ? 'OK' : `×${typeMult}`;
  const finalCol = strong ? '#4ade80' : weak ? '#f87171' : 'var(--green)';

  return (
    <div style={{
      width: '100%', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, rgba(20,14,40,0.96), rgba(10,8,20,0.96))',
      border: `1.5px solid ${isActive ? '#c084fc' : ready ? '#fbbf24aa' : rc.color + '55'}`,
      boxShadow: isActive ? '0 0 14px #c084fc77' : ready ? `0 0 10px ${rc.glow}44` : '0 3px 12px rgba(0,0,0,0.5)',
      transition: 'box-shadow 0.2s, border-color 0.2s',
    }}>
      {/* Illustration (le nom est déjà sur la carte) — cliquable pour l'ult */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '306 / 517', cursor: ready ? 'pointer' : 'default' }}
        onClick={() => ready && activateCharacterUltimate(templateId, formIdx)}>
        <CharacterCardThumb templateId={pureId} formIndex={formIdx} name={name} rarity={tpl.rarity} edition={owned.edition}
          width={88} height={149} style={{ border: 'none', boxShadow: 'none', borderRadius: 0, objectFit: 'contain', width: '100%', height: '100%' }} />

        {/* Niveau + rang — overlay haut-gauche */}
        <div style={{ position: 'absolute', top: 4, left: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ fontFamily: 'var(--f-num)', fontSize: 8, fontWeight: 800, color: '#fff', background: 'rgba(0,0,0,0.72)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 4, padding: '1px 4px' }}>LV{owned.level}</span>
          {owned.rank > 0 && <span style={{ fontFamily: 'var(--f-num)', fontSize: 8, fontWeight: 800, color: '#fbbf24', background: 'rgba(0,0,0,0.72)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: 4, padding: '1px 4px' }}>★{owned.rank}</span>}
        </div>

        {/* Ult — overlay haut-droit */}
        <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', alignItems: 'center', gap: 2,
          background: ready ? 'rgba(88,28,135,0.92)' : 'rgba(0,0,0,0.72)',
          border: ready ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.15)',
          borderRadius: 4, padding: '1px 4px' }}>
          <span style={{ fontSize: 7 }}>{ready ? '⚡' : '⏳'}</span>
          <span style={{ fontFamily: 'var(--f-ui)', fontWeight: 800, fontSize: 7, color: ready ? '#fde68a' : 'rgba(255,255,255,0.55)', letterSpacing: 0.3 }}>
            {ready ? 'PRÊT' : ultLabel}
          </span>
        </div>

      </div>

      {/* Pied : BASE | TYPE | DPS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center', padding: '5px 4px', background: 'rgba(0,0,0,0.32)', borderTop: `1px solid ${rc.color}22`, gap: 2 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--f-num)', fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.7)', lineHeight: 1 }}>{formatNumber(base)}</div>
          <div style={{ fontFamily: 'var(--f-ui)', fontSize: 6.5, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5, marginTop: 2 }}>BASE</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--f-num)', fontSize: 10, fontWeight: 900, color: multCol, lineHeight: 1 }}>{multTxt}</div>
          <div style={{ fontFamily: 'var(--f-ui)', fontSize: 6.5, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5, marginTop: 2 }}>TYPE</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--f-num)', fontSize: 11, fontWeight: 900, color: finalCol, lineHeight: 1 }}>{formatNumber(final)}</div>
          <div style={{ fontFamily: 'var(--f-ui)', fontSize: 6.5, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5, marginTop: 2 }}>DPS</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Barre des boosts BossCrown actifs (+20% DPS / +20% Or) ───────────────
function ActiveBoostsBar() {
  const { dpsBoostEndsAt, goldBoostEndsAt, isDpsBoostActive, isGoldBoostActive } = useGameStore();
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const dpsActive  = isDpsBoostActive();
  const goldActive = isGoldBoostActive();
  if (!dpsActive && !goldActive) return null;

  const fmt = (endsAt: number) => {
    const s = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
    return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  };

  return (
    <div style={{ position:'relative', zIndex:3, display:'flex', gap:8, padding:'0 18px 8px', flexShrink:0 }}>
      {dpsActive && (
        <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(248,113,113,0.12)', border:'1px solid rgba(248,113,113,0.4)', borderRadius:8, padding:'4px 10px' }}>
          <span style={{ fontSize:12 }}>⚡</span>
          <span style={{ fontFamily:'var(--f-ui)', fontWeight:700, fontSize:11, color:'#f87171' }}>+20% DPS — {fmt(dpsBoostEndsAt)}</span>
        </div>
      )}
      {goldActive && (
        <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(74,222,128,0.12)', border:'1px solid rgba(74,222,128,0.4)', borderRadius:8, padding:'4px 10px' }}>
          <span style={{ fontSize:12 }}>💰</span>
          <span style={{ fontFamily:'var(--f-ui)', fontWeight:700, fontSize:11, color:'#4ade80' }}>+20% Or — {fmt(goldBoostEndsAt)}</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Formulaire d'excuse (déclenché par l'anti-autoclick) ──────────────────
interface ApologyOverlayProps {
  strikeLevel: number;
  detectionReason: string;
  onSubmit: (text: string) => Promise<void>;
}

function ApologyOverlay({ strikeLevel, onSubmit }: ApologyOverlayProps) {
  const [text, setText]       = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState('');
  const MIN_LENGTH = 80;

  const handleSubmit = async () => {
    if (text.trim().length < MIN_LENGTH) {
      setError(`Tes excuses doivent faire au moins ${MIN_LENGTH} caractères. On veut de vraies excuses, pas du remplissage.`);
      return;
    }
    setSending(true);
    setError('');
    await onSubmit(text);
    setSending(false);
  };

  const strikeColor = strikeLevel >= 3 ? '#f87171' : strikeLevel === 2 ? '#fb923c' : '#fbbf24';
  const strikeMsgs  = [
    '',
    '⚠️ C\'est ton 1er avertissement. Une prochaine fois et les sanctions seront plus lourdes.',
    '🚨 2ème strike. Tu joues avec le feu. Le prochain, c\'est un ban définitif.',
    '🔒 3ème strike. On garde tout. Un autre écart et tu dis adieu à ton compte.',
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 20,
      background: 'rgba(3,2,12,0.95)', backdropFilter: 'blur(6px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 0, borderRadius: 12, padding: '24px 20px', overflowY: 'auto',
    }}>
      {/* En-tête */}
      <div style={{ fontSize: 40, marginBottom: 10 }}>🤖</div>
      <div style={{ fontFamily: 'var(--f-title)', fontSize: 17, fontWeight: 800, color: '#f87171', letterSpacing: 2, textAlign: 'center', marginBottom: 6 }}>
        AUTOCLICK DÉTECTÉ
      </div>

      {/* Badge strike */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14,
        background: `${strikeColor}18`, border: `1px solid ${strikeColor}66`,
        borderRadius: 8, padding: '4px 14px',
      }}>
        <span style={{ fontFamily: 'var(--f-ui)', fontWeight: 800, fontSize: 11, color: strikeColor, letterSpacing: 1 }}>
          STRIKE {strikeLevel}
        </span>
      </div>

      {/* Message sérieux */}
      <div style={{
        background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: 10, padding: '12px 16px', marginBottom: 14, maxWidth: 400,
      }}>
        <p style={{ fontFamily: 'var(--f-ui)', fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, margin: 0, textAlign: 'center' }}>
          On sait très bien ce que tu as fait.<br />
          <strong style={{ color: '#fbbf24' }}>Écris une vraie lettre d'excuse</strong> pour récupérer l'accès au jeu.<br />
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
            Toutes les excuses sont enregistrées avec ton pseudo et conservées par l'équipe.
            Un comportement répété entraînera la <strong style={{ color: '#f87171' }}>suspension définitive de ton compte</strong>.
          </span>
        </p>
      </div>

      {strikeLevel >= 2 && (
        <div style={{ fontFamily: 'var(--f-ui)', fontSize: 11, color: strikeColor, marginBottom: 12, textAlign: 'center', fontWeight: 700 }}>
          {strikeMsgs[Math.min(strikeLevel, 3)]}
        </div>
      )}

      {/* Textarea */}
      <div style={{ width: '100%', maxWidth: 420, marginBottom: 10 }}>
        <div style={{ fontFamily: 'var(--f-ui)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, marginBottom: 6 }}>
          TA LETTRE D'EXCUSE ({text.trim().length}/{MIN_LENGTH} caractères minimum)
        </div>
        <textarea
          value={text}
          onChange={e => { setText(e.target.value); setError(''); }}
          placeholder="Bonjour, je reconnais avoir utilisé un autoclick sur GachaVerse. Je m'en excuse sincèrement car..."
          rows={6}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.04)', border: `1px solid ${error ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: 8, padding: '10px 12px', resize: 'vertical',
            fontFamily: 'var(--f-ui)', fontSize: 12, color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.6, outline: 'none',
          }}
        />
        {/* Barre de progression longueur */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginTop: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 4, transition: 'width 0.2s, background 0.2s',
            width: `${Math.min(100, (text.trim().length / MIN_LENGTH) * 100)}%`,
            background: text.trim().length >= MIN_LENGTH ? '#4ade80' : '#fbbf24',
          }} />
        </div>
        {error && (
          <div style={{ fontFamily: 'var(--f-ui)', fontSize: 11, color: '#f87171', marginTop: 6, lineHeight: 1.4 }}>
            {error}
          </div>
        )}
      </div>

      {/* Bouton envoyer */}
      <button
        onClick={handleSubmit}
        disabled={sending || text.trim().length < MIN_LENGTH}
        className="btn-primary"
        style={{
          width: '100%', maxWidth: 420, padding: '12px 20px',
          fontFamily: 'var(--f-title)', fontSize: 14, letterSpacing: 2,
          opacity: (sending || text.trim().length < MIN_LENGTH) ? 0.45 : 1,
          cursor: (sending || text.trim().length < MIN_LENGTH) ? 'not-allowed' : 'pointer',
        }}
      >
        {sending ? '⏳ ENVOI EN COURS...' : '✉️ ENVOYER MES EXCUSES'}
      </button>

      <div style={{ fontFamily: 'var(--f-ui)', fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 12, textAlign: 'center', letterSpacing: 0.5 }}>
        DPS & DPC EN PAUSE — LE JEU REPRENDRA APRÈS VALIDATION
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sélecteur de palier : voyager vers un palier déjà atteint pour re-farmer.
// Marque les paliers qui possèdent un drop exclusif (source d'expédition).
const DROPS_BY_PALIER: Record<number, { icon: string; name: string }[]> = (() => {
  const m: Record<number, { icon: string; name: string }[]> = {};
  for (const d of PALIER_DROPS) {
    (m[d.palier] ??= []).push({ icon: d.icon, name: d.name });
  }
  return m;
})();

function PalierTravelModal({
  current, maxReached, onTravel, onClose,
}: {
  current: number; maxReached: number;
  onTravel: (p: number) => void; onClose: () => void;
}) {
  const paliers = Array.from({ length: maxReached }, (_, i) => i + 1);
  return (
    <div
      onClick={onClose}
      style={{ position:'absolute', inset:0, zIndex:40, background:'rgba(3,2,8,0.82)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="panel panel--glow"
        style={{ width:'min(720px,100%)', maxHeight:'86%', display:'flex', flexDirection:'column', padding:0, overflow:'hidden' }}
      >
        {/* En-tête */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
            <span style={{ fontFamily:'var(--f-title)', fontSize:16, fontWeight:700, color:'var(--purple-glow)', letterSpacing:2 }}>🗺 CARTE DES MONDES</span>
            <span style={{ fontFamily:'var(--f-ui)', fontSize:10, color:'var(--text-sub)', letterSpacing:0.5 }}>
              Voyage vers un palier déjà atteint pour re-farmer coins &amp; ressources
            </span>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding:'6px 12px', fontSize:12 }}>✕</button>
        </div>

        {/* Grille des paliers */}
        <div style={{ overflowY:'auto', padding:16, display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10 }}>
          {paliers.map(p => {
            const cfg     = getPalierConfig(p);
            const drops   = DROPS_BY_PALIER[p] ?? [];
            const isHere  = p === current;
            return (
              <button
                key={p}
                onClick={() => { onTravel(p); onClose(); }}
                disabled={isHere}
                style={{
                  position:'relative', textAlign:'left', cursor:isHere?'default':'pointer',
                  background:isHere ? 'rgba(109,63,214,0.18)' : 'rgba(0,0,0,0.35)',
                  border:`1px solid ${isHere ? 'var(--purple-glow)' : cfg.accentColor + '44'}`,
                  borderRadius:10, padding:'10px 12px',
                  boxShadow:isHere ? '0 0 18px rgba(192,132,252,0.28)' : 'none',
                  transition:'transform 0.12s, box-shadow 0.12s, border-color 0.12s',
                }}
                onMouseEnter={e => { if (!isHere) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.borderColor=cfg.accentColor; } }}
                onMouseLeave={e => { if (!isHere) { e.currentTarget.style.transform='none'; e.currentTarget.style.borderColor=cfg.accentColor+'44'; } }}
              >
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                  <span style={{ fontFamily:'var(--f-num)', fontWeight:900, fontSize:13, color:cfg.accentColor }}>P{p}</span>
                  {isHere && <span style={{ fontFamily:'var(--f-ui)', fontSize:8, fontWeight:800, color:'var(--purple-glow)', letterSpacing:1, border:'1px solid var(--purple-glow)', borderRadius:4, padding:'1px 5px' }}>ICI</span>}
                  {drops.length > 0 && (
                    <span title={drops.map(d => d.name).join(', ')} style={{ marginLeft:'auto', fontSize:12, filter:'drop-shadow(0 0 4px rgba(245,158,11,0.6))' }}>
                      {drops.map(d => d.icon).join('')}
                    </span>
                  )}
                </div>
                <div style={{ fontFamily:'var(--f-ui)', fontWeight:700, fontSize:11, color:'white', lineHeight:1.15, marginBottom:1 }}>{cfg.name}</div>
                <div style={{ fontFamily:'var(--f-ui)', fontSize:9, color:'var(--text-sub)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{cfg.universe}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export function BattleZone() {
  const { currentEnemy, equippedTeam, getTotalDps, retreatFromBoss, challengeBoss, travelToPalier, wave, palier, maxPalierReached, bossActive, bossAvoided, bossTimeLeft, lastEquipmentDrop, setLastEquipmentDrop, ultUsedThisFight, getEventDpsMult } = useGameStore();
  const [dmgs, setDmgs] = useState<Dmg[]>([]);
  const [showTravel, setShowTravel] = useState(false);
  const ultStore    = useUltimateStore();
  const dpsUltMult  = ultStore.activeUlts.reduce((m, a) => m * (a.effect.dpsMultiplier ?? 1), 1);
  const dps = Math.floor(getTotalDps()); // inclut déjà dpsMultiplier/selfDpsMultiplier (calculé dans gameStore)
  const cfg = getPalierConfig(palier);
  const isFarming = palier < maxPalierReached; // voyage sur un palier déjà validé
  const hp  = (currentEnemy.currentHp / currentEnemy.maxHp) * 100;
  const bossWarn = bossActive && bossTimeLeft <= 10;

  // ── Idle : dégâts automatiques (feedback visuel du DPS, sans clic) ────────
  useEffect(() => {
    if (dps <= 0 || currentEnemy.currentHp <= 0) return;
    const id = setInterval(() => {
      const d: Dmg = {
        id: Date.now() + Math.random(),
        x: 40 + Math.random() * 40,   // % approx dans la zone
        y: 30 + Math.random() * 30,
        val: dps,
        crit: false,
      };
      setDmgs(p => [...p, d]);
      setTimeout(() => setDmgs(p => p.filter(x => x.id !== d.id)), 800);
    }, 750);
    return () => clearInterval(id);
  }, [dps, currentEnemy.currentHp]);

  return (
    <div style={{ position:'relative', width:'100%', height:'100%', borderRadius:12, overflow:'hidden', border:'1px solid var(--border)', display:'flex', flexDirection:'column' }}>
      <PalierBg palier={palier} gradient={cfg.bgGradient} />
      <BattleParticles accentColor={cfg.accentColor} isBoss={currentEnemy?.isBoss} />

      {/* Événements aléatoires (mobs normaux uniquement) */}
      <RandomEventOverlay />

      {/* Sélecteur de palier (voyage) */}
      {showTravel && (
        <PalierTravelModal
          current={palier}
          maxReached={maxPalierReached}
          onTravel={travelToPalier}
          onClose={() => setShowTravel(false)}
        />
      )}

      {/* Timer boss */}
      {bossActive && (
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, zIndex:5 }}>
          <div style={{ height:'100%', width:`${(bossTimeLeft/cfg.bossTimerSeconds)*100}%`, background:bossWarn?'#ef4444':'#dc2626', transition:'width 1s linear', boxShadow:bossWarn?'0 0 10px #ef4444':undefined }} />
        </div>
      )}

      {/* HUD top */}
      <div style={{ position:'relative', zIndex:3, padding:'12px 18px 10px', background:'linear-gradient(180deg,rgba(0,0,0,0.7) 0%,transparent 100%)', flexShrink:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, gap:8, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <span style={{ fontFamily:'var(--f-ui)', fontWeight:800, fontSize:10, color:cfg.accentColor, letterSpacing:2 }}>{cfg.universe.toUpperCase()}</span>
            <span style={{ color:'rgba(255,255,255,0.2)' }}>·</span>
            <span style={{ fontFamily:'var(--f-ui)', fontSize:9, color:'rgba(255,255,255,0.3)', letterSpacing:1 }}>{cfg.arc}</span>
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:currentEnemy.isBoss?'rgba(127,29,29,0.8)':isFarming?'rgba(52,211,153,0.15)':'rgba(0,0,0,0.5)', border:`1px solid ${currentEnemy.isBoss?'rgba(239,68,68,0.5)':isFarming?'rgba(52,211,153,0.5)':cfg.accentColor+'33'}`, borderRadius:6, padding:'2px 10px' }}>
              <span style={{ fontFamily:'var(--f-ui)', fontWeight:700, fontSize:10, color:currentEnemy.isBoss?'#f87171':isFarming?'#34d399':cfg.accentColor }}>
                {currentEnemy.isBoss ? '★ BOSS' : isFarming ? `🔁 FARM · ÉTAGE ${wave}/9` : `ÉTAGE ${wave} / 10`}
              </span>
            </div>
            {maxPalierReached > 1 && (
              <button
                onClick={e => { e.stopPropagation(); if (!bossActive) setShowTravel(true); }}
                disabled={bossActive}
                title={bossActive ? 'Impossible pendant un boss' : 'Voyager vers un palier déjà atteint'}
                style={{
                  display:'inline-flex', alignItems:'center', gap:5,
                  background:'rgba(109,63,214,0.22)', border:'1px solid var(--purple-glow)',
                  borderRadius:6, padding:'2px 10px', cursor:bossActive?'not-allowed':'pointer',
                  opacity:bossActive?0.4:1, transition:'opacity 0.15s',
                }}
              >
                <span style={{ fontSize:11 }}>🗺</span>
                <span style={{ fontFamily:'var(--f-ui)', fontWeight:800, fontSize:10, color:'var(--purple-glow)', letterSpacing:1 }}>VOYAGER</span>
              </button>
            )}
            {isFarming && (
              <button
                onClick={e => { e.stopPropagation(); travelToPalier(maxPalierReached); }}
                title={`Retourner à ta progression actuelle (palier ${maxPalierReached})`}
                style={{
                  display:'inline-flex', alignItems:'center', gap:5,
                  background:'rgba(52,211,153,0.18)', border:'1px solid #34d399',
                  borderRadius:6, padding:'2px 10px', cursor:'pointer', transition:'filter 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter='brightness(1.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter='none'; }}
              >
                <span style={{ fontSize:11 }}>↩</span>
                <span style={{ fontFamily:'var(--f-ui)', fontWeight:800, fontSize:10, color:'#34d399', letterSpacing:1 }}>RETOUR · P{maxPalierReached}</span>
              </button>
            )}
          </div>
          {bossActive && (
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(127,29,29,0.85)', border:'1px solid rgba(239,68,68,0.5)', borderRadius:8, padding:'5px 14px' }}>
              <span style={{ fontSize:13, animation:'warnFlash 0.5s infinite' }}>⚠</span>
              <span style={{ fontFamily:'var(--f-ui)', fontWeight:700, fontSize:13, color:'#f87171' }}>BOSS — {bossTimeLeft}s</span>
            </div>
          )}
          {isFarming && !bossActive && (
            <div style={{ display:'flex', alignItems:'center', gap:7, background:'rgba(52,211,153,0.12)', border:'1px solid rgba(52,211,153,0.4)', borderRadius:8, padding:'4px 12px' }}>
              <span style={{ fontSize:12 }}>🔁</span>
              <span style={{ fontFamily:'var(--f-ui)', fontWeight:700, fontSize:11, color:'#34d399' }}>Farm en boucle · boss désactivé</span>
            </div>
          )}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:8 }}>
          <h2 style={{ fontFamily:'var(--f-title)', fontSize:currentEnemy.isBoss?'18px':'15px', fontWeight:700, color:'white', letterSpacing:2, textShadow:currentEnemy.isBoss?'0 0 24px rgba(239,68,68,0.7)':'0 0 16px rgba(255,255,255,0.2)', margin:0 }}>
            {currentEnemy.name}
          </h2>
          <AffinityBadge affinity={getAffinityForId(currentEnemy.name)} size="sm" />
          {(() => {
            const em = getEventDpsMult();
            if (em === 1) return null;
            const buff = em > 1;
            return (
              <span style={{ fontFamily:'var(--f-num)', fontWeight:800, fontSize:11, padding:'2px 8px', borderRadius:999,
                color: buff ? '#4ade80' : '#f87171',
                background: buff ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                border: `1px solid ${buff ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)'}` }}>
                {buff ? '🔥' : '💀'} ×{em.toFixed(2)} DPS
              </span>
            );
          })()}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
          <span style={{ fontFamily:'var(--f-ui)', fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)', letterSpacing:1 }}>HP</span>
          <span style={{ fontFamily:'var(--f-num)', fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.75)' }}>{formatNumber(currentEnemy.currentHp)} / {formatNumber(currentEnemy.maxHp)}</span>
        </div>
        <div style={{ height:8, background:'rgba(0,0,0,0.5)', borderRadius:10, overflow:'hidden', border:'1px solid rgba(255,255,255,0.07)', marginBottom:6 }}>
          <div style={{ height:'100%', width:`${hp}%`, transition:'width 0.15s ease', borderRadius:10,
            background:hp>50?'linear-gradient(90deg,#166534,#4ade80)':hp>25?'linear-gradient(90deg,#78350f,#fbbf24)':'linear-gradient(90deg,#7f1d1d,#f87171)',
            boxShadow:`0 0 12px ${hp>50?'#4ade8077':hp>25?'#fbbf2477':'#f8717177'}` }} />
        </div>
        <div style={{ display:'flex', gap:3 }}>
          {Array.from({length:10},(_,i)=>(
            <div key={i} style={{ flex:1, height:3, borderRadius:2,
              background:i+1<wave?cfg.accentColor:i+1===wave?(currentEnemy.isBoss?'#ef4444':cfg.accentColor):'rgba(255,255,255,0.08)',
              border:i===9?'1px solid rgba(239,68,68,0.4)':undefined, transition:'background 0.3s' }} />
          ))}
        </div>
      </div>

      {/* Barre des effets actifs */}
      <ActiveUltsBar />
      <ActiveBoostsBar />

      {/* ENNEMI centré */}
      <div onMouseDown={e => e.preventDefault()} style={{ flex:1, position:'relative', zIndex:2, cursor:'default', display:'flex', alignItems:'center', justifyContent:'center', userSelect:'none', WebkitUserSelect:'none' }}>
        <div className={currentEnemy.isBoss?'anim-boss':'anim-idle'}
          style={{ position:'relative', transform:'scaleX(-1)', pointerEvents:'none',
            filter:currentEnemy.isBoss?'drop-shadow(0 0 28px rgba(239,68,68,0.85)) drop-shadow(0 12px 24px rgba(0,0,0,0.95))':`drop-shadow(0 0 16px ${cfg.accentColor}77) drop-shadow(0 10px 20px rgba(0,0,0,0.9))` }}>
          <PixelSprite src={currentEnemy.spritePath} alt={currentEnemy.name}
            size={currentEnemy.isBoss?280:220} rarity={currentEnemy.isBoss?'L':'C'}
            style={ currentEnemy.isBoss
              ? { height:'clamp(180px, 40vh, 300px)', width:'auto', maxWidth:'min(85vw, 360px)', maxHeight:'clamp(180px, 40vh, 300px)' }
              : { height:'clamp(150px, 32vh, 240px)', width:'auto', maxWidth:'min(78vw, 300px)', maxHeight:'clamp(150px, 32vh, 240px)' }
            } />
        </div>
        {dmgs.map(d=>(
          <div key={d.id} style={{ position:'absolute', left:`${d.x}%`, top:`${d.y}%`, pointerEvents:'none', transform:'translate(-50%,-50%)',
            fontFamily:d.crit?'var(--f-title)':'var(--f-ui)', fontWeight:800,
            fontSize:d.crit?'26px':'18px', color:d.crit?'#f87171':'#fbbf24',
            textShadow:d.crit?'0 0 16px #ef4444':'0 0 12px #f59e0b',
            animation:'floatDmg 0.8s ease-out forwards', whiteSpace:'nowrap', zIndex:10 }}>
            {d.crit&&<span style={{fontSize:13,marginRight:4}}>CRIT!</span>}{formatNumber(d.val)}
          </div>
        ))}
      </div>

      {/* BARRE BAS */}
      <div style={{ position:'relative', zIndex:3, background:'linear-gradient(0deg,rgba(5,4,15,0.97),rgba(5,4,15,0.7))', borderTop:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>

        {/* Compagnons — barre horizontale */}
        <div style={{ display:'flex', alignItems:'flex-end', gap:10, padding:'10px 18px 8px' }}>
          {/* Panel compagnons */}
          <div style={{ background:'linear-gradient(160deg,rgba(15,10,30,0.92),rgba(8,6,18,0.92))', border:'1px solid rgba(255,255,255,0.09)', borderRadius:12, padding:'10px 12px 8px', display:'flex', flexDirection:'column', alignItems:'center', gap:8, boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
            <span style={{ fontFamily:'var(--f-ui)', fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:2 }}>COMPAGNONS</span>
            <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
              {equippedTeam.map((tid, i) => {
                const isLocked = !!tid && ultUsedThisFight.includes(tid);
                return (
                  <div key={i} style={{ position:'relative', width:88, flexShrink:0 }}>
                    <AllyCard templateId={tid ?? ''} onManage={() => {}} />
                    {isLocked && (
                      <div title="Ult utilisé — retrait bloqué jusqu'à la fin du combat"
                        style={{ position:'absolute', top:2, right:2, background:'rgba(0,0,0,0.75)', borderRadius:4, padding:'1px 3px', fontSize:10, lineHeight:1, pointerEvents:'none' }}>
                        🔒
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ flex:1 }} />

          {/* Synergies actives */}
          {(() => {
            const syns = computeActiveSynergies(equippedTeam);
            if (syns.length === 0) return null;
            return (
              <div style={{ display:'flex', gap:4, alignItems:'center', marginRight:8 }}>
                {syns.map(s => (
                  <div key={s.def.id} title={`${s.def.label} — ${s.threshold.label}`}
                    style={{ display:'flex', alignItems:'center', gap:4, background:`${s.def.color}18`, border:`1px solid ${s.def.color}55`, borderRadius:6, padding:'3px 8px', boxShadow:`0 0 8px ${s.def.glow}33` }}>
                    <div style={{ width:16, height:16, flexShrink:0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/sprites/synergies/${s.def.id}.webp`} alt={s.def.label}
                        style={{ width:'100%', height:'100%', objectFit:'contain', borderRadius:2 }}
                        onError={e => { (e.target as HTMLImageElement).style.display='none'; (e.target as HTMLImageElement).parentElement!.innerHTML=`<span style="font-size:12px">${s.def.icon}</span>`; }} />
                    </div>
                    <span style={{ fontFamily:'var(--f-ui)', fontWeight:700, fontSize:9, color:s.def.color, whiteSpace:'nowrap' }}>
                      {s.threshold.dpsBonus > 0 ? `+${s.threshold.dpsBonus}%` : `+${s.threshold.globalBonus}% glb`}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Butin de l'ennemi courant */}
          <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'7px 12px', flexShrink:0, textAlign:'right', marginRight:12 }}>
            <div style={{ fontFamily:'var(--f-ui)', fontSize:9, fontWeight:600, color:'rgba(255,255,255,0.25)', letterSpacing:1, marginBottom:3 }}>BUTIN</div>
            <div style={{ fontFamily:'var(--f-num)', fontSize:13, fontWeight:700, color:'var(--gold)' }}>+{formatNumber(currentEnemy.pixelCoinsReward)} 🪙</div>
            {currentEnemy.gemsReward > 0 && <div style={{ fontFamily:'var(--f-num)', fontSize:12, fontWeight:700, color:'var(--cyan-hi)' }}>+{currentEnemy.gemsReward} 💎</div>}
            <div style={{ fontFamily:'var(--f-ui)', fontSize:9, fontWeight:600, color:'rgba(34,211,238,0.45)', marginTop:2 }}>✦ 0.5% 💎 par ennemi</div>
          </div>

          {/* DPS d'équipe */}
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:'var(--f-ui)', fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:1.5 }}>🔥 DPS</div>
            <div style={{ fontFamily:'var(--f-num)', fontSize:19, fontWeight:900, color: dpsUltMult > 1 ? '#4ade80' : 'var(--green)', lineHeight:1, textShadow:'0 0 10px rgba(74,222,128,0.35)' }}>
              {formatNumber(dps)}{dpsUltMult > 1 && <span style={{ fontSize:11, marginLeft:2 }}>×{dpsUltMult}</span>}
            </div>
          </div>

          {/* Actions boss — dans la barre, seulement pendant/après un boss */}
          {(bossActive || wave === 10) && (
            <button
              onClick={e => { e.stopPropagation(); retreatFromBoss(); }}
              style={{ padding:'10px 14px', background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.4)', borderRadius:10, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:2, flexShrink:0, alignSelf:'center', transition:'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.12)')}
              title="Abandonner le boss et retourner à la vague 1"
            >
              <span style={{ fontSize:16 }}>🏳️</span>
              <span style={{ fontFamily:'var(--f-ui)', fontSize:9, fontWeight:700, color:'#f87171', letterSpacing:1 }}>RETRAITE</span>
            </button>
          )}
          {bossAvoided && !bossActive && wave !== 10 && (
            <button
              onClick={e => { e.stopPropagation(); challengeBoss(); }}
              style={{ padding:'10px 14px', background:'rgba(234,179,8,0.12)', border:'1px solid rgba(234,179,8,0.5)', borderRadius:10, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:2, flexShrink:0, alignSelf:'center', transition:'background 0.2s', animation:'pulse 2s infinite' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(234,179,8,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(234,179,8,0.12)')}
              title="Retenter le boss"
            >
              <span style={{ fontSize:16 }}>⚡</span>
              <span style={{ fontFamily:'var(--f-ui)', fontSize:9, fontWeight:700, color:'#fbbf24', letterSpacing:1 }}>BOSS</span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes rainbowShift { 0%{background-position:0% center} 100%{background-position:200% center} }
        @keyframes floatDmg { 0%{opacity:1;transform:translate(-50%,-50%) translateY(0) scale(1)} 100%{opacity:0;transform:translate(-50%,-50%) translateY(-64px) scale(0.75)} }
        @keyframes shimmerSlide { 0%{left:-60%} 100%{left:110%} }
      `}</style>
    </div>
  );
}
