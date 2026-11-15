import { useCallback, useEffect, useState } from 'react';
import { api, getErrorMessage } from '../services/api';
import type { FarmTopResult, ProfileResponse } from '../services/api';
import { useApp } from '../context/AppContext';
import { ErrorBox, Spinner } from '../components/State';
import { fmt } from '../utils/format';

// Backend (config/game.ts) bilan bir xil bo'lishi kerak
const COINS_PER_HOUR_PER_LEVEL = 50;
const MAX_HOURS = 8;
const ENERGY_COST = 10;
const MIN_COLLECT = 0.01;

export default function Farm() {
  const { t, setBalance, toast, sfx } = useApp();
  const [p, setP] = useState<ProfileResponse | null>(null);
  const [lastCollect, setLastCollect] = useState<number>(Date.now());
  const [top, setTop] = useState<FarmTopResult | null>(null);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [profile, topRes] = await Promise.all([api.getProfile(), api.getFarmTop(10).catch(() => null)]);
      setP(profile);
      setLastCollect(new Date(profile.user.lastFarmCollect).getTime());
      setTop(topRes);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!p) return <Spinner />;

  const level = p.user.baseLevel;
  const perHour = level * COINS_PER_HOUR_PER_LEVEL;
  const hours = Math.min(Math.max(0, now - lastCollect) / 3_600_000, MAX_HOURS);
  const pending = Math.round(hours * perHour * 100) / 100;
  const fillPct = (hours / MAX_HOURS) * 100;
  const energy = p.energy;
  const energyPct = energy.max > 0 ? (energy.current / energy.max) * 100 : 0;
  const lowEnergy = energy.current < ENERGY_COST;
  const canCollect = !busy && pending >= MIN_COLLECT && !lowEnergy;

  const collect = async () => {
    if (!canCollect) return;
    setBusy(true);
    sfx('click');
    try {
      const r = await api.collectFarm();
      setBalance(r.balance);
      setP({ ...p, energy: r.energy });
      setLastCollect(Date.now());
      toast(`${t('farm.collected')}: +${fmt(r.collected)} 🪙`);
      sfx('win');
      void api.getFarmTop(10).then(setTop).catch(() => undefined);
    } catch (e) {
      toast(getErrorMessage(e), 'err');
      void load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 p-4">
      <h2 className="h-display text-base">🌾 {t('farm.title')}</h2>

      <div className="card flex flex-col items-center p-6" style={{ boxShadow: '0 0 30px rgba(139,92,246,.25)' }}>
        <span className="text-7xl">🏡</span>
        <p className="mt-2 text-xs font-bold text-muted">{t('farm.base')}</p>
        <p className="h-display text-2xl">{level}</p>
        <p className="mt-1 text-xs font-bold text-muted">
          +{fmt(perHour)} 🪙 {t('farm.perHour')}
        </p>
      </div>

      <div className="card p-4">
        <div className="mb-1 flex justify-between text-xs font-bold text-muted">
          <span>⚡ {t('farm.energy')}</span>
          <span>
            {energy.current}/{energy.max}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-raise">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${energyPct}%`, background: 'linear-gradient(90deg,var(--cyan),var(--primary))' }}
          />
        </div>
        <p className="mt-1 text-[11px] text-muted">Har yig'ishga {ENERGY_COST} energiya ketadi</p>
      </div>

      <div className="card p-4 text-center">
        <p className="text-xs font-bold text-muted">{t('farm.pending')}</p>
        <p className="h-display mt-1 text-3xl" style={{ color: 'var(--gold)' }}>
          🪙 {fmt(pending)}
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-raise">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${fillPct}%`, background: 'linear-gradient(90deg,var(--gold),#fb923c)' }}
          />
        </div>
        <p className="mt-1 text-[11px] text-muted">Maksimum {MAX_HOURS} soat to'planadi</p>
        <button className="btn-primary mt-3 w-full" onClick={collect} disabled={!canCollect}>
          {t('farm.collect')}
        </button>
        {lowEnergy && <p className="mt-2 text-xs font-bold text-bad">{t('farm.noEnergy')}</p>}
      </div>

      {top && top.top.length > 0 && (
        <div className="card p-4">
          <h3 className="mb-2 text-sm font-extrabold">🏆 Haftalik reyting</h3>
          {top.top.map((r) => (
            <div
              key={r.rank}
              className="flex items-center justify-between border-b border-raise py-2 text-sm last:border-0"
              style={r.isMe ? { color: 'var(--cyan)' } : undefined}
            >
              <span>
                {r.rank}. {r.username}
              </span>
              <span className="font-extrabold">{r.score === null ? '—' : fmt(r.score)}</span>
            </div>
          ))}
          <p className="mt-2 text-xs text-muted">
            Sizning o'rningiz: {top.me.rank ?? '—'} · {fmt(top.me.score)} 🪙
          </p>
        </div>
      )}
    </div>
  );
}