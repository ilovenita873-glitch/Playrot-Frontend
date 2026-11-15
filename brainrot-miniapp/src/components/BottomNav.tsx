import { useApp } from '../context/AppContext';
import type { PageKey } from '../types';
import type { TKey } from '../locales';

const TABS: { key: PageKey; icon: string; label: TKey }[] = [
  { key: 'home', icon: '📦', label: 'nav.home' },
  { key: 'games', icon: '🎮', label: 'nav.games' },
  { key: 'farm', icon: '🌾', label: 'nav.farm' },
  { key: 'shop', icon: '🛒', label: 'nav.shop' },
  { key: 'quests', icon: '📜', label: 'nav.quests' },
  { key: 'profile', icon: '👤', label: 'nav.profile' },
];

export default function BottomNav({ page, onChange }: { page: PageKey; onChange: (p: PageKey) => void }) {
  const { t, sfx } = useApp();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-raise bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-md">
        {TABS.map((tab) => {
          const on = tab.key === page;
          return (
            <li key={tab.key} className="flex-1">
              <button
                onClick={() => {
                  sfx('click');
                  onChange(tab.key);
                }}
                aria-current={on ? 'page' : undefined}
                className={`flex w-full flex-col items-center gap-0.5 py-2 text-[10px] font-extrabold transition ${on ? 'text-brand' : 'text-muted'}`}
              >
                <span className={`text-xl transition ${on ? '-translate-y-0.5 scale-110' : ''}`}>{tab.icon}</span>
                {t(tab.label)}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
