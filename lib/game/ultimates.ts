import { getCharacterById } from './characters';

export interface UltimateEffect {
  dpcMultiplier?:              number;
  dpsMultiplier?:              number;
  coinMultiplier?:             number;
  selfDpsMultiplier?:          number;
  enemyDamageTakenBonusPct?:  number;
  critChance?:                 number;
  stackPerClickPct?:           number;
  comboGrowthPct?:             number;
  chancePerClickCoinBurst?:    { chancePct: number; coinFlat: number };
  autoStrikes?:                { perSecond: number; source: 'dpc' | 'teamDpsPct'; value: number };
  poisonDpsPctOfDpc?:          number;
  damageToCoinPct?:            number;
  instantClicks?:              number;
  instantDamagePctSelfDps?:    number;
  instantDamagePctTeamDps?:    number;
  instantDamagePctMaxHp?:      number;
  instantCoinMultiplierBurst?: number;
  nextClickMultiplier?:        number;
  reduceOtherCooldownsSeconds?:number;
  haltTeamCooldownHalved?:     boolean;
  resetBestOtherCooldown?:     boolean;
}

export interface UltimateDef {
  templateId:   string;
  name:         string;
  description:  string;
  duration:     number;
  cooldown:     number;
  effect:       UltimateEffect;
  animDuration: number;
}

