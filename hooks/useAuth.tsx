'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { claimSession, watchSession, clearLocalSession } from '@/lib/firebase/session';
import { createAccessRequest } from '@/lib/firebase/accessRequests';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, discordUsername: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  kickedOut: boolean;
  dismissKickedOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<User | null>(null);
  const [loading, setLoading]   = useState(true);
  const [kickedOut, setKickedOut] = useState(false);

  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Surveille en continu si un AUTRE navigateur prend le relais sur ce
  // compte : si oui, cette session-ci est automatiquement déconnectée.
  useEffect(() => {
    if (!user) return;
    const unsub = watchSession(user.uid, () => {
      setKickedOut(true);
      signOut(auth).catch(() => {});
    });
    return unsub;
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await claimSession(cred.user.uid);
  };

  const signUp = async (email: string, password: string, username: string, discordUsername: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Compte créé mais PAS de session/accès automatique : il reste "en attente"
    // tant que le pseudo Discord n'a pas été vérifié manuellement.
    await createAccessRequest(cred.user.uid, email, username, discordUsername);
  };

  const signInGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    await claimSession(cred.user.uid);
  };

  const logout = async () => {
    clearLocalSession();
    await signOut(auth);
  };

  const dismissKickedOut = () => setKickedOut(false);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInGoogle, logout, kickedOut, dismissKickedOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
