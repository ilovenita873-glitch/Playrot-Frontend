import { useState } from 'react';
import { useApp } from '../context/AppContext';
import UpgradeGame from './games/UpgradeGame';
import RocketGame from './games/Rocketgame';
import MinesGame from './games/MinesGame';

type GameKey = 'upgrade' | 'rocket' | 'mines';

const GAMES: { key: GameKey; icon: string; label: string }[] = [
  { key: 'upgrade', icon: '⬆️', label: 'Upgrade' },
  { key: 'rocket', icon: '🚀', label: 'Raketa' },
  { key: 'mines', icon: '💣', label: 'Mines' },
];

export default function Games() {
  const { sfx } = useApp();
  const [game, setGame] = useState<GameKey>('upgrade');

  return (
    <div className="py-3">
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
        {GAMES.map((g) => (
          <button
            key={g.key}
            onClick={() => {
              sfx('click');
              setGame(g.key);
            }}
            className={`chip shrink-0 px-4 py-2 text-sm ${game === g.key ? 'chip-on' : ''}`}
          >
            {g.icon} {g.label}
          </button>
        ))}
      </div>
      <div className="px-4">
        {game === 'upgrade' && <UpgradeGame />}
        {game === 'rocket' && <RocketGame />}
        {game === 'mines' && <MinesGame />}
      </div>
    </div>
  );
}