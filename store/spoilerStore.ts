'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Anti-spoil : un univers "protégé" (case cochée = "je n'ai pas encore vu")
// fait que le jeu n'affiche jamais l'art de la forme la plus récente d'un
// personnage de cet univers — il garde toujours celui de la forme précédente,
// même après une évolution. Ne touche que le visuel, pas le nom affiché.
interface SpoilerState {
  protectedUniverses: Record<string, boolean>;
  isProtected: (universe: string) => boolean;
  toggleUniverse: (universe: string, protect: boolean) => void;
}

export const useSpoilerStore = create<SpoilerState>()(
  persist(
    (set, get) => ({
      protectedUniverses: {},
      isProtected: (universe) => !!get().protectedUniverses[universe],
      toggleUniverse: (universe, protect) =>
        set(s => ({ protectedUniverses: { ...s.protectedUniverses, [universe]: protect } })),
    }),
    { name: 'gachaverse-spoiler-settings' }
  )
);

/** Index de forme à afficher pour ne jamais révéler la dernière évolution. */
export function getSafeFormIndex(universe: string, realFormIndex: number): number {
  if (realFormIndex <= 0) return 0;
  return useSpoilerStore.getState().isProtected(universe) ? realFormIndex - 1 : realFormIndex;
}
