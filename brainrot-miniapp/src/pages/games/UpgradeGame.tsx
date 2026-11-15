import { useState } from 'react';
import { api, getErrorMessage } from '../../services/api';
import type { UpgradeResult } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { fmt } from '../../utils/format';
import BetInput, { clampBet } from '../../components/BetInput';

const MULTIPLIERS = [1.5, 2, 3, 5, 10, 25];
const RTP = 0.95;
const MAX_CHANCE = 0.95;

export default function UpgradeGame() {
  const { user, setBalance, toast, sfx } = useApp();
  const [bet, setBet] = useState(10);
  const [mult, setMult] = useState(2);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<UpgradeResult | null>(null);

  const chance = Math.min(MAX_CHANCE, RTP / mult) * 100;
  const balance = user?.balance ?? 0;

  const play = async () => {
    const amount = clampBet(bet);
    if (amount > balance) return toast('Balansda mablag\' yetarli emas', 'err');
    setBusy(true);
    setRes(null);
    sfx('click');
    try {
      const r = await api.upgrade(amount, mult);
      setRes(r);
      setBalance(r.balance);
      if (r.won) {
        sfx('win');
        toast(`+${fmt(r.payout)} 🪙`);
      }
    } catch (e) {
      toast(getErrorMessage(e), 'err');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="card p-4 text-center">
        <p className="text-xs font-bold text-muted">Yutish ehtimoli</p>
        <p className="h-display text-4xl" style={{ color: 'var(--cyan)' }}>
          {chance.toFixed(2)}%
        </p>
        <div className="mx-auto mt-3 h-3 w-full overflow-hidden rounded-full bg-raise">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${chance}%`, background: 'linear-gradient(90deg,var(--cyan),var(--primary))' }}
          />
        </div>
        <p className="mt-2 text-sm font-extrabold">
          Yutuq: <span style={{ color: 'var(--gold)' }}>🪙 {fmt(clampBet(bet) * mult)}</span>
        </p>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {MULTIPLIERS.map((m) => (
          <button key={m} disabled={busy} className={`chip shrink-0 px-4 py-2 text-sm ${m === mult ? 'chip-on' : ''}`} onClick={() => setMult(m)}>
            x{m}
          </button>
        ))}
      </div>

      <div className="card p-4">
        <BetInput value={bet} onChange={setBet} balance={balance} disabled={busy} />
        <button className="btn-primary mt-3 w-full" disabled={busy} onClick={play}>
          {busy ? '...' : 'UPGRADE'}
        </button>
      </div>

      {res && (
        <div className="card p-4 text-center" style={{ borderColor: res.won ? 'var(--cyan)' : 'var(--rarity-mythic)' }}>
          <p className="h-display text-xl">{res.won ? '🎉 Yutdingiz!' : '💥 Yutqazdingiz'}</p>
          <p className="mt-1 text-sm text-muted">
            Tasodifiy son: {(res.roll * 100).toFixed(2)}% · kerak: &lt; {res.chance.toFixed(2)}%
          </p>
          {res.won && <p className="mt-1 font-extrabold" style={{ color: 'var(--gold)' }}>+🪙 {fmt(res.payout)}</p>}
        </div>
      )}
    </div>
  );
}