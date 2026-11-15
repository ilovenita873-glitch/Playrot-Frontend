import { useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import ItemIcon from './ItemIcon';
import { Spinner } from './State';
import { api, getErrorMessage } from '../services/api';
import { useApp } from '../context/AppContext';
import { fmt, RARITY_STYLE } from '../utils/format';
import type { CaseBox, Item } from '../types';

const ITEM_W = 96; // px (w-24)
const WIN_INDEX = 38;
const REEL_LEN = 46;
const SPIN_MS = 4200;

type Phase = 'idle' | 'spin' | 'done';

export default function CaseModal({ box, onClose }: { box: CaseBox | null; onClose: () => void }) {
  const { t, user, setBalance, toast, sfx } = useApp();
  const [full, setFull] = useState<CaseBox | null>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [busy, setBusy] = useState(false);
  const [reel, setReel] = useState<Item[]>([]);
  const [offset, setOffset] = useState(0);
  const [won, setWon] = useState<Item | null>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  // Modal ochilganda keysning to'liq ro'yxatini (itemlar bilan) yuklaymiz
  useEffect(() => {
    clearTimers();
    setPhase('idle');
    setWon(null);
    setOffset(0);
    setBusy(false);
    if (!box) {
      setFull(null);
      return;
    }
    if (box.items && box.items.length > 0) {
      setFull(box);
      return;
    }
    let alive = true;
    setFull(box);
    setLoading(true);
    api
      .getCase(box.id)
      .then((c) => alive && setFull({ ...box, ...c }))
      .catch((e) => alive && toast(getErrorMessage(e), 'err'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box?.id]);

  useEffect(() => clearTimers, []);

  if (!box) return null;
  const items = full?.items ?? [];
  const price = full?.price ?? box.price;
  const canAfford = (user?.balance ?? 0) >= price;

  const open = async () => {
    if (busy || items.length === 0) return;
    if (!canAfford) {
      toast(t('common.notEnough'), 'err');
      return;
    }
    setBusy(true);
    setWon(null);
    sfx('click');
    try {
      const res = await api.openCase(box.id);
      const strip: Item[] = Array.from({ length: REEL_LEN }, () => items[Math.floor(Math.random() * items.length)]);
      strip[WIN_INDEX] = res.item;
      setReel(strip);
      setOffset(0);
      setPhase('spin');

      const viewW = viewRef.current?.clientWidth ?? 320;
      const jitter = Math.floor(Math.random() * (ITEM_W - 24)) - (ITEM_W - 24) / 2;
      timers.current.push(
        window.setTimeout(() => setOffset(-(WIN_INDEX * ITEM_W + ITEM_W / 2 - viewW / 2 + jitter)), 60),
        window.setTimeout(() => {
          setPhase('done');
          setWon(res.item);
          setBalance(res.balance);
          setBusy(false);
          sfx('win');
        }, SPIN_MS + 200),
      );
    } catch (e) {
      toast(getErrorMessage(e), 'err');
      setPhase('idle');
      setBusy(false);
    }
  };

  const spinning = phase === 'spin';

  return (
    <Modal open={!!box} onClose={onClose} title={`${box.emoji} ${box.name}`} locked={busy}>
      {/* Reel / natija */}
      {phase !== 'idle' && (
        <div ref={viewRef} className="relative mb-3 h-32 overflow-hidden rounded-2xl bg-card">
          <div className="absolute inset-y-0 left-1/2 z-10 w-0.5 -translate-x-1/2 bg-accent" />
          <div
            className="flex h-full items-center"
            style={{
              transform: `translateX(${offset}px)`,
              transition: spinning && offset !== 0 ? `transform ${SPIN_MS}ms cubic-bezier(.12,.7,.1,1)` : 'none',
            }}
          >
            {reel.map((it, i) => {
              const r = RARITY_STYLE[it.rarity] ?? RARITY_STYLE.common;
              return (
                <div key={i} style={{ width: ITEM_W }} className={`flex h-24 shrink-0 flex-col items-center justify-center border-b-4 ${r.border}`}>
                  <ItemIcon item={it} size="text-4xl" />
                  <span className="mt-1 line-clamp-1 px-1 text-[10px] font-bold">{it.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {won && (
        <div className={`mb-3 animate-pop rounded-2xl border-2 bg-card p-4 text-center ${RARITY_STYLE[won.rarity]?.border} ${RARITY_STYLE[won.rarity]?.glow}`}>
          <p className="text-xs font-bold text-muted">{t('case.won')}</p>
          <div className="my-1 flex justify-center"><ItemIcon item={won} size="text-6xl" /></div>
          <p className="h-display text-base">{won.name}</p>
          <p className={`text-xs font-extrabold ${RARITY_STYLE[won.rarity]?.text}`}>{won.rarity}</p>
          <p className="mt-1 text-sm font-extrabold">{t('case.sold')}: 🪙 {fmt(won.value)}</p>
        </div>
      )}

      <button className="btn-primary w-full" onClick={open} disabled={busy || loading || items.length === 0 || !canAfford}>
        {busy ? t('case.opening') : phase === 'done' ? `${t('case.openAgain')} · 🪙 ${fmt(price)}` : `${t('case.open')} 🪙 ${fmt(price)}`}
      </button>
      {!canAfford && !busy && <p className="mt-1 text-center text-xs font-bold text-bad">{t('common.notEnough')}</p>}

      <h3 className="mb-2 mt-4 text-sm font-extrabold">{t('case.contains')}</h3>
      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {items.map((it) => {
            const r = RARITY_STYLE[it.rarity] ?? RARITY_STYLE.common;
            return (
              <div key={it.id} className={`flex flex-col items-center rounded-xl border-b-4 bg-card p-2 text-center ${r.border}`}>
                <ItemIcon item={it} size="text-3xl" />
                <span className="mt-1 line-clamp-1 text-[11px] font-extrabold">{it.name}</span>
                <span className="text-[10px] text-muted">🪙 {fmt(it.value)}</span>
                {typeof it.chance === 'number' && <span className={`text-[10px] font-bold ${r.text}`}>{it.chance}%</span>}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
