// lib/game/achievements.ts — Définition de tous les succès GachaVerse

export type AchievCategory = 'combat' | 'collection' | 'gacha' | 'progression' | 'social';

export interface Achievement {
  id:          string;
  category:    AchievCategory;
  icon:        string;
  title:       string;           // titre débloquable
  name:        string;           // nom du succès
  description: string;
  target:      number;           // valeur cible
  secret?:     boolean;
  reward?: {
    type:  'title' | 'gems' | 'coins';
    value: number | string;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  // ── COMBAT ──────────────────────────────────────────────────────────────
  {
    id:'kills_1', category:'combat', icon:'🗡',
    title:'Premier Sang', name:'Baptême du Feu',
    description:'Vaincs ton premier monstre.', target:1,
    reward:{ type:'gems', value:5 },
  },
  {
    id:'kills_500', category:'combat', icon:'⚔',
    title:'Exterminateur', name:'Chasse Ouverte',
    description:'Vaincs 500 monstres au total.', target:500,
    reward:{ type:'gems', value:15 },
  },
  {
    id:'kills_5000', category:'combat', icon:'💥',
    title:'Faucheur', name:'Purge Totale',
    description:'Vaincs 5 000 monstres au total.', target:5000,
    reward:{ type:'gems', value:50 },
  },
  {
    id:'kills_50000', category:'combat', icon:'🔥',
    title:'Fléau', name:'Apocalypse Ambulante',
    description:'Vaincs 50 000 monstres au total.', target:50000,
    reward:{ type:'gems', value:150 },
  },
  {
    id:'kills_500000', category:'combat', icon:'☄',
    title:'Annihilateur', name:'Fin du Monde',
    description:'Vaincs 500 000 monstres au total.', target:500000,
    reward:{ type:'gems', value:500 },
    secret:true,
  },
  {
    id:'first_boss', category:'combat', icon:'💀',
    title:'Briseur de Cornes', name:'Chasseur de Boss',
    description:'Vaincs ton premier boss.', target:1,
    reward:{ type:'gems', value:10 },
  },
  {
    id:'bosses_5', category:'combat', icon:'🏹',
    title:'Chasseur', name:'Bête Noire',
    description:'Vaincs 5 boss.', target:5,
    reward:{ type:'gems', value:25 },
  },
  {
    id:'bosses_20', category:'combat', icon:'🗡',
    title:'Tueur de Dieux', name:'Nemesis',
    description:'Vaincs 20 boss.', target:20,
    reward:{ type:'gems', value:100 },
  },
  {
    id:'dps_1000', category:'combat', icon:'📈',
    title:'Puissant', name:'Machine de Guerre',
    description:'Atteins 1 000 DPS.', target:1000,
    reward:{ type:'gems', value:10 },
  },
  {
    id:'dps_1m', category:'combat', icon:'🌊',
    title:'Dévastateur', name:'Force Brute',
    description:'Atteins 1 000 000 DPS.', target:1000000,
    reward:{ type:'gems', value:50 },
  },

  // ── PROGRESSION ──────────────────────────────────────────────────────────
  {
    id:'palier_5', category:'progression', icon:'🌍',
    title:'Voyageur', name:'Cinq Mondes',
    description:'Atteins le palier 5.', target:5,
    reward:{ type:'gems', value:20 },
  },
  {
    id:'palier_10', category:'progression', icon:'🌌',
    title:'Conquérant', name:'À Mi-Chemin',
    description:'Atteins le palier 10.', target:10,
    reward:{ type:'gems', value:50 },
  },
  {
    id:'palier_15', category:'progression', icon:'🌠',
    title:'Dompteur de Mondes', name:'Quinze Univers',
    description:'Atteins le palier 15.', target:15,
    reward:{ type:'gems', value:100 },
  },
  {
    id:'palier_20', category:'progression', icon:'👑',
    title:'Maître du Multivers', name:'Fin du Voyage',
    description:'Conquiers les 20 paliers.', target:20,
    reward:{ type:'gems', value:500 },
    secret:true,
  },
  {
    id:'coins_100k', category:'progression', icon:'🪙',
    title:'Économe', name:'Cent Mille',
    description:'Accumule 100 000 Pixel-Coins.', target:100000,
    reward:{ type:'gems', value:10 },
  },
  {
    id:'coins_10m', category:'progression', icon:'💰',
    title:'Millionnaire', name:'Dix Millions',
    description:'Accumule 10 000 000 Pixel-Coins.', target:10000000,
    reward:{ type:'gems', value:40 },
  },
  {
    id:'coins_1b', category:'progression', icon:'💎',
    title:'Oligarque', name:'Milliardaire',
    description:'Accumule 1 000 000 000 Pixel-Coins.', target:1000000000,
    reward:{ type:'gems', value:200 },
    secret:true,
  },
  {
    id:'upgrade_10', category:'progression', icon:'⬆',
    title:'Optimisateur', name:'Toujours Plus Fort',
    description:'Améliore un personnage, ton héros ou ton Coffre d\'Or 10 fois au total.', target:10,
    reward:{ type:'gems', value:10 },
  },
  {
    id:'upgrade_50', category:'progression', icon:'🔧',
    title:'Forgeron', name:'Perfectionniste',
    description:'Améliore un personnage, ton héros ou ton Coffre d\'Or 50 fois au total.', target:50,
    reward:{ type:'gems', value:50 },
  },

  // ── COLLECTION ──────────────────────────────────────────────────────────
  {
    id:'collect_1', category:'collection', icon:'🐣',
    title:'Recruteur', name:'Premier Allié',
    description:'Obtiens ton premier personnage.', target:1,
    reward:{ type:'gems', value:5 },
  },
  {
    id:'collect_5', category:'collection', icon:'👥',
    title:'Meneur', name:'L\'Équipe se Forme',
    description:'Obtiens 5 personnages différents.', target:5,
    reward:{ type:'gems', value:15 },
  },
  {
    id:'collect_15', category:'collection', icon:'🏛',
    title:'Archiviste', name:'Petite Collection',
    description:'Obtiens 15 personnages différents.', target:15,
    reward:{ type:'gems', value:40 },
  },
  {
    id:'collect_30', category:'collection', icon:'📚',
    title:'Collectionneur', name:'Bibliothèque',
    description:'Obtiens 30 personnages différents.', target:30,
    reward:{ type:'gems', value:100 },
  },
  {
    id:'collect_all', category:'collection', icon:'🌟',
    title:'Complétiste', name:'Tout Attraper',
    description:'Débloque tous les personnages.', target:999,
    reward:{ type:'gems', value:500 },
    secret:true,
  },
  {
    id:'legendary_1', category:'collection', icon:'✨',
    title:'Chanceux', name:'Or Pur',
    description:'Obtiens un personnage Légendaire.', target:1,
    reward:{ type:'gems', value:20 },
  },
  {
    id:'transcendant_1', category:'collection', icon:'🌈',
    title:'Élu', name:'Au-Delà de Tout',
    description:'Obtiens un personnage Transcendant.', target:1,
    reward:{ type:'gems', value:100 },
    secret:true,
  },
  {
    id:'equip_team', category:'collection', icon:'⚙',
    title:'Tacticien', name:'Équipe Complète',
    description:'Équipe les 4 emplacements d\'allié.', target:4,
    reward:{ type:'gems', value:15 },
  },

  // ── GACHA ────────────────────────────────────────────────────────────────
  {
    id:'pull_1', category:'gacha', icon:'🎰',
    title:'Joueur', name:'Premier Tirage',
    description:'Effectue ton premier tirage.', target:1,
    reward:{ type:'gems', value:5 },
  },
  {
    id:'pull_10', category:'gacha', icon:'🎲',
    title:'Parieur', name:'Dix Invocations',
    description:'Effectue 10 tirages.', target:10,
    reward:{ type:'gems', value:10 },
  },
  {
    id:'pull_100', category:'gacha', icon:'🎯',
    title:'Invocateur', name:'Cent Tirages',
    description:'Effectue 100 tirages.', target:100,
    reward:{ type:'gems', value:30 },
  },
  {
    id:'pull_500', category:'gacha', icon:'🔮',
    title:'Grand Invocateur', name:'Cinq Cents Tirages',
    description:'Effectue 500 tirages.', target:500,
    reward:{ type:'gems', value:150 },
    secret:true,
  },
  {
    id:'quest_10', category:'social', icon:'📜',
    title:'Serviteur', name:'Dix Missions',
    description:'Complète 10 quêtes.', target:10,
    reward:{ type:'gems', value:20 },
  },
  {
    id:'quest_20', category:'social', icon:'📯',
    title:'Émissaire', name:'Vingt Missions',
    description:'Complète 20 quêtes.', target:20,
    reward:{ type:'gems', value:45 },
  },
  {
    id:'quest_50', category:'social', icon:'🗺',
    title:'Aventurier', name:'Cinquante Missions',
    description:'Complète 50 quêtes.', target:50,
    reward:{ type:'gems', value:80 },
  },
];

// Catégorie label
export const CATEGORY_LABELS: Record<AchievCategory, string> = {
  combat:      '⚔ COMBAT',
  collection:  '📚 COLLECTION',
  gacha:       '🎰 GACHA',
  progression: '📈 PROGRESSION',
  social:      '📜 MISSIONS',
};
