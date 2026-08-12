import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './config';

const LOCAL_SESSION_KEY = 'nekoz_session_claim';

export interface SessionClaim {
  uid: string;
  browserId: string;
  claimedAt: number;
  lastSeenAt: number;
  active: boolean;
}

function getBrowserId(): string {
  if (typeof window === 'undefined') return 'server';

  let browserId = localStorage.getItem(LOCAL_SESSION_KEY);
  if (browserId) {
    try {
      const parsed = JSON.parse(browserId) as { browserId?: string };
      if (parsed.browserId) return parsed.browserId;
    } catch {} 
  }

  const generated = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ browserId: generated }));
  return generated;
}

export async function claimSession(uid: string): Promise<void> {
  if (!db || !uid) return;

  const browserId = getBrowserId();
  const sessionRef = doc(db, 'sessions', uid);

  try {
    await setDoc(
      sessionRef,
      {
        uid,
        browserId,
        active: true,
        claimedAt: Date.now(),
        lastSeenAt: Date.now(),
      },
      { merge: true }
    );

    localStorage.setItem(
      LOCAL_SESSION_KEY,
      JSON.stringify({ uid, browserId, claimedAt: Date.now() })
    );
  } catch (error) {
    console.error('[Session] claimSession failed:', error);
  }
}

export function watchSession(uid: string, onConflict: () => void): () => void {
  if (!db || !uid || typeof window === 'undefined') {
    return () => {};
  }

  const browserId = getBrowserId();
  const ref = doc(db, 'sessions', uid);

  const unsub = onSnapshot(ref, (snap) => {
    const data = snap.data() as Partial<SessionClaim> | undefined;
    if (!data || !data.active) return;
    if (data.browserId && data.browserId !== browserId) {
      onConflict();
    }
  });

  return unsub;
}

export function clearLocalSession(): void {
  try {
    localStorage.removeItem(LOCAL_SESSION_KEY);
  } catch {}
}
