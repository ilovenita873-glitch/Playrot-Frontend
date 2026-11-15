import { useEffect, useRef, useState } from 'react';
import { api, getErrorMessage } from '../services/api';
import type { CaseBox, OpenCaseResult } from '../services/api';
import { useApp } from '../context/AppContext';
import CaseReel, { ItemThumb } from '../components/CaseReel';
import { fmt } from '../utils/format';

const COUNTS = [1, 3, 5];
const SELL_RATE = 0.9; // backend: GAME.ITEM_SELL_RATE
const SPIN_MS = 5500;

type Phase = 'idle' | 'spinning' | 'done';

export default function CaseDetail({ box, onBack }: { box: CaseBox; onBack: () => void }) {
  const { user, setBalance, toast, sfx } = useApp();
  const [count, setCount] = useState(1);
  const [fast, setFast] = useState(false); // true = animatsiyani o'tkazib yuborish
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<OpenCaseResult | null>(null);
  const [showReels, setShowReels] = useState(false);
  const [runId, setRunId] = useState(0);
  const [busy, setBusy] = useState(false);
  const [sold, setSold] = useState(false);

  const endedRef = useRef(0);
  const dropsCountRef = useRef(0);
  const pendingBalance = useRef<number | null>(null);

  const balance = user?.balance ?? 0;
  const total = Math.round(box.price * count * 100) / 100;
  const missing = Math.round((total - balance) * 100) / 100;
  const canAfford = balance >= total;
  const spinning = phase === 'spinning';

  // Sahifadan chiqib ketilsa ham balans yangilanadi
  useEffect(
    () => () => {
      if (pendingBalance.current !== null) setBalance(pendingBalance.current);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const finish = () => {
    if (pendingBalance.current !== null) {
      setBalance(pendingBalance.current);
      pendingBalance.current = null;
    }
    setPhase('done');
    sfx('win');
  };

  const onReelEnd = () => {
    endedRef.current += 1;
    if (endedRef.current >= dropsCountRef.current) finish();
  };

  const open = async () => {
    if (busy || spinning) return;
    if (!canAfford) return toast("Balansda mablag' yetarli emas", 'err');
    setBusy(true);
    setSold(false);
    sfx('click');
    try {
      const r = await api.openCase(box.id, count);
      endedRef.current = 0;
      dropsCountRef.current = r.drops.length;
      setResult(r);
      setRunId((n) => n + 1);
      if (fast) {
        setShowReels(false);
        setBalance(r.balance);
        setPhase('done');
        sfx('win');
      } else {
        // Natija ruletka tugagach ko'rinadi, balans ham shundan keyin yangilanadi
        pendingBalance.current = r.balance;
        setShowReels(true);
        setPhase('spinning');
      }
    } catch (e) {
      toast(getErrorMessage(e), 'err');
    } finally {
      setBusy(false);
    }
  };

  const sellAll = async () => {
    if (!result || sold || busy) return;
    setBusy(true);
    try {
      const grouped = new Map<string, number>();
      result.drops.forEach((d) => grouped.set(d.itemId, (grouped.get(d.itemId) ?? 0) + 1));
      let bal = balance;
      let amount = 0;
      for (const [itemId, qty] of grouped) {
        const r = await api.sellItem(itemId, qty);
        bal = r.balance;
        amount += r.amount;
      }
      setBalance(bal);
      setSold(true);
      toast(`+${fmt(amount)} 🪙`);
      sfx('win');
    } catch (e) {
      toast(getErrorMessage(e), 'err');
    } finally {
      setBusy(false);
    }
  };

  const sellValue = result ? Math.round(result.totalValue * SELL_RATE * 100) / 100 : 0;

  return (
    <div className="space-y-3 px-4 pb-4">
      <button className="btn-ghost px-4 py-2 text-sm" onClick={onBack} disabled={spinning}>
        ‹ Orqaga
      </button>

      <h2 className="h-display text-center text-2xl">{box.name}</h2>

      {/* Keys rasmi yoki ruletka */}
      {result && showReels ? (
        <div className="space-y-2">
          {result.drops.map((d, i) => (
            <CaseReel
              key={`${runId}-${i}`}
              pool={box.items}
              winner={d}
              running
              durationMs={SPIN_MS + i * 350}
              height={result.drops.length > 1 ? 84 : 112}
              onEnd={onReelEnd}
            />
          ))}
        </div>
      ) : !result ? (
        <div className="pr-case-hero">
          {box.imageUrl ? <img src={box.imageUrl} alt={box.name} /> : <span style={{ fontSize: 110 }}>📦</span>}
        </div>
      ) : null}

      {/* Natija */}
      {phase === 'done' && result && (
        <div className="card p-4 text-center">
          <p className="h-display text-lg">🎉 Sizga tushdi</p>
          <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(result.drops.length, 3)}, 1fr)` }}>
            {result.drops.map((d, i) => (
              <div key={i} className="pr-prize" data-rarity={d.rarity}>
                <ItemThumb item={d} size={56} />
                <span className="pr-prize-name">{d.name}</span>
                <span className="pr-prize-val">🪙 {fmt(d.value)}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm font-extrabold" style={{ color: 'var(--gold)' }}>
            Jami: 🪙 {fmt(result.totalValue)}
          </p>
          <button className="btn-gold mt-3 w-full" disabled={sold || busy} onClick={sellAll}>
            {sold ? 'Sotildi ✓' : `Hammasini sotish +🪙 ${fmt(sellValue)}`}
          </button>
        </div>
      )}

      {/* Boshqaruv */}
      <div className="card space-y-3 p-3">
        <div className="flex gap-2">
          {COUNTS.map((c) => (
            <button
              key={c}
              disabled={spinning}
              className={`chip flex-1 py-2 text-sm ${c === count ? 'chip-on' : ''}`}
              onClick={() => setCount(c)}
            >
              x{c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button disabled={spinning} className={`chip flex-1 py-2 text-sm ${!fast ? 'chip-on' : ''}`} onClick={() => setFast(false)}>
            ⏳ Sekin
          </button>
          <button disabled={spinning} className={`chip flex-1 py-2 text-sm ${fast ? 'chip-on' : ''}`} onClick={() => setFast(true)}>
            ⏩ O'tkazib yuborish
          </button>
        </div>
      </div>

      {canAfford ? (
        <button className="btn-primary w-full py-4 text-lg" disabled={busy || spinning} onClick={open}>
          {spinning ? '...' : phase === 'done' ? 'Yana ochish' : 'Ochish'} · 🪙 {fmt(total)}
        </button>
      ) : (
        <div className="pr-nofunds">
          <span>YETARLI EMAS</span>
          <b>🪙 {fmt(missing)}</b>
        </div>
      )}

      {/* Mumkin bo'lgan sovrinlar */}
      <p className="pt-2 text-center text-xs font-bold tracking-widest text-muted">MUMKIN BO'LGAN SOVRINLAR</p>
      <div className="grid grid-cols-2 gap-3">
        {box.items.map((it) => (
          <div key={it.itemId} className="pr-prize" data-rarity={it.rarity}>
            <ItemThumb item={it} size={64} />
            <span className="pr-prize-name">{it.name}</span>
            <span className="pr-prize-val">🪙 {fmt(it.value)}</span>
            <span className="pr-prize-chance">{it.chance}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}