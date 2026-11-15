import { useCallback, useEffect, useRef, useState } from 'react';
import { api, getErrorMessage, rocketMultiplierAt } from '../../services/api';
import type { RocketStart } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { fmt } from '../../utils/format';
import BetInput, { clampBet } from '../../components/BetInput';

type Outcome = { won: boolean; multiplier?: number; crashPoint: number; payout: number } | null;

export default function RocketGame() {
  const { user, setBalance, toast, sfx } = useApp();
  const [bet, setBet] = useState(10);
  const [auto, setAuto] = useState(2);
  const [game, setGame] = useState<RocketStart | null>(null);
  const [mult, setMult] = useState(1);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);

  const offsetRef = useRef(0); // serverTime - clientTime
  const cashingRef = useRef(false);
  const balance = user?.balance ?? 0;

  const cashout = useCallback(
    async (g: RocketStart) => {
      if (cashingRef.current) return;
      cashingRef.current = true;
      try {
        const r = await api.rocketCashout(g.gameId);
        setBalance(r.balance);
        setOutcome({ won: r.won, multiplier: r.multiplier, crashPoint: r.crashPoint, payout: r.payout });
        if (r.won) {
          sfx('win');
          toast(`+${fmt(r.payout)} 🪙`);
        }
      } catch (e) {
        toast(getErrorMessage(e), 'err');
      } finally {
        setGame(null);
        cashingRef.current = false;
      }
    },
    [setBalance, sfx, toast],
  );

  // Koeffitsiyent serverdagi formula bo'yicha mijozda hisoblanadi
  useEffect(() => {
    if (!game) return;
    const start = new Date(game.startedAt).getTime();
    const id = setInterval(() => {
      const m = rocketMultiplierAt(game.growthPerMs, Date.now() + offsetRef.current - start);
      setMult(m);
      if (auto > 1 && m >= auto) void cashout(game); // avto-cashout
    }, 50);
    return () => clearInterval(id);
  }, [game, auto, cashout]);

  const start = async () => {
    const amount = clampBet(bet);
    if (amount > balance) return toast("Balansda mablag' yetarli emas", 'err');
    setBusy(true);
    setOutcome(null);
    setMult(1);
    sfx('click');
    try {
      const g = await api.rocketStart(amount);
      offsetRef.current = new Date(g.serverTime).getTime() - Date.now();
      setBalance(g.balance);
      setGame(g);
    } catch (e) {
      toast(getErrorMessage(e), 'err');
    } finally {
      setBusy(false);
    }
  };

  const playing = !!game;
  const crashed = outcome && !outcome.won;

  return (
    <div className="space-y-3">
      <div className="card p-6 text-center">
        <div className="text-5xl" style={{ transform: playing ? 'translateY(-4px)' : undefined }}>
          {crashed ? '💥' : '🚀'}
        </div>
        <div className={`rocket-mult ${crashed ? 'crashed' : ''}`}>
          {crashed ? outcome!.crashPoint.toFixed(2) : mult.toFixed(2)}x
        </div>
        {playing && (
          <p className="text-sm font-extrabold" style={{ color: 'var(--gold)' }}>
            🪙 {fmt(game!.bet * mult)}
          </p>
        )}
        {outcome?.won && (
          <p className="text-sm font-extrabold" style={{ color: 'var(--cyan)' }}>
            Yutdingiz x{outcome.multiplier?.toFixed(2)} · +🪙 {fmt(outcome.payout)}
          </p>
        )}
        {crashed && <p className="text-sm font-extrabold text-bad">Raketa portladi!</p>}
      </div>

      {!playing && (
        <div className="card space-y-3 p-4">
          <BetInput value={bet} onChange={setBet} balance={balance} disabled={busy} />
          <div>
            <p className="mb-1 text-xs font-bold text-muted">Avto-cashout (0 = o'chiq)</p>
            <input
              className="input"
              type="number"
              step="0.1"
              min={0}
              value={auto}
              onChange={(e) => setAuto(Math.max(0, Number(e.target.value)))}
            />
          </div>
          <button className="btn-primary w-full" disabled={busy} onClick={start}>
            {busy ? '...' : 'BOSHLASH'}
          </button>
        </div>
      )}

      {playing && (
        <button className="btn-gold w-full py-4 text-lg" onClick={() => cashout(game!)}>
          YIG'ISH 🪙 {fmt(game!.bet * mult)}
        </button>
      )}
    </div>
  );
}