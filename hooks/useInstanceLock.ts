'use client';

import { useEffect, useState } from 'react';

export type InstanceStatus =
  | 'checking'    // En cours de vérification
  | 'primary'     // Cet onglet est le maître
  | 'duplicate'   // Un autre onglet tourne déjà
  | 'takeover';   // On a demandé à reprendre la main

const LOCK_NAME = 'gachaverse_main_instance';
const CHANNEL_NAME = 'gachaverse_instance_sync';

// Messages échangés entre onglets
type SyncMessage =
  | { type: 'RELEASE_REQUEST' }   // Nouvel onglet demande au maître de lâcher
  | { type: 'RELEASE_ACK' }       // Maître confirme qu'il va libérer
  | { type: 'PING' }              // Vérifier si un maître répond
  | { type: 'PONG' };             // Réponse du maître

export function useInstanceLock() {
  const [status, setStatus] = useState<InstanceStatus>('checking');

  useEffect(() => {
    // Pas de support = on laisse passer (cas très rare, vieux navigateurs)
    if (typeof window === 'undefined') return;
    if (!navigator.locks) {
      setStatus('primary');
      return;
    }

    const channel = new BroadcastChannel(CHANNEL_NAME);
    let releaseResolve: (() => void) | null = null;
    let isMounted = true;

    // --- Tenter d'acquérir le verrou ---
    navigator.locks.request(
      LOCK_NAME,
      { ifAvailable: true },
      async (lock) => {
        if (!isMounted) return;

        if (lock === null) {
          // Verrou déjà pris par un autre onglet
          setStatus('duplicate');
          // Attendre d'être libéré si on demande un takeover
          await new Promise<void>((resolve) => {
            releaseResolve = resolve;
          });
          // Une fois libéré, tenter de re-acquérir normalement
          if (isMounted) {
            navigator.locks.request(LOCK_NAME, async () => {
              if (isMounted) setStatus('primary');
              // Tenir le verrou jusqu'à la fermeture du composant
              await new Promise<void>((res) => {
                releaseResolve = res;
              });
            });
          }
          return;
        }

        // On a le verrou → on est le maître
        setStatus('primary');

        // Écouter les demandes de libération
        channel.onmessage = (e: MessageEvent<SyncMessage>) => {
          if (e.data.type === 'RELEASE_REQUEST') {
            // Confirmer et se préparer à libérer
            channel.postMessage({ type: 'RELEASE_ACK' } satisfies SyncMessage);
            // Libérer le verrou en résolvant la promesse
            releaseResolve?.();
          }
          if (e.data.type === 'PING') {
            channel.postMessage({ type: 'PONG' } satisfies SyncMessage);
          }
        };

        // Tenir le verrou indéfiniment (jusqu'au cleanup)
        await new Promise<void>((resolve) => {
          releaseResolve = resolve;
        });
      }
    );

    // Écouter les messages quand on est en mode duplicate
    const handleMessage = (e: MessageEvent<SyncMessage>) => {
      if (e.data.type === 'RELEASE_ACK') {
        // Le maître a confirmé, on peut prendre le relais
        setStatus('takeover');
        releaseResolve?.();
      }
    };
    channel.addEventListener('message', handleMessage);

    return () => {
      isMounted = false;
      releaseResolve?.();
      channel.close();
    };
  }, []);

  // Demander à reprendre la main sur cet onglet
  const requestTakeover = () => {
    if (status !== 'duplicate') return;
    setStatus('takeover');
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type: 'RELEASE_REQUEST' } satisfies SyncMessage);
    // On ferme le channel temporaire, le hook principal gère la suite
    setTimeout(() => channel.close(), 1000);
  };

  return { status, requestTakeover };
}
