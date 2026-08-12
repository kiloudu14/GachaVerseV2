'use client';
import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useRandomEventStore, JACKPOT_BUTTON_MS } from '@/store/randomEventStore';
import { formatNumber } from '@/lib/game/format';

// Symboles de la machine. `weight` = fréquence sur un rouleau.
// L'OR est exprimé en MULTIPLE du butin d'un mob du palier courant (`coinMult`),
// donc il grimpe automatiquement avec la progression. Gemmes/couronnes restent fixes.
type Symbol = {
  key: string; icon: string; label: string; weight: number;
  coinMult?: number; gems?: number; crowns?: number; malusDivide?: number;
};

const SYMBOLS: Symbol[] = [
  { key:'seven',  icon:'7️⃣', label:'JACKPOT 777', weight: 1,  coinMult: 500, gems: 100, crowns: 3 },
  { key:'gem',    icon:'💎', label:'Gemmes',       weight: 4,  gems: 30 },
  { key:'crown',  icon:'👑', label:'Couronne',     weight: 3,  crowns: 1 },
  { key:'coin',   icon:'🪙', label:'Pièces',       weight: 6,  coinMult: 100 },
  { key:'clover', icon:'🍀', label:'Trèfle',       weight: 5,  coinMult: 85, gems: 5 },
  { key:'bomb',   icon:'💀', label:'Malus',        weight: 3,  malusDivide: 3 },
];

const MALUS_DURATION_MS = 600000; // ÷3 DPS pendant 10 min

function pickSymbol(): Symbol {
  const total = SYMBOLS.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const s of SYMBOLS) { r -= s.weight; if (r <= 0) return s; }
  return SYMBOLS[SYMBOLS.length - 1];
}

