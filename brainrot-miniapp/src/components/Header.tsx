import { useApp } from '../context/AppContext';
import { fmt } from '../utils/format';

export default function Header({ onSettings }: { onSettings: () => void }) {
  const { user, t } = useApp();
  if (!user) return null;
  const hide = user.settings.streamerMode;
  const pct = user.maxEnergy > 0 ? Math.min(100, (user.energy / user.maxEnergy) * 100) : 0;
  const name = hide ? '••••••' : `@${user.username}`;

  return (
    <header className="sticky top-0 z-30 border-b border-raise bg-bg/95 px-3 pb-2 pt-[max(env(safe-area-inset-top),10px)] backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand text-lg font-extrabold text-white">
          {user.avatarUrl && !hide ? (
            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            (user.firstName || user.username || '?').charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-extrabold">{name}</span>
            <span className="rounded-md bg-brand px-1.5 py-0.5 text-[11px] font-extrabold text-white">
              {t('common.level')} {user.level}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-raise" role="progressbar" aria-valuenow={user.energy} aria-valuemax={user.maxEnergy}>
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[11px] font-extrabold text-muted">⚡ {user.energy}/{user.maxEnergy}</span>
          </div>
        </div>
        <div className="rounded-xl bg-card px-3 py-1.5 text-sm font-extrabold">🪙 {hide ? '•••' : fmt(user.balance)}</div>
        <button className="chip h-10 w-10 text-base" onClick={onSettings} aria-label="Settings">⚙️</button>
      </div>
    </header>
  );
}
