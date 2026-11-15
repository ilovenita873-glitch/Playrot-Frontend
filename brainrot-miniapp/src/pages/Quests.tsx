import { useCallback, useEffect, useState } from 'react';
import { api, getErrorMessage } from '../services/api';
import type { Quest } from '../services/api';
import { useApp } from '../context/AppContext';
import { Empty, ErrorBox, Spinner } from '../components/State';
import { fmt } from '../utils/format';

export default function Quests() {
  const { t, setBalance, toast, sfx } = useApp();
  const [quests, setQuests] = useState<Quest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setQuests(await api.getQuests());
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const claim = async (q: Quest) => {
    setBusyId(q.id);
    try {
      const r = await api.claimQuest(q.id);
      setBalance(r.balance);
      setQuests((prev) => prev?.map((x) => (x.id === q.id ? { ...x, completed: true, claimed: true, progress: x.target } : x)) ?? prev);
      toast(`+${fmt(r.reward)} 🪙`);
      sfx('win');
    } catch (e) {
      toast(getErrorMessage(e), 'err');
      void load();
    } finally {
      setBusyId(null);
    }
  };

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!quests) return <Spinner />;

  return (
    <div className="space-y-3 p-4">
      <h2 className="h-display text-base">📜 {t('quests.title')}</h2>
      {quests.length === 0 && <Empty />}
      {quests.map((q) => {
        const isChannel = q.metric === 'TELEGRAM_CHANNEL';
        const ready = q.completed || q.progress >= q.target || isChannel;
        const pct = Math.min(100, (q.progress / Math.max(1, q.target)) * 100);
        return (
          <div key={q.id} className="card p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-sm font-extrabold">{q.title}</span>
                {q.isDaily && (
                  <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-extrabold" style={{ background: 'rgba(34,211,238,.15)', color: 'var(--cyan)' }}>
                    KUNLIK
                  </span>
                )}
                {q.description && <p className="mt-0.5 text-[11px] text-muted">{q.description}</p>}
              </div>
              <span className="shrink-0 text-xs font-extrabold" style={{ color: 'var(--gold)' }}>
                +{fmt(q.reward)} 🪙
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-raise">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${q.claimed ? 100 : pct}%`, background: 'linear-gradient(90deg,var(--primary),var(--pink))' }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-muted">
                {Math.min(q.progress, q.target)}/{q.target}
              </span>
              <div className="flex gap-2">
                {isChannel && q.link && !q.claimed && (
                  <button className="btn-ghost px-3 py-1.5" onClick={() => window.open(q.link!, '_blank')}>
                    Kanal
                  </button>
                )}
                <button
                  className="btn-primary px-4 py-1.5"
                  disabled={!ready || q.claimed || busyId === q.id}
                  onClick={() => claim(q)}
                >
                  {q.claimed ? t('quests.claimed') : t('quests.claim')}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}