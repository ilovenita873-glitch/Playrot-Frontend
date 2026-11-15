import type { Rarity } from '../types';

export const fmt = (n: number): string => Math.floor(n).toLocaleString('en-US').replace(/,/g, ' ');

export const RARITY_STYLE: Record<Rarity, { border: string; glow: string; text: string }> = {
  common: { border: 'border-muted/40', glow: '', text: 'text-muted' },
  rare: { border: 'border-sky-400', glow: 'shadow-[0_0_14px_rgba(56,189,248,.45)]', text: 'text-sky-400' },
  epic: { border: 'border-fuchsia-500', glow: 'shadow-[0_0_16px_rgba(217,70,239,.5)]', text: 'text-fuchsia-500' },
  legendary: { border: 'border-amber-400', glow: 'shadow-[0_0_20px_rgba(251,191,36,.6)]', text: 'text-amber-400' },
  mythic: { border: 'border-rose-500', glow: 'shadow-[0_0_24px_rgba(244,63,94,.7)]', text: 'text-rose-500' },
};
