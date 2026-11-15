const MIN_BET = 1;
const MAX_BET = 100_000;

export const clampBet = (v: number) => Math.min(MAX_BET, Math.max(MIN_BET, Math.round(v * 100) / 100 || MIN_BET));

export default function BetInput({
  value,
  onChange,
  balance,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  balance: number;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          className="input"
          type="number"
          inputMode="decimal"
          min={MIN_BET}
          max={MAX_BET}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          onBlur={() => onChange(clampBet(value))}
        />
        <span className="text-lg">🪙</span>
      </div>
      <div className="flex gap-2">
        {[
          ['½', () => value / 2],
          ['×2', () => value * 2],
          ['MAX', () => Math.min(balance, MAX_BET)],
        ].map(([label, fn]) => (
          <button
            key={label as string}
            type="button"
            disabled={disabled}
            className="chip flex-1 py-1.5 text-xs"
            onClick={() => onChange(clampBet((fn as () => number)()))}
          >
            {label as string}
          </button>
        ))}
      </div>
    </div>
  );
}