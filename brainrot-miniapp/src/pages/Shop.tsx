import { useCallback, useEffect, useState } from 'react';
import { api, getErrorMessage } from '../services/api';
import type { ShopItem } from '../services/api';
import { useApp } from '../context/AppContext';
import { Empty, ErrorBox, Spinner } from '../components/State';
import { fmt } from '../utils/format';

const RARITY_COLOR: Record<string, string> = {
  COMMON: 'var(--rarity-common)',
  UNCOMMON: 'var(--rarity-uncommon)',
  RARE: 'var(--rarity-rare)',
  EPIC: 'var(--rarity-epic)',
  LEGENDARY: 'var(--rarity-legendary)',
  MYTHIC: 'var(--rarity-mythic)',
};

export default function Shop() {
  const { t, user, setBalance, toast, sfx } = useApp();
  const [items, setItems] = useState<ShopItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems(await api.getShop());
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const buy = async (it: ShopItem) => {
    if ((user?.balance ?? 0) < it.price) return toast(t('common.notEnough'), 'err');
    setBusyId(it.shopItemId);
    sfx('click');
    try {
      const r = await api.buyShopItem(it.shopItemId, 1);
      setBalance(r.balance);
      setItems((prev) =>
        prev
          ?.map((x) => (x.shopItemId === it.shopItemId && x.stock !== null ? { ...x, stock: x.stock - 1 } : x))
          .filter((x) => x.stock === null || x.stock > 0) ?? prev,
      );
      toast(t('shop.bought'));
      sfx('win');
    } catch (e) {
      toast(getErrorMessage(e), 'err');
      void load();
    } finally {
      setBusyId(null);
    }
  };

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!items) return <Spinner />;

  return (
    <div className="space-y-3 p-4">
      <h2 className="h-display text-base">🛒 {t('shop.title')}</h2>
      {items.length === 0 && <Empty />}
      <div className="grid grid-cols-2 gap-3">
        {items.map((it) => {
          const color = RARITY_COLOR[it.item.rarity] ?? 'var(--line)';
          return (
            <div
              key={it.shopItemId}
              className="card flex flex-col items-center gap-1 p-3 text-center"
              style={{ borderColor: color, boxShadow: `inset 0 -26px 30px -22px ${color}` }}
            >
              {it.item.imageUrl ? (
                <img src={it.item.imageUrl} alt="" className="h-16 w-16 object-contain" />
              ) : (
                <span className="text-4xl">{it.item.type === 'PET' ? '🐾' : '🎁'}</span>
              )}
              <span className="text-sm font-extrabold">{it.item.name}</span>
              <span className="text-[11px] font-bold" style={{ color }}>
                {it.item.rarity}
              </span>
              {it.stock !== null && <span className="text-[11px] text-muted">Omborda: {it.stock}</span>}
              <button
                className="btn-primary mt-2 w-full py-2"
                disabled={busyId === it.shopItemId}
                onClick={() => buy(it)}
              >
                {t('shop.buy')} · 🪙 {fmt(it.price)}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}