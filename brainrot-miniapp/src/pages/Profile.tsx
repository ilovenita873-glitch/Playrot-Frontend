import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Transaction } from '../services/api';
import { useApp } from '../context/AppContext';
import { fmt } from '../utils/format';

const TYPE_LABEL: Record<string, string> = {
  CASE_OPEN: '📦 Keys ochildi',
  UPGRADE_BET: '⬆️ Upgrade stavka',
  UPGRADE_WIN: '⬆️ Upgrade yutuq',
  ROCKET_BET: '🚀 Raketa stavka',
  ROCKET_WIN: '🚀 Raketa yutuq',
  MINES_BET: '💣 Mines stavka',
  MINES_WIN: '💣 Mines yutuq',
  FARM_COLLECT: '🌾 Ferma',
  QUEST_REWARD: '📜 Kvest',
  SHOP_PURCHASE: '🛒 Xarid',
  PROMOCODE: '🎟 Promokod',
  ITEM_SELL: '💰 Sotildi',
};

export default function Profile({ onSettings }: { onSettings: () => void }) {
  const { user, t } = useApp();
  const [history, setHistory] = useState<Transaction[]>([]);

  useEffect(() => {
    api
      .getHistory(10)
      .then((r) => setHistory(r.items))
      .catch(() => undefined);
  }, []);

  if (!user) return null;

  // Backend tekis maydonlar qaytaradi; eski `user.settings` bo'lsa ham ishlaydi
  const u = user as any;
  const streamer: boolean = u.settings?.streamerMode ?? u.streamerMode ?? false;
  const hideStats: boolean = u.settings?.hideStats ?? u.hideStats ?? false;
  const name = u.username ? `@${u.username}` : u.firstName ?? 'Player';
  const letter = (u.firstName || u.username || '?').charAt(0).toUpperCase();

  return (
    <div className="space-y-3 p-4">
      <div className="card flex flex-col items-center p-6" style={{ boxShadow: '0 0 30px rgba(139,92,246,.25)' }}>
        <div className="pr-avatar" style={{ width: 80, height: 80, fontSize: 32 }}>
          {u.avatarUrl && !streamer ? (
            <img src={u.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            letter
          )}
        </div>
        <p className="h-display mt-4 text-base">{streamer ? '••••••' : name}</p>
        <p className="text-xs font-bold text-muted">
          {t('common.level')} {u.level ?? u.baseLevel ?? 1}
        </p>
        <p className="mt-2 text-lg font-extrabold" style={{ color: 'var(--gold)' }}>
          🪙 {streamer ? '•••' : fmt(user.balance)}
        </p>
      </div>

      <div className="card p-4">
        <h3 className="mb-2 text-sm font-extrabold">{t('profile.stats')}</h3>
        {hideStats ? (
          <p className="text-sm text-muted">{t('profile.hidden')}</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted">Hali operatsiyalar yo'q</p>
        ) : (
          history.map((h) => (
            <div key={h.id} className="flex justify-between border-b border-raise py-2 text-sm last:border-0">
              <span className="text-muted">{TYPE_LABEL[h.type] ?? h.type}</span>
              <span className="font-extrabold" style={{ color: h.amount >= 0 ? 'var(--rarity-uncommon)' : 'var(--rarity-mythic)' }}>
                {h.amount >= 0 ? '+' : ''}
                {fmt(h.amount)}
              </span>
            </div>
          ))
        )}
      </div>

      <button className="btn-ghost w-full" onClick={onSettings}>
        ⚙️ {t('settings.title')}
      </button>
    </div>
  );
}