import { useState } from 'react';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import SettingsModal from './components/SettingsModal';
import Toast from './components/Toast';
import { ErrorBox, Spinner } from './components/State';
import Home from './pages/Home';
import Games from './pages/Games';
import Farm from './pages/Farm';
import Shop from './pages/Shop';
import Quests from './pages/Quests';
import Profile from './pages/Profile';
import type { PageKey } from './types';

export default function App() {
  const { user, loading, error, reload } = useApp();
  const [page, setPage] = useState<PageKey>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (loading && !user) return <Spinner />;
  if (error && !user) return <ErrorBox message={error} onRetry={reload} />;
  if (!user) return null;

  return (
    <div className="mx-auto min-h-full max-w-md">
      <Header onSettings={() => setSettingsOpen(true)} />
      <main className="pb-24">
        {page === 'home' && <Home />}
        {page === 'games' && <Games />}
        {page === 'farm' && <Farm />}
        {page === 'shop' && <Shop />}
        {page === 'quests' && <Quests />}
        {page === 'profile' && <Profile onSettings={() => setSettingsOpen(true)} />}
      </main>
      <BottomNav page={page} onChange={setPage} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Toast />
    </div>
  );
}
