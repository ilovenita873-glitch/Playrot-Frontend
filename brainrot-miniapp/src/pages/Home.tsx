import { useCallback, useEffect, useState } from 'react';
import { api, getErrorMessage } from '../services/api';
import type { CaseBox } from '../services/api';
import { useApp } from '../context/AppContext';
import CaseCard from '../components/CaseCard';
import CaseDetail from './CaseDetail';
import { LiveBlock, HeroBanner } from '../components/HomeBlocks';
import { ErrorBox, Spinner } from '../components/State';
import { fmt } from '../utils/format';

export default function Home() {
  const { t, setBalance, toast, sfx } = useApp();
  const [cases, setCases] = useState<CaseBox[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CaseBox | null>(null);
  const [promo, setPromo] = useState('');
  const [promoBusy, setPromoBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setCases(await api.getCases());
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activate = async () => {
    const code = promo.trim();
    if (code.length < 3 || promoBusy) return;
    setPromoBusy(true);
    try {
      const r = await api.activatePromo(code);
      setBalance(r.balance);
      setPromo('');
      toast(`+${fmt(r.reward)} 🪙`);
      sfx('win');
    } catch (e) {
      toast(getErrorMessage(e), 'err');
    } finally {
      setPromoBusy(false);
    }
  };

  // Keys tanlangan: Detail sahifa (modal emas)
  if (selected) {
    return (
      <div className="space-y-3 pb-4">
        <LiveBlock drops={[]} />
        <CaseDetail box={selected} onBack={() => setSelected(null)} />
      </div>
    );
  }

  const canApply = !promoBusy && promo.trim().length >= 3;

  return (
    <div className="space-y-4 pb-4">
      {/* Jonli yutuqlar: backendda /cases/live yo'q, shuning uchun hozircha bo'sh */}
      <LiveBlock drops={[]} />

      <section className="px-3">
        <div className="flex items-center gap-2 rounded-2xl border border-[color-mix(in_srgb,currentColor_15%,transparent)] bg-[color-mix(in_srgb,currentColor_6%,transparent)] p-2 backdrop-blur">
          <input
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm font-bold uppercase tracking-widest text-inherit outline-none placeholder:font-semibold placeholder:normal-case placeholder:tracking-normal placeholder:opacity-50"
            placeholder="Promokod kiriting"
            value={promo}
            maxLength={32}
            autoComplete="off"
            onChange={(e) => setPromo(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && void activate()}
          />
          <button
            className="btn-gold shrink-0 px-5 py-2 text-sm transition active:scale-95 disabled:opacity-40"
            disabled={!canApply}
            onClick={activate}
          >
            {promoBusy ? '...' : 'OK'}
          </button>
        </div>
      </section>

      <HeroBanner onOpen={() => cases?.[0] && setSelected(cases[0])} />

      <section>
        <h2 className="h-display mb-2 px-4 text-sm">{t('home.cases')}</h2>
        {error ? (
          <ErrorBox message={error} onRetry={load} />
        ) : !cases ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-2 gap-3 px-4">
            {cases.map((c) => (
              <CaseCard key={c.id} box={c} onClick={() => setSelected(c)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}