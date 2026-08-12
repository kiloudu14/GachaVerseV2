// ── Bonus d'or par titre équipé ────────────────────────────────────────────
// Les 33 titres sont classés du plus facile (Novice, +5%) au plus dur
// (Oligarque — 1 milliard de Pixel-Coins accumulés, +60%), avec une montée
// linéaire entre les deux. Le classement suit la difficulté réelle des succès
// qui les débloquent (et non l'ordre du fichier, les catégories n'étant pas
// comparables entre elles en valeur brute).
const TITLE_ORDER: string[] = [
  'Novice', 'Premier Sang', 'Briseur de Cornes', 'Recruteur', 'Chanceux', 'Élu', 'Joueur', 'Serviteur',
  'Astre', 'Étincelant', 'Voyageur', 'Émissaire', 'Légat', 'Souverain',
  'Meneur', 'Tacticien', 'Chasseur', 'Exterminateur', 'Trésorier', 'Aventurier',
  'Conquérant', 'Optimisateur', 'Archiviste', 'Scintillant', 'Parieur', 'Forgeron', 'Faucheur', 'Insatiable',
  'Dompteur de Mondes', 'Tueur de Dieux', 'Collectionneur', 'Économe', 'Nébuleuse', 'Invocateur', 'Puissant', 'Fléau',
  'Harmonie Totale', 'Maître Artisan', 'Décoré', 'Fossoyeur',
  'Maître du Multivers', 'Millionnaire', 'Complétiste',
  'Éclat Pur', 'Trinité', 'Néant Incarné',
  'Dévastateur', 'Grand Invocateur', 'Garde d\'Élite',
  'Annihilateur', 'Cataclysme', 'Ploutocrate', 'Ascendant', 'Prisme Absolu',
  'Oligarque',
];

const MIN_BONUS_PCT = 5;   // Novice
const MAX_BONUS_PCT = 60;  // Oligarque

export const TITLE_GOLD_BONUS_PCT: Record<string, number> = Object.fromEntries(
  TITLE_ORDER.map((title, i) => [
    title,
    Math.round((MIN_BONUS_PCT + (MAX_BONUS_PCT - MIN_BONUS_PCT) * i / (TITLE_ORDER.length - 1)) * 10) / 10,
  ])
);

/** Multiplicateur d'or (1.05 → 1.60) du titre actuellement équipé. */
export function getTitleGoldMultiplier(activeTitle: string): number {
  const pct = TITLE_GOLD_BONUS_PCT[activeTitle] ?? 0;
  return 1 + pct / 100;
}