export const ULTIMATE_DEFS: Record<string, UltimateDef> = {

  // ══ COMMUNS — cooldown 90s ═══════════════════════════════════════════
  canarticho: {
    templateId:'canarticho', name:'Coup Critique', duration:4, cooldown:90,
    description:'Taux de critique à 100% pendant 4s',
    effect:{ critChance:1.0 }, animDuration:1200,
  },
  cyborg: {
    templateId:'cyborg', name:'Tir Automatique', duration:6, cooldown:90,
    description:'1 tir/s à 30% du DPC pendant 6s',
    effect:{ autoStrikes:{ perSecond:1, source:'dpc', value:0.3 } }, animDuration:1200,
  },
  slime: {
    templateId:'slime', name:'Explosion Visqueuse', duration:1, cooldown:90,
    description:'Équivalent à 4 clics instantanés',
    effect:{ instantClicks:4 }, animDuration:1200,
  },
  axolotl: {
    templateId:'axolotl', name:'Capture Surprise', duration:1, cooldown:90,
    description:'×0 coins instantané sur l\'ennemi actuel',
    effect:{ instantCoinMultiplierBurst:0 }, animDuration:1200,
  },
  garry_fish: {
    templateId:'garry_fish', name:'Saut Hors de l\'Eau', duration:8, cooldown:90,
    description:'10% de chance par clic de looter des coins bonus',
    effect:{ chancePerClickCoinBurst:{ chancePct:10, coinFlat:3 } }, animDuration:1200,
  },
  birthday_boy: {
    templateId:'birthday_boy', name:'Bougie Magique', duration:6, cooldown:90,
    description:'×1.3 DPC pendant 6s',
    effect:{ dpcMultiplier:1.3 }, animDuration:1200,
  },
  gummigoo: {
    templateId:'gummigoo', name:'Glu Collante', duration:6, cooldown:90,
    description:'L\'ennemi reçoit +5% de dégâts pendant 6s',
    effect:{ enemyDamageTakenBonusPct:5 }, animDuration:1200,
  },
  yamcha: {
    templateId:'yamcha', name:'La Pose', duration:1, cooldown:90,
    description:'×0 coins instantané sur l\'ennemi actuel',
    effect:{ instantCoinMultiplierBurst:0 }, animDuration:1400,
  },
  korogu: {
    templateId:'korogu', name:'Cri de la Forêt', duration:8, cooldown:90,
    description:'8% de chance par clic de looter des coins bonus',
    effect:{ chancePerClickCoinBurst:{ chancePct:8, coinFlat:3 } }, animDuration:1200,
  },
  bangers: {
    templateId:'bangers', name:'Explosion', duration:1, cooldown:120,
    description:'Inflige instantanément 3% des PV max de l\'ennemi',
    effect:{ instantDamagePctMaxHp:3 }, animDuration:1600,         // ← nerfé : était 25%
  },
  bubba: {
    templateId:'bubba', name:'Piétinement', duration:8, cooldown:90,
    description:'×1.4 DPS personnel pendant 8s',
    effect:{ selfDpsMultiplier:1.4 }, animDuration:1200,
  },
  tentacool: {
    templateId:'tentacool', name:'Venin', duration:8, cooldown:90,
    description:'Poison basé sur 50% du DPC pendant 8s',
    effect:{ poisonDpsPctOfDpc:50 }, animDuration:1200,
  },
  chenipan: {
    templateId:'chenipan', name:'Évolution Rapide', duration:1, cooldown:90,
    description:'Réduit le cooldown de tous les autres ultimates de 15s',
    effect:{ reduceOtherCooldownsSeconds:15 }, animDuration:1200,  // ← nerfé : était 30s
  },
  mr_popo: {
    templateId:'mr_popo', name:'Pecking Order', duration:15, cooldown:300,
    description:'×1.8 DPS d\'équipe et ×1.5 or sur cet ennemi pendant 15s',
    effect:{ dpsMultiplier:1.8, coinMultiplier:1.5 }, animDuration:1800,  // ← nerfé : était x3/x2 20s
  },

  // ══ UNCOMMUNS — cooldown 120s ═════════════════════════════════════════
  prince_lars: {
    templateId:'prince_lars', name:'Caprice Royal', duration:6, cooldown:120,
    description:'×1.3 DPC pendant 6s',
    effect:{ dpcMultiplier:1.3 }, animDuration:1400,
  },
  eugeo: {
    templateId:'eugeo', name:'Lame de Glace', duration:8, cooldown:120,
    description:'×1.5 DPS personnel pendant 8s',
    effect:{ selfDpsMultiplier:1.5 }, animDuration:1400,
  },
  angie: {
    templateId:'angie', name:'Volée de Papillons', duration:8, cooldown:120,
    description:'10% de chance par clic de looter des coins bonus',
    effect:{ chancePerClickCoinBurst:{ chancePct:10, coinFlat:5 } }, animDuration:1400,
  },
  gobuta: {
    templateId:'gobuta', name:'Charge Gobeline', duration:1, cooldown:120,
    description:'Inflige instantanément 2% des PV max de l\'ennemi',
    effect:{ instantDamagePctMaxHp:2 }, animDuration:1400,
  },
  vogue_merry: {
    templateId:'vogue_merry', name:'Réparation', duration:1, cooldown:240,
    description:'Réduit de 20s le cooldown de tous les autres ultimates',
    effect:{ reduceOtherCooldownsSeconds:20 }, animDuration:1600,  // ← nerfé : était /2
  },

  // ══ RARES — cooldown 150s ═════════════════════════════════════════════
  'salamèche': {
    templateId:'salamèche', name:'Brûlure', duration:8, cooldown:150,
    description:'L\'ennemi reçoit +8% de dégâts pendant 8s',
    effect:{ enemyDamageTakenBonusPct:8 }, animDuration:1600,
  },
  carapuce: {
    templateId:'carapuce', name:'Bulles', duration:20, cooldown:150,
    description:'×1.5 monnaie obtenue pendant 20s',
    effect:{ coinMultiplier:1.5 }, animDuration:1600,              // ← nerfé : était x2 30s
  },
  bulbizarre: {
    templateId:'bulbizarre', name:'Vampigraine', duration:12, cooldown:150,
    description:'Convertit 0.5% des dégâts infligés en monnaie pendant 12s',
    effect:{ damageToCoinPct:0.5 }, animDuration:1600,
  },
  kissy_missy: {
    templateId:'kissy_missy', name:'Cadeau', duration:1, cooldown:150,
    description:'×0 monnaie instantané sur l\'ennemi actuel',
    effect:{ instantCoinMultiplierBurst:0 }, animDuration:1600,    // ← nerfé : était x10
  },
  yuno: {
    templateId:'yuno', name:'Tempête de Vent', duration:5, cooldown:150,
    description:'×2 DPC pendant 5s',
    effect:{ dpcMultiplier:2 }, animDuration:1600,                 // ← nerfé : était x5
  },
  the_dress: {
    templateId:'the_dress', name:'Illusion Optique', duration:6, cooldown:150,
    description:'Taux de critique à 40% pendant 6s',
    effect:{ critChance:0.4 }, animDuration:1600,
  },
  kirito: {
    templateId:'kirito', name:'Dual Wield', duration:8, cooldown:150,
    description:'×1.8 DPC pendant 8s',
    effect:{ dpcMultiplier:1.8 }, animDuration:1600,
  },

  // ══ ÉPIQUES — cooldown 210s ═══════════════════════════════════════════
  arsene: {
    templateId:'arsene', name:'Agile', duration:10, cooldown:210,
    description:'×1.3 DPS d\'équipe pendant 10s',
    effect:{ dpsMultiplier:1.3 }, animDuration:1800,               // ← nerfé : était x1.5
  },
  huggy_wuggy: {
    templateId:'huggy_wuggy', name:'Étreinte', duration:8, cooldown:210,
    description:'Chaque clic ajoute +5% aux dégâts de clic suivants (8s)',
    effect:{ stackPerClickPct:5 }, animDuration:1800,              // ← nerfé : était +15%
  },
  diablo: {
    templateId:'diablo', name:'Chaos Imprévisible', duration:10, cooldown:210,
    description:'Le DPC croît de +4% à chaque clic pendant 10s',
    effect:{ comboGrowthPct:4 }, animDuration:1800,                // ← nerfé : était +8%
  },
  reaper_leviathan: {
    templateId:'reaper_leviathan', name:'Attaque des Profondeurs', duration:8, cooldown:210,
    description:'×2 DPS personnel pendant 8s',
    effect:{ selfDpsMultiplier:2 }, animDuration:2000,             // ← nerfé : était x4
  },
  reinhardt: {
    templateId:'reinhardt', name:'Marteau Pilon', duration:1, cooldown:210,
    description:'Inflige instantanément 80% du DPS d\'équipe',
    effect:{ instantDamagePctTeamDps:80 }, animDuration:1800,      // ← nerfé : était 150%
  },

  // ══ LÉGENDAIRES — cooldown 270s ═══════════════════════════════════════
  sanji: {
    templateId:'sanji', name:'Diable Jambe', duration:8, cooldown:270,
    description:'×2 DPC pendant 8s',
    effect:{ dpcMultiplier:2 }, animDuration:2000,                 // ← nerfé : était x3
  },
  asta: {
    templateId:'asta', name:'Black Hurricane', duration:20, cooldown:270,
    description:'×1.5 DPS personnel pendant 20s',
    effect:{ selfDpsMultiplier:1.5 }, animDuration:2000,           // ← nerfé : était x2 30s
  },
  taureau: {
    templateId:'taureau', name:'Charge Furieuse', duration:10, cooldown:270,
    description:'×2 DPS personnel pendant 10s',
    effect:{ selfDpsMultiplier:2 }, animDuration:2000,
  },
  kioraku: {
    templateId:'kioraku', name:'Jeux d\'Ombre', duration:1, cooldown:270,
    description:'Le prochain clic inflige l\'équivalent de 80 clics normaux',
    effect:{ nextClickMultiplier:80 }, animDuration:2200,          // ← nerfé : était x100
  },
  arthur_pandragon: {
    templateId:'arthur_pandragon', name:'Excalibur', duration:1, cooldown:270,
    description:'Inflige instantanément 150% du DPS d\'équipe',
    effect:{ instantDamagePctTeamDps:150 }, animDuration:2200,      // ← nerfé : était 300%
  },
  nagito_komaeda: {
    templateId:'nagito_komaeda', name:'Chance', duration:8, cooldown:270,
    description:'15% de chance par clic de générer une explosion de monnaie',
    effect:{ chancePerClickCoinBurst:{ chancePct:15, coinFlat:25 } }, animDuration:2000, // ← nerfé
  },
  chuuya: {
    templateId:'chuuya', name:'Gravité', duration:8, cooldown:270,
    description:'L\'ennemi reçoit +20% de dégâts pendant 8s',
    effect:{ enemyDamageTakenBonusPct:20 }, animDuration:2000,     // ← nerfé : était +30% 10s
  },

  // ══ MYTHIQUES — cooldown 360s ═════════════════════════════════════════
  ren_m: {
    templateId:'ren_m', name:'All-Out Attack', duration:1, cooldown:360,
    description:'Inflige instantanément 180% du DPS d\'équipe',
    effect:{ instantDamagePctTeamDps:180 }, animDuration:2400,     // ← nerfé : était 500%
  },
  ichigo: {
    templateId:'ichigo', name:'Bankai', duration:1, cooldown:360,
    description:'Envoie une attaque à 700% de son propre DPS',
    effect:{ instantDamagePctSelfDps:700 }, animDuration:2400,     // ← nerfé : était 1000%
  },
  ouma: {
    templateId:'ouma', name:'Mensonge', duration:10, cooldown:360,
    description:'×1.5 DPC & ×1.3 DPS pendant 10s',
    effect:{ dpcMultiplier:1.5, dpsMultiplier:1.3 }, animDuration:2200, // ← nerfé : était x2
  },
  jax: {
    templateId:'jax', name:'Numéro de Charme', duration:12, cooldown:360,
    description:'Le DPC croît de +6% à chaque clic pendant 12s',
    effect:{ comboGrowthPct:6 }, animDuration:2200,                // ← nerfé : était +15%
  },
  dazai: {
    templateId:'dazai', name:'Annulation', duration:1, cooldown:360,
    description:'Réinitialise le cooldown de l\'ultimate allié le plus avancé',
    effect:{ resetBestOtherCooldown:true }, animDuration:2200,
  },

  // ══ STELLAIRES — cooldown 420s ════════════════════════════════════════
  naruto: {
    templateId:'naruto', name:'Rasengan Géant', duration:12, cooldown:420,
    description:'×3 DPS personnel pendant 12s',
    effect:{ selfDpsMultiplier:3 }, animDuration:2400,             // ← nerfé : était x5
  },
  luffy: {
    templateId:'luffy', name:'Gatling Gun', duration:7, cooldown:420,
    description:'attaque automatiques (30/s à 5% du DPS d\'équipe) pendant 7s',
    effect:{ autoStrikes:{ perSecond:30, source:'teamDpsPct', value:5 } }, animDuration:2800, // ← nerfé
  },

  // ══ COSMIQUES — cooldown 480s ═════════════════════════════════════════
  vegeta: {
    templateId:'vegeta', name:'Final Flash', duration:30, cooldown:480,
    description:'×3.5 DPC et 1.75 DPS pendant 30s',
    effect:{ dpcMultiplier:3.5, dpsMultiplier:1.75 }, animDuration:2600, // ← nerfé : était x5
  },
  minato: {
    templateId:'minato', name:'Hiraishin', duration:1, cooldown:480,
    description:'Inflige instantanément 15% des PV max de l\'ennemi',
    effect:{ instantDamagePctMaxHp:15 }, animDuration:2600,         // ← nerfé : était 35%
  },
  gilgamesh: {
    templateId:'gilgamesh', name:'Gate of Babylon', duration:5, cooldown:480,
    description:'Épées automatiques (3/s à 90% du DPS d\'équipe) pendant 5s',
    effect:{ autoStrikes:{ perSecond:3, source:'teamDpsPct', value:90 } }, animDuration:2800, // ← nerfé
  },
  link_midona: {
    templateId:'link_midona', name:'Lien', duration:15, cooldown:480,
    description:'Le DPC croît de +8% à chaque clic pendant 15s (plafonné ×20)',
    effect:{ comboGrowthPct:8 }, animDuration:2600,                // ← nerfé : était +20% x50
  },
  jinwoo: {
    templateId:'jinwoo', name:'Arise', duration:7, cooldown:480,
    description:'Soldats de l\'ombre (3 attaques/s à 80% du DPS d\'équipe) pendant 7s',
    effect:{ autoStrikes:{ perSecond:3, source:'teamDpsPct', value:80 } }, animDuration:2600, // ← nerfé
  },

  // ══ PRIMORDIAUX — cooldown 540s ═══════════════════════════════════════
  goku: {
    templateId:'goku', name:'Kamehameha', duration:1, cooldown:540,
    description:'Inflige instantanément 22% des PV max de l\'ennemi',
    effect:{ instantDamagePctMaxHp:22 }, animDuration:2600, 
  },
  limule: {
    templateId:'limule', name:'Prédateur', duration:15, cooldown:540,
    description:'×2 DPS et ×2 monnaie pendant 15s',
    effect:{ dpsMultiplier:2, coinMultiplier:2 }, animDuration:3200,  // ← nerfé : était x6/x2
  },
  arthur_leywin: {
    templateId:'arthur_leywin', name:'Lame d\'Éther', duration:5, cooldown:540,
    description:'Épées automatiques (4/s à 100% du DPS d\'équipe) pendant 5s',
    effect:{ autoStrikes:{ perSecond:4, source:'teamDpsPct', value:100 } }, animDuration:3000,
  },

  // ══ TRANSCENDANT — cooldown 600s ══════════════════════════════════════
  nekoz: {
    templateId:'nekoz', name:'A Perte', duration:15, cooldown:600,
    description:'×2.5 DPC, ×2.5 DPS et ×1.5 monnaie pendant 15s',
    effect:{ dpcMultiplier:2.5, dpsMultiplier:2.5, coinMultiplier:1.5 }, animDuration:3200, // ← nerfé : était x3
  },
  cid_kagenou: {
    templateId:'cid_kagenou', name:'Atomic', duration:14, cooldown:300,
    description:'×4 DPS pendant 14s et 350% du DPS d’équipe en dégâts instantanés',
    effect:{ dpsMultiplier:4.0, instantDamagePctTeamDps:350 }, animDuration:2400,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// IDLE — conversion des effets de clic (morts en idle) vers des effets passifs.
// dpcMultiplier → dpsMultiplier, instantClicks → dégâts % DPS d'équipe, etc.
// ═══════════════════════════════════════════════════════════════════════════
function idleifyEffect(e: UltimateEffect): UltimateEffect {
  const out: UltimateEffect = { ...e };

  // Multiplicateur de clic → multiplicateur de DPS (on prend le meilleur des deux)
  if (out.dpcMultiplier) {
    out.dpsMultiplier = Math.max(out.dpsMultiplier ?? 1, out.dpcMultiplier);
    delete out.dpcMultiplier;
  }
  // Empilement / combo par clic → bonus de DPS plat (plus de clics à empiler)
  if (out.stackPerClickPct) { out.dpsMultiplier = Math.max(out.dpsMultiplier ?? 1, 1.35); delete out.stackPerClickPct; }
  if (out.comboGrowthPct)   { out.dpsMultiplier = Math.max(out.dpsMultiplier ?? 1, 1.45); delete out.comboGrowthPct; }
  // Bonus de pièces par clic → multiplicateur de pièces pendant la durée
  if (out.chancePerClickCoinBurst) { out.coinMultiplier = Math.max(out.coinMultiplier ?? 1, 1.4); delete out.chancePerClickCoinBurst; }
  // Multiplicateur du prochain clic → burst de dégâts instantané
  if (out.nextClickMultiplier) { out.instantDamagePctTeamDps = (out.instantDamagePctTeamDps ?? 0) + 120; delete out.nextClickMultiplier; }
  // Clics instantanés → dégâts instantanés basés sur le DPS d'équipe
  if (out.instantClicks) { out.instantDamagePctTeamDps = (out.instantDamagePctTeamDps ?? 0) + out.instantClicks * 40; delete out.instantClicks; }
  // Poison basé sur le DPC → bonus de DPS
  if (out.poisonDpsPctOfDpc) { out.dpsMultiplier = Math.max(out.dpsMultiplier ?? 1, 1 + out.poisonDpsPctOfDpc / 100); delete out.poisonDpsPctOfDpc; }
  // Frappes auto basées sur le DPC → basées sur le DPS d'équipe
  if (out.autoStrikes && out.autoStrikes.source === 'dpc') {
    out.autoStrikes = { ...out.autoStrikes, source: 'teamDpsPct', value: Math.max(out.autoStrikes.value, 0.05) };
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════════════════
// GÉNÉRATEUR — tout perso sans ulti explicite reçoit un ulti idle échelonné
// selon sa rareté (nom + effet + cooldown/durée cohérents).
// ═══════════════════════════════════════════════════════════════════════════
type Rarity = 'C'|'U'|'R'|'E'|'L'|'M'|'S'|'CO'|'P'|'T';

const RARITY_ULT: Record<Rarity, { name: string; duration: number; cooldown: number; effect: UltimateEffect; anim: number }> = {
  C:  { name:'Assaut',        duration:8,  cooldown:90,  effect:{ dpsMultiplier:1.5 },                                anim:1200 },
  U:  { name:'Déferlante',    duration:8,  cooldown:110, effect:{ dpsMultiplier:1.7 },                                anim:1200 },
  R:  { name:'Percée',        duration:9,  cooldown:130, effect:{ dpsMultiplier:1.9, coinMultiplier:1.2 },            anim:1300 },
  E:  { name:'Fureur',        duration:10, cooldown:150, effect:{ dpsMultiplier:2.1, coinMultiplier:1.3 },            anim:1400 },
  L:  { name:'Cataclysme',    duration:12, cooldown:180, effect:{ dpsMultiplier:2.4, coinMultiplier:1.4 },            anim:1600 },
  M:  { name:'Jugement',      duration:12, cooldown:210, effect:{ dpsMultiplier:2.8, enemyDamageTakenBonusPct:8 },    anim:1800 },
  S:  { name:'Supernova',     duration:13, cooldown:240, effect:{ dpsMultiplier:3.2, instantDamagePctTeamDps:200 },   anim:2000 },
  CO: { name:'Singularité',   duration:14, cooldown:300, effect:{ dpsMultiplier:3.8, coinMultiplier:1.6 },            anim:2200 },
  P:  { name:'Genèse',        duration:15, cooldown:360, effect:{ dpsMultiplier:4.5, instantDamagePctTeamDps:300 },   anim:2600 },
  T:  { name:'Transcendance',  duration:15, cooldown:480, effect:{ dpsMultiplier:5.5, coinMultiplier:1.8, instantDamagePctTeamDps:400 }, anim:3000 },
};

function describeEffect(e: UltimateEffect): string {
  const parts: string[] = [];
  if (e.dpsMultiplier)             parts.push(`×${e.dpsMultiplier} DPS`);
  if (e.coinMultiplier)            parts.push(`×${e.coinMultiplier} or`);
  if (e.enemyDamageTakenBonusPct)  parts.push(`+${e.enemyDamageTakenBonusPct}% dégâts subis`);
  if (e.instantDamagePctTeamDps)   parts.push(`+${e.instantDamagePctTeamDps}% DPS en dégâts instantanés`);
  return parts.join(', ');
}

function generateUltimate(templateId: string): UltimateDef | undefined {
  const tpl = getCharacterById(templateId);
  if (!tpl) return undefined;
  const arch = RARITY_ULT[tpl.rarity as Rarity] ?? RARITY_ULT.C;
  return {
    templateId,
    name: arch.name,
    description: `${describeEffect(arch.effect)} pendant ${arch.duration}s`,
    duration: arch.duration,
    cooldown: arch.cooldown,
    effect: arch.effect,
    animDuration: arch.anim,
  };
}

// Convertit aussi le TEXTE de description (les effets de clic n'existent plus).
function idleifyDescription(desc: string): string {
  return desc
    .replace(/DPC/g, 'DPS')
    .replace(/par clic/gi, 'auto')
    .replace(/au clic/gi, '')
    .replace(/à chaque clic/gi, 'en continu')
    .replace(/clics instantanés/gi, 'dégâts instantanés')
    .replace(/prochain clic/gi, 'burst')
    .replace(/\bclics?\b/gi, 'coups')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Cache des ultis résolus (def explicite idle-ifiée, ou généré par rareté).
const _ultCache: Record<string, UltimateDef | undefined> = {};

export const getUltimateDef = (templateId: string): UltimateDef | undefined => {
  if (templateId in _ultCache) return _ultCache[templateId];
  const explicit = ULTIMATE_DEFS[templateId];
  const resolved = explicit
    ? { ...explicit, description: idleifyDescription(explicit.description), effect: idleifyEffect(explicit.effect) }
    : generateUltimate(templateId);
  _ultCache[templateId] = resolved;
  return resolved;
};
