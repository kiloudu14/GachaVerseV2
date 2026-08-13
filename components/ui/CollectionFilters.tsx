'use client';

import { RARITY_CONFIG, type Rarity } from '@/types/game';

export const COLLECTION_RARITY_ORDER: Rarity[] = ['C', 'U', 'R', 'E', 'L', 'M', 'S', 'CO', 'P', 'T'];

export type CollectionFilterMode = Rarity | 'all' | 'owned' | 'missing';
export type CollectionSortMode = 'rarity' | 'dps_desc' | 'dps_asc' | 'name';

export const COLLECTION_SORT_LABELS: Record<CollectionSortMode, string> = {
  rarity: 'RARETÉ',
  dps_desc: 'DPS ↓',
  dps_asc: 'DPS ↑',
  name: 'NOM A→Z',
};

export function CollectionFilters({
  filter,
  onFilterChange,
  universe,
  onUniverseChange,
  sort,
  onSortChange,
  universes,
}: {
  filter: CollectionFilterMode;
  onFilterChange: (value: CollectionFilterMode) => void;
  universe: string | 'all';
  onUniverseChange: (value: string | 'all') => void;
  sort: CollectionSortMode;
  onSortChange: (value: CollectionSortMode) => void;
  universes: string[];
}) {
  const FilterBtn = ({ k, label, accent }: { k: CollectionFilterMode; label: string; accent?: string }) => (
    <button
      key={k}
      onClick={() => onFilterChange(k)}
      style={{
        padding: '6px 14px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontFamily: 'var(--f-ui)',
        fontWeight: 700,
        fontSize: '11px',
        letterSpacing: '0.5px',
        transition: 'all 0.15s',
        background: filter === k ? `${accent ?? '#60a5fa'}18` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${filter === k ? `${accent ?? '#60a5fa'}55` : 'var(--border)'}`,
        color: filter === k ? (accent ?? '#60a5fa') : 'var(--text-dim)',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--f-ui)', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', marginRight: '2px' }}>FILTRE</span>
        <FilterBtn k="all" label="TOUS" />
        <FilterBtn k="owned" label="✓ POSSÉDÉS" accent="#4ade80" />
        <FilterBtn k="missing" label="🔒 MANQUANTS" accent="#f87171" />
        <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px' }} />
        {COLLECTION_RARITY_ORDER.map(r => {
          const c = RARITY_CONFIG[r];
          return <FilterBtn key={r} k={r} label={c.label} accent={c.color} />;
        })}
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--f-ui)', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', marginRight: '2px' }}>UNIVERS</span>
        <button
          onClick={() => onUniverseChange('all')}
          style={{
            padding: '5px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'var(--f-ui)',
            fontWeight: 700,
            fontSize: '10px',
            background: universe === 'all' ? 'rgba(192,132,252,0.15)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${universe === 'all' ? 'rgba(192,132,252,0.4)' : 'var(--border)'}`,
            color: universe === 'all' ? 'var(--purple-glow)' : 'var(--text-dim)',
          }}
        >
          TOUS
        </button>
        {universes.map(u => (
          <button
            key={u}
            onClick={() => onUniverseChange(u)}
            style={{
              padding: '5px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'var(--f-ui)',
              fontWeight: 700,
              fontSize: '10px',
              background: universe === u ? 'rgba(192,132,252,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${universe === u ? 'rgba(192,132,252,0.4)' : 'var(--border)'}`,
              color: universe === u ? 'var(--purple-glow)' : 'var(--text-dim)',
            }}
          >
            {u}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', paddingBottom: '6px' }}>
        <span style={{ fontFamily: 'var(--f-ui)', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', marginRight: '2px' }}>TRI</span>
        {(Object.keys(COLLECTION_SORT_LABELS) as CollectionSortMode[]).map(s => (
          <button
            key={s}
            onClick={() => onSortChange(s)}
            style={{
              padding: '5px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'var(--f-ui)',
              fontWeight: 700,
              fontSize: '10px',
              background: sort === s ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${sort === s ? 'rgba(251,191,36,0.4)' : 'var(--border)'}`,
              color: sort === s ? '#fbbf24' : 'var(--text-dim)',
            }}
          >
            {COLLECTION_SORT_LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  );
}
