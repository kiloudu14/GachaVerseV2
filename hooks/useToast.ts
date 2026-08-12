'use client';
import { create } from 'zustand';

export type ToastType = 'loot' | 'quest' | 'levelup' | 'palier' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  icon?: string;
  duration?: number; // ms, default 3500
}

interface ToastStore {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

let _seq = 0;

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  push(t) {
    const id = `toast_${Date.now()}_${_seq++}`;
    const duration = t.duration ?? 3500;
    set(s => ({ toasts: [...s.toasts.slice(-4), { ...t, id }] })); // max 5 visible
    setTimeout(() => get().dismiss(id), duration);
  },
  dismiss(id) {
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
  },
}));

// Helpers pour pousser depuis n'importe où
export const toast = {
  loot   : (title: string, msg?: string) => useToastStore.getState().push({ type:'loot',    title, message:msg, icon:'⚔' }),
  quest  : (title: string, msg?: string) => useToastStore.getState().push({ type:'quest',   title, message:msg, icon:'📜' }),
  levelup: (title: string, msg?: string) => useToastStore.getState().push({ type:'levelup', title, message:msg, icon:'⬆' }),
  palier : (title: string, msg?: string) => useToastStore.getState().push({ type:'palier',  title, message:msg, icon:'🌌' }),
  error  : (title: string, msg?: string) => useToastStore.getState().push({ type:'error',   title, message:msg, icon:'⚠' }),
  info   : (title: string, msg?: string) => useToastStore.getState().push({ type:'info',    title, message:msg, icon:'ℹ' }),
};
