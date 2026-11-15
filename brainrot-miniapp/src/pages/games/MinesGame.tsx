import { useState } from 'react';
import { api, getErrorMessage } from '../../services/api';
import type { MinesState } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { fmt } from '../../utils/format';
import BetInput, { clampBet } from '../../components/BetInput';

const MINE_OPTIONS = [1, 3, 5, 10, 24];

export default function MinesGame() {
  const { user, setBalance, toast, sfx } = useApp();
  const [bet, setBet] = useState(10);
  const [minesCount, setMinesCount] = useState(3);
  const [state, setState] = useState<MinesState | null>(null);
  const [busy, setBusy] = useState(false);
  const balance = user?.balance ?? 0;

  const active = state?.status === 'ACTIVE';
  const finished = !!state && state.status !== 'ACTIVE';

  const start = async () => {
    const amount = clampBet(bet);
    if (amount > balance) return toast("Balansda mablag' yetarli emas", 'err');
    setBusy(true);
    sfx('click');
    try {
      const r = await api.minesStart(amount, minesCount);
      setState(r.state);
      setBalance(r.balance);
    } catch (e) {
      toast(getErrorMessage(e), 'err');
    } finally {
      setBusy(false);
    }
  };

  const reveal = async (tile: number) => {
    if (!state || !active || busy || state.revealed.includes(tile)) return;
    setBusy(true);
    sfx('click');
    try {
      const r = await api.minesReveal(state.gameId, tile);
      setState(r.state);
      setBalance(r.balance);
      if (r.state.status === 'WON') {
        sfx('win');
        toast(`+${fmt(r.state.payout ?? 0)} 🪙`);
      }
    } catch (e) {
      toast(getErrorMessage(e), 'err');
    } finally {
      setBusy(false);
    }
  };

  const cashout = async () => {
    if (!state || !active || busy) return;
    setBusy(true);
    try {
      const r = await api.minesCashout(state.gameId);
      setState(r.state);
      setBalance(r.balance);
      sfx('win');
      toast(`+${fmt(r.state.payout ?? 0)} 🪙`);
    } catch (e) {
      toast(getErrorMessage(e), 'err');
    } finally {
      setBusy(false);
    }
  };

  const gridSize = state?.gridSize ?? 25;
  const cols = Math.round(Math.sqrt(gridSize));

  return (
    <div className="space-y-3">
      <div className="card p-3">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: gridSize }, (_, i) => {
            const isRevealed = state?.revealed.includes(i);
            const isMine = state?.minePositions?.includes(i);
            let cls = 'tile';
            let icon = '';
            if (isRevealed && !isMine) {
              cls += ' tile-safe';
              icon = '💎';
            } else if (finished && isMine) {
              cls += ' tile-mine';
              icon = '💣';
            }
            return (
              <button key={i} className={cls} disabled={!active || busy || !!isRevealed} onClick={() => reveal(i)}>
                {icon}
              </button>
            );
          })}
        </div>
      </div>

      {state && (
        <div className="card flex justify-between p-3 text-sm font-extrabold">
          <span>x{state.currentMultiplier.toFixed(2)}</span>
          <span style={{ color: 'var(--gold)' }}>🪙 {fmt(state.potentialPayout)}</span>
          {state.nextMultiplier && active && <span className="text-muted">keyingi x{state.nextMultiplier.toFixed(2)}</span>}
        </div>
      )}

      {finished && (
        <p className="text-center text-sm font-extrabold" style={{ color: state!.status === 'WON' ? 'var(--cyan)' : 'var(--rarity-mythic)' }}>
          {state!.status === 'WON' ? `🎉 Yutdingiz +${fmt(state!.payout ?? 0)} 🪙` : '💥 Mina! Yutqazdingiz'}
        </p>
      )}

      {active ? (
        <button className="btn-gold w-full py-3" disabled={busy || state!.revealed.length === 0} onClick={cashout}>
          YIG'ISH 🪙 {fmt(state!.potentialPayout)}
        </button>
      ) : (
        <div className="card space-y-3 p-4">
          <BetInput value={bet} onChange={setBet} balance={balance} disabled={busy} />
          <div>
            <p className="mb-1 text-xs font-bold text-muted">Minalar soni</p>
            <div className="flex gap-2">
              {MINE_OPTIONS.map((n) => (
                <button key={n} className={`chip flex-1 py-1.5 text-sm ${n === minesCount ? 'chip-on' : ''}`} onClick={() => setMinesCount(n)}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <button className="btn-primary w-full" disabled={busy} onClick={start}>
            {busy ? '...' : finished ? 'YANA O\'YNASH' : 'BOSHLASH'}
          </button>
        </div>
      )}
    </div>
  );
}