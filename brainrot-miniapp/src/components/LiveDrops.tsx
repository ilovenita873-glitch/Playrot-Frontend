import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { RARITY_STYLE } from '../utils/format';
import type { LiveDrop } from '../types';
import ItemIcon from './ItemIcon';

export default function LiveDrops() {
  const { t, user } = useApp();
  const [drops, setDrops] = useState<LiveDrop[]>([]);

  const load = useCallback(async () => {
    try {
      setDrops(await api.getLiveDrops());
    } catch {
      /* lenta muhim emas: xatoni jim o'tkazamiz */
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, [load]);

  if (drops.length === 0) return <p className="px-4 text-xs text-muted">{t('home.liveEmpty')}</p>;
  const loop = [...drops, ...drops];
  const hide = user?.settings.streamerMode;

  return (
    <div className="overflow-hidden">
      <div className="flex w-max animate-marquee gap-2 px-4">
        {loop.map((d, i) => {
          const r = RARITY_STYLE[d.item.rarity] ?? RARITY_STYLE.common;
          return (
            <div key={`${d.id}-${i}`} className={`flex w-28 shrink-0 flex-col items-center rounded-xl border-b-4 bg-card p-2 ${r.border}`}>
              <ItemIcon item={d.item} size="text-3xl" />
              <span className="mt-1 line-clamp-1 text-[11px] font-extrabold">{d.item.name}</span>
              <span className="line-clamp-1 text-[10px] text-muted">{hide ? '••••' : `@${d.username}`}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
