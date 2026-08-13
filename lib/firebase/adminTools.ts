import { doc, getDoc, updateDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from './config';

export interface PlayerLookup {
  uid: string;
  email: string;
  username: string;
}

export interface PlayerSaveSummary {
  pixelCoins: number;
  nekoGems: number;
  bossCrowns: number;
  maxPalierReached: number;
  lastSaved: number | null;
}

/** Cherche un joueur par pseudo OU email exact (recherche sur la collection "users"). */
export async function findPlayer(search: string): Promise<PlayerLookup | null> {
  if (!db) return null;
  const trimmed = search.trim();
  if (!trimmed) return null;
  try {
    // Essai par email exact
    const byEmail = await getDocs(query(collection(db, 'users'), where('email', '==', trimmed), limit(1)));
    if (!byEmail.empty) {
      const d = byEmail.docs[0].data();
      return { uid: d.uid, email: d.email, username: d.username };
    }
    // Essai par pseudo exact (sensible à la casse telle que saisie à l'inscription)
    const byUsername = await getDocs(query(collection(db, 'users'), where('username', '==', trimmed), limit(1)));
    if (!byUsername.empty) {
      const d = byUsername.docs[0].data();
      return { uid: d.uid, email: d.email, username: d.username };
    }
    return null;
  } catch (e) {
    console.error('[AdminTools] findPlayer:', e);
    return null;
  }
}

/** Lit le résumé de la sauvegarde cloud d'un joueur (uniquement les champs pertinents pour la modération). */
export async function getPlayerSave(uid: string): Promise<PlayerSaveSummary | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'saves', uid));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      pixelCoins:       d.pixelCoins ?? 0,
      nekoGems:         d.nekoGems ?? 0,
      bossCrowns:       d.bossCrowns ?? 0,
      maxPalierReached: d.maxPalierReached ?? 1,
      lastSaved:        d.lastSaved ?? null,
    };
  } catch (e) {
    console.error('[AdminTools] getPlayerSave:', e);
    return null;
  }
}

/**
 * Corrige le solde d'un joueur sur sa sauvegarde CLOUD, et met à jour
 * lastSaved à MAINTENANT — indispensable pour que la correction ne soit pas
 * écrasée par l'ancienne sauvegarde locale (localStorage) du joueur à sa
 * prochaine connexion (le jeu charge toujours la version la plus récente).
 */
export async function correctPlayerBalance(
  uid: string,
  updates: { pixelCoins?: number; nekoGems?: number; bossCrowns?: number }
): Promise<boolean> {
  if (!db) return false;
  try {
    await updateDoc(doc(db, 'saves', uid), {
      ...updates,
      lastSaved: Date.now(),
    });
    return true;
  } catch (e) {
    console.error('[AdminTools] correctPlayerBalance:', e);
    return false;
  }
}
