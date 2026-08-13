import { collection, addDoc } from 'firebase/firestore';
import { db } from './config';

export type AuditEventType =
  | 'auth:signIn'
  | 'auth:signOut'
  | 'auth:signUp'
  | 'achievement:claim'
  | 'quest:claim'
  | 'quest:claimWeekly'
  | 'quest:claimEvent'
  | 'save:toFirestore'
  | 'gacha:pull'
  | 'other';

export async function logAudit(userId: string | null, type: AuditEventType, payload: Record<string, any> = {}) {
  if (!db) return;
  try {
    await addDoc(collection(db, 'auditLogs'), {
      userId: userId ?? null,
      type,
      payload,
      createdAt: Date.now(),
    });
  } catch (e) {
    // don't break user flow on logging failure
    console.warn('[Audit] failed to write log', e);
  }
}

export default logAudit;
