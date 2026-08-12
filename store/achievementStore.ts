'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ACHIEVEMENTS, Achievement } from '@/lib/game/achievements';
import { toast } from '@/hooks/useToast';

interface AchievementState {
  // id → progress value
  progress: Record<string, number>;
  // id → unlocked
  unlocked: Record<string, boolean>;
  // titre actif choisi par le joueur
  activeTitle: string;
  // Titres débloqués
  unlockedTitles: string[];

  // Actions
  setProgress: (id: string, value: number) => void;
  bumpProgress: (id: string, by?: number) => void;
  setActiveTitle: (title: string) => void;
  getAchievement: (id: string) => Achievement | undefined;
  getProgress: (id: string) => number;
  isUnlocked: (id: string) => boolean;
  unlockedCount: () => number;
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      progress: {},
      unlocked: {},
      activeTitle: 'Novice',
      unlockedTitles: [],

      getAchievement: (id) => ACHIEVEMENTS.find(a => a.id === id),
      getProgress:    (id) => get().progress[id] ?? 0,
      isUnlocked:     (id) => !!get().unlocked[id],
      unlockedCount:  ()   => Object.values(get().unlocked).filter(Boolean).length,

      setActiveTitle: (title) => set({ activeTitle: title }),

      setProgress: (id, value) => {
        const achiev = ACHIEVEMENTS.find(a => a.id === id);
        if (!achiev) return;
        const already = get().unlocked[id];
        const prev    = get().progress[id] ?? 0;
        const next    = Math.max(prev, value);
        const done    = next >= achiev.target;

        set(s => ({
          progress: { ...s.progress, [id]: next },
          unlocked: done ? { ...s.unlocked, [id]: true } : s.unlocked,
          unlockedTitles: (done && !already && achiev.reward?.type === 'title' && typeof achiev.reward.value === 'string')
            ? [...s.unlockedTitles, achiev.reward.value as string]
            : s.unlockedTitles,
        }));

        // Toast de déverrouillage
        if (done && !already) {
          const rewardMsg = achiev.reward
            ? achiev.reward.type === 'gems'
              ? `+${achiev.reward.value} 💎`
              : achiev.reward.type === 'title'
                ? `Titre : « ${achiev.reward.value} »`
                : ''
            : '';
          toast.levelup(`🏆 ${achiev.name}`, rewardMsg || achiev.description);
        }
      },

      bumpProgress: (id, by = 1) => {
        const current = get().progress[id] ?? 0;
        get().setProgress(id, current + by);
      },
    }),
    {
      name: 'gachaverse_achievements',
      partialize: (s) => ({
        progress: s.progress,
        unlocked: s.unlocked,
        activeTitle: s.activeTitle,
        unlockedTitles: s.unlockedTitles,
      }),
    }
  )
);

// ── Helpers appelés depuis gameStore / GameLayout ─────────────────────────

export function trackClicks(totalClicks: number) {
  const s = useAchievementStore.getState();
  s.setProgress('first_click', Math.min(totalClicks, 1));
  s.setProgress('clicks_100',    Math.min(totalClicks, 100));
  s.setProgress('clicks_1000',   Math.min(totalClicks, 1000));
  s.setProgress('clicks_10000',  Math.min(totalClicks, 10000));
  s.setProgress('clicks_100000', Math.min(totalClicks, 100000));
}

export function trackBossKill(bossCrowns: number) {
  const s = useAchievementStore.getState();
  s.setProgress('first_boss', Math.min(bossCrowns, 1));
  s.setProgress('bosses_5',   Math.min(bossCrowns, 5));
  s.setProgress('bosses_20',  Math.min(bossCrowns, 20));
}

export function trackPalier(palier: number) {
  const s = useAchievementStore.getState();
  s.setProgress('palier_5',  Math.min(palier, 5));
  s.setProgress('palier_10', Math.min(palier, 10));
  s.setProgress('palier_15', Math.min(palier, 15));
  s.setProgress('palier_20', Math.min(palier, 20));
}

export function trackCoins(coins: number) {
  const s = useAchievementStore.getState();
  s.setProgress('coins_100k', Math.min(coins, 100000));
  s.setProgress('coins_10m',  Math.min(coins, 10000000));
  s.setProgress('coins_1b',   Math.min(coins, 1000000000));
}

export function trackDps(dps: number) {
  const s = useAchievementStore.getState();
  s.setProgress('dps_1000', Math.min(dps, 1000));
  s.setProgress('dps_1m',   Math.min(dps, 1000000));
}

export function trackCollection(ownedCount: number, hasLegendary: boolean, hasTranscendant: boolean, totalPool: number) {
  const s = useAchievementStore.getState();
  s.setProgress('collect_1',  Math.min(ownedCount, 1));
  s.setProgress('collect_5',  Math.min(ownedCount, 5));
  s.setProgress('collect_15', Math.min(ownedCount, 15));
  s.setProgress('collect_30', Math.min(ownedCount, 30));
  s.setProgress('collect_all', ownedCount >= totalPool ? 999 : ownedCount);
  if (hasLegendary)     s.setProgress('legendary_1',     1);
  if (hasTranscendant)  s.setProgress('transcendant_1',  1);
}

export function trackEquippedTeam(filledSlots: number) {
  const s = useAchievementStore.getState();
  s.setProgress('equip_team', Math.min(filledSlots, 4));
}

export function trackGachaPulls(total: number) {
  const s = useAchievementStore.getState();
  s.setProgress('pull_1',   Math.min(total, 1));
  s.setProgress('pull_10',  Math.min(total, 10));
  s.setProgress('pull_100', Math.min(total, 100));
  s.setProgress('pull_500', Math.min(total, 500));
}

export function trackClickUpgrade(level: number) {
  const s = useAchievementStore.getState();
  s.setProgress('upgrade_10', Math.min(level, 10));
  s.setProgress('upgrade_50', Math.min(level, 50));
}

export function trackQuestsCompleted(count: number) {
  const s = useAchievementStore.getState();
  s.setProgress('quest_10', Math.min(count, 10));
  s.setProgress('quest_50', Math.min(count, 50));
}