export function JackpotEvent() {
  const end               = useRandomEventStore(s => s.end);
  const grant             = useGameStore(s => s.grantEventRewards);
  const setEventDpsMult   = useGameStore(s => s.setEventDpsMult);

  // Or de référence = butin d'un mob du palier courant × bonus Coffre d'Or.
  const goldPerUnit = () => {
    const g = useGameStore.getState();
    return Math.max(1000, Math.floor(g.currentEnemy.pixelCoinsReward * g.getGoldMultiplier()));
  };
  const coinsFor = (s: Symbol) => (s.coinMult ? goldPerUnit() * s.coinMult : 0);

  const [phase, setPhase] = useState<'button' | 'slots'>('button');
  const [timeLeft, setTimeLeft] = useState(JACKPOT_BUTTON_MS);
  const [reels, setReels] = useState<Symbol[]>([SYMBOLS[3], SYMBOLS[3], SYMBOLS[3]]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Symbol | null>(null);
  const [done, setDone] = useState(false);

  // Fenêtre du bouton clignotant : si non cliqué, l'event se termine.
  useEffect(() => {
    if (phase !== 'button') return;
    const start = Date.now();
    const iv = setInterval(() => {
      const left = JACKPOT_BUTTON_MS - (Date.now() - start);
      setTimeLeft(Math.max(0, left));
      if (left <= 0) { clearInterval(iv); end(); }
    }, 100);
    return () => clearInterval(iv);
  }, [phase, end]);

  const spinIv = useRef<ReturnType<typeof setInterval> | null>(null);

  const spin = () => {
    if (spinning || done) return;
    setSpinning(true);
    // Résultat : triple d'un symbole tiré au poids (sinon pas de gain).
    const isTriple = Math.random() < 0.45;         // ~45% de chance d'aligner
    const target = pickSymbol();
    spinIv.current = setInterval(() => {
      setReels([pickSymbol(), pickSymbol(), pickSymbol()]);
    }, 80);
    setTimeout(() => {
      if (spinIv.current) clearInterval(spinIv.current);
      const final = isTriple ? [target, target, target] : [target, pickSymbol(), pickSymbol()];
      setReels(final);
      setSpinning(false);
      setDone(true);
      if (isTriple) {
        setResult(target);
        if (target.malusDivide) setEventDpsMult(1 / target.malusDivide, MALUS_DURATION_MS);
        else grant(coinsFor(target), target.gems ?? 0, target.crowns ?? 0);
      } else {
        setResult(null);
      }
    }, 1600);
  };

  useEffect(() => () => { if (spinIv.current) clearInterval(spinIv.current); }, []);

  // ── Phase 1 : bouton clignotant ──────────────────────────────────────
  if (phase === 'button') {
    return (
      <div style={{ position:'absolute', inset:0, zIndex:20, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(3,2,10,0.35)' }}>
        <button onClick={() => setPhase('slots')}
          style={{ padding:'18px 30px', borderRadius:14, cursor:'pointer', border:'2px solid #fbbf24',
            background:'linear-gradient(135deg,#b45309,#f59e0b)', color:'#fff',
            fontFamily:'var(--f-title)', fontWeight:900, fontSize:20, letterSpacing:2,
            boxShadow:'0 0 40px rgba(245,158,11,0.7)', animation:'jackpotBlink 0.6s infinite' }}>
          🎰 GAIN MULTIPLIÉ !
          <div style={{ fontFamily:'var(--f-num)', fontSize:11, fontWeight:700, opacity:0.85, marginTop:4 }}>{(timeLeft/1000).toFixed(0)}s pour tenter</div>
        </button>
        <style>{`@keyframes jackpotBlink { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.5)} }`}</style>
      </div>
    );
  }

  // ── Phase 2 : machine à sous ─────────────────────────────────────────
  return (
    <div style={{ position:'absolute', inset:0, zIndex:20, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(3,2,10,0.6)' }}>
      <div style={{ width:'min(360px,92%)', borderRadius:16, border:'1px solid var(--border-glow)', background:'linear-gradient(170deg,#1a1230,#0a0818)', boxShadow:'0 20px 60px rgba(0,0,0,0.7)', padding:22, textAlign:'center' }}>
        <div style={{ fontFamily:'var(--f-title)', fontSize:18, fontWeight:900, color:'var(--gold-hi)', letterSpacing:2, marginBottom:14 }}>🎰 MACHINE À SOUS</div>

        <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:16 }}>
          {reels.map((s, i) => (
            <div key={i} style={{ width:78, height:78, borderRadius:12, background:'#050310', border:'2px solid rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40 }}>
              {s.icon}
            </div>
          ))}
        </div>

        {!done ? (
          <button onClick={spin} disabled={spinning} className="btn-primary" style={{ width:'100%', padding:12, fontSize:15, opacity: spinning ? 0.6 : 1 }}>
            {spinning ? 'ROTATION…' : 'LANCER'}
          </button>
        ) : (
          <>
            <div style={{ minHeight:44, marginBottom:12 }}>
              {result ? (
                result.malusDivide ? (
                  <div style={{ color:'#f87171', fontFamily:'var(--f-ui)', fontWeight:800, fontSize:14 }}>
                    💀💀💀 {result.label} : DPS ÷{result.malusDivide} pendant 10 min !
                  </div>
                ) : (
                  <div style={{ color:'var(--green)', fontFamily:'var(--f-ui)', fontWeight:800, fontSize:14 }}>
                    {result.icon} {result.label} !{' '}
                    {result.coinMult ? `+${formatNumber(coinsFor(result))}🪙 ` : ''}
                    {result.gems ? `+${result.gems}💎 ` : ''}
                    {result.crowns ? `+${result.crowns}👑` : ''}
                  </div>
                )
              ) : (
                <div style={{ color:'var(--text-dim)', fontFamily:'var(--f-ui)', fontSize:13 }}>Pas d’alignement… pas de chance !</div>
              )}
            </div>
            <button onClick={end} className="btn-secondary" style={{ width:'100%', padding:11, fontSize:14 }}>FERMER</button>
          </>
        )}
      </div>
    </div>
  );
}
