'use client';
import { useEffect, useState } from 'react';

/**
 * Retourne true quand la largeur du viewport est <= breakpoint (défaut 820px).
 * SSR-safe : rend false côté serveur, se met à jour au montage et au resize.
 */
export function useIsMobile(breakpoint = 820): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [breakpoint]);

  return isMobile;
}
