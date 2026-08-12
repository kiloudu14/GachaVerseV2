'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/layout/AuthModal';
import { getPendingRequests, getApprovedUsers, approveUser, AccessRequest } from '@/lib/firebase/accessRequests';

// ⚠️ Remplace par TON email de connexion — seul ce compte peut accéder à
// cette page. À modifier avant de déployer.
const ADMIN_EMAILS = ['mehdixshinobie@gmail.com'];

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth]   = useState(false);
  const [pending, setPending]     = useState<AccessRequest[]>([]);
  const [approvedList, setApprovedList] = useState<AccessRequest[]>([]);
  const [busy, setBusy]           = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email);

  const load = async () => {
    setRefreshing(true);
    const [p, a] = await Promise.all([getPendingRequests(), getApprovedUsers()]);
    setPending(p);
    setApprovedList(a);
    setRefreshing(false);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const handleApprove = async (uid: string) => {
    setBusy(uid);
    const ok = await approveUser(uid);
    if (ok) await load();
    setBusy(null);
  };

  if (loading) return null;

  if (!user || !isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050410', flexDirection: 'column', gap: 16 }}>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'sans-serif', fontSize: 14 }}>
          {user ? 'Ce compte n\'est pas administrateur.' : 'Connexion administrateur requise.'}
        </div>
        {!user && (
          <button onClick={() => setShowAuth(true)} style={{ padding: '10px 20px', borderRadius: 8, background: '#8b5cf6', border: 'none', color: '#fff', cursor: 'pointer', fontFamily: 'sans-serif', fontWeight: 700 }}>
            Se connecter
          </button>
        )}
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050410', padding: '32px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ color: '#a78bfa', fontSize: 22, fontWeight: 900, marginBottom: 6 }}>🛡️ Validation des comptes</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 28 }}>
          {pending.length} demande(s) en attente · {approvedList.length} compte(s) déjà validé(s)
        </p>

        <button onClick={load} disabled={refreshing} style={{ marginBottom: 20, padding: '8px 16px', borderRadius: 8, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', color: '#a78bfa', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
          {refreshing ? 'Actualisation…' : '🔄 Actualiser'}
        </button>

        <h2 style={{ color: '#fbbf24', fontSize: 15, fontWeight: 800, marginBottom: 12 }}>En attente</h2>
        {pending.length === 0 && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 24 }}>Aucune demande en attente.</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {pending.map(r => (
            <div key={r.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(251,191,36,0.25)' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{r.username}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>{r.email}</div>
                <div style={{ color: '#7289da', fontSize: 12, marginTop: 2 }}>Discord : {r.discordUsername}</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 4 }}>
                  Demandé le {new Date(r.createdAt).toLocaleString('fr-FR')}
                </div>
              </div>
              <button onClick={() => handleApprove(r.uid)} disabled={busy === r.uid} style={{ padding: '9px 18px', borderRadius: 8, background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.5)', color: '#4ade80', cursor: 'pointer', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>
                {busy === r.uid ? '...' : '✓ Valider'}
              </button>
            </div>
          ))}
        </div>

        <h2 style={{ color: '#4ade80', fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Déjà validés ({approvedList.length})</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {approvedList.map(r => (
            <div key={r.uid} style={{ display: 'flex', gap: 12, padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', fontSize: 12 }}>
              <span style={{ color: '#fff', fontWeight: 700, minWidth: 140 }}>{r.username}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>{r.email}</span>
              <span style={{ color: '#7289da' }}>{r.discordUsername}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
