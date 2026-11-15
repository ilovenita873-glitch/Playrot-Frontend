import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { LANGS } from '../locales';
import type { Theme } from '../types';

function Toggle({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button onClick={() => onChange(!on)} className="flex w-full items-center justify-between rounded-xl bg-card p-3 text-left" role="switch" aria-checked={on}>
      <span>
        <span className="block text-sm font-extrabold">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
      <span className={`relative h-6 w-11 rounded-full transition ${on ? 'bg-good' : 'bg-raise'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

export default function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, t, updateSettings, lang, theme } = useApp();
  if (!user) return null;
  const s = user.settings;
  const themes: { key: Theme; label: string; icon: string }[] = [
    { key: 'dark', label: t('settings.dark'), icon: '🌙' },
    { key: 'light', label: t('settings.light'), icon: '☀️' },
  ];

  return (
    <Modal open={open} onClose={onClose} title={t('settings.title')}>
      <div className="space-y-2">
        <Toggle on={s.sound} onChange={(v) => void updateSettings({ sound: v })} label={`🔊 ${t('settings.sound')}`} />
        <Toggle on={s.streamerMode} onChange={(v) => void updateSettings({ streamerMode: v })} label={`🎥 ${t('settings.streamer')}`} hint={t('settings.streamerHint')} />
        <Toggle on={s.hideStats} onChange={(v) => void updateSettings({ hideStats: v })} label={`🙈 ${t('settings.hideStats')}`} />

        <div className="rounded-xl bg-card p-3">
          <p className="mb-2 text-sm font-extrabold">🌐 {t('settings.language')}</p>
          <div className="grid grid-cols-3 gap-2">
            {LANGS.map((l) => (
              <button key={l.code} className={`chip py-2 ${lang === l.code ? 'chip-on' : ''}`} onClick={() => void updateSettings({ language: l.code })}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-card p-3">
          <p className="mb-2 text-sm font-extrabold">🎨 {t('settings.theme')}</p>
          <div className="grid grid-cols-2 gap-2">
            {themes.map((th) => (
              <button key={th.key} className={`chip py-2 ${theme === th.key ? 'chip-on' : ''}`} onClick={() => void updateSettings({ theme: th.key })}>
                {th.icon} {th.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
