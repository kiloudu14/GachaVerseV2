import { doc, setDoc, getDoc, getDocs, collection, query, where, updateDoc } from 'firebase/firestore';
import { db } from './config';

export interface AccessRequest {
  uid:             string;
  email:           string;
  username:        string; // pseudo en jeu
  discordUsername: string;
  approved:        boolean;
  createdAt:       number;
}

/** Crée la fiche utilisateur juste après la création du compte Firebase Auth.
 *  Le compte est immédiatement validé : il n'y a plus de demande d'accès à
 *  approuver manuellement, l'inscription donne un accès direct au jeu. */
export async function createAccessRequest(
  uid: string, email: string, username: string, discordUsername: string
): Promise<void> {
  if (!db) return;
  await setDoc(doc(db, 'users', uid), {
    uid, email, username, discordUsername,
    approved: true,
    createdAt: Date.now(),
  });
}

/** Le compte est-il validé et peut-il jouer ? */
export async function isApproved(uid: string): Promise<boolean> {
  if (!db) return true; // pas de Firebase configuré : ne bloque rien
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return false; // pas de demande trouvée = pas validé
    return !!snap.data().approved;
  } catch {
    return true; // en cas d'erreur réseau, on ne bloque pas injustement le joueur
  }
}

/** Liste toutes les demandes en attente (page d'admin). */
export async function getPendingRequests(): Promise<AccessRequest[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, 'users'), where('approved', '==', false)));
    return snap.docs.map(d => d.data() as AccessRequest).sort((a, b) => a.createdAt - b.createdAt);
  } catch (e) { console.error('[Access] getPendingRequests:', e); return []; }
}

/** Liste tous les comptes déjà validés (pour information dans la page d'admin). */
export async function getApprovedUsers(): Promise<AccessRequest[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(collection(db, 'users'), where('approved', '==', true)));
    return snap.docs.map(d => d.data() as AccessRequest).sort((a, b) => b.createdAt - a.createdAt);
  } catch (e) { console.error('[Access] getApprovedUsers:', e); return []; }
}

/**
 * Liste TOUS les comptes existants (collection "users"), quel que soit leur
 * statut de validation. Le uid du document correspond aussi à l'identifiant
 * de la sauvegarde cloud du joueur (collection "saves"), donc il sert
 * directement d'"id de save" affichable dans le panel admin.
 */
export async function getAllUsers(): Promise<AccessRequest[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => d.data() as AccessRequest).sort((a, b) => b.createdAt - a.createdAt);
  } catch (e) { console.error('[Access] getAllUsers:', e); return []; }
}

/** Valide un compte en attente. */
export async function approveUser(uid: string): Promise<boolean> {
  if (!db) return false;
  try {
    await updateDoc(doc(db, 'users', uid), { approved: true, approvedAt: Date.now() });
    return true;
  } catch (e) { console.error('[Access] approveUser:', e); return false; }
}
