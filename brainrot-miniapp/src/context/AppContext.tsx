import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api, getErrorMessage } from '../services/api';
import { applyTelegramColors, haptic, initTelegram } from '../services/telegram';
import { beep } from '../services/sound';
import { dictionaries, type TKey } from '../locales';
import type { Lang, Theme, User, UserSettings } from '../types';

export interface ToastMsg {
  id: number;
  text: string;
  type: 'ok' | 'err';
}

interface Ctx {
  user: User | null;
  loading: boolean;
  error: string | null;
  lang: Lang;
  theme: Theme;
  toasts: ToastMsg[];
  t: (key: TKey, vars?: Record<string, string | number>) => string;
  reload: () => Promise<void>;
  setBalance: (balance: number) => void;
  patchUser: (patch: Partial<User>) => void;
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
  toast: (text: string, type?: 'ok' | 'err') => void;
  sfx: (kind: 'click' | 'win' | 'lose' | 'tick') => void;
}

const AppCtx = createContext<Ctx | null>(null);

const DEFAULTS: UserSettings = { sound: true, streamerMode: false, hideStats: false, language: 'uz', theme: 'dark' };

function readLocal<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const v = localStorage.getItem(key) as T | null;
    return v && allowed.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>(() => readLocal<Lang>('lang', ['uz', 'ru', 'en'], 'uz'));
  const [theme, setTheme] = useState<Theme>(() => readLocal<Theme>('theme', ['dark', 'light'], 'dark'));
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const toastId = useRef(0);
  const soundOn = useRef(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.lang = lang;
    applyTelegramColors(theme);
  }, [theme, lang]);

  useEffect(() => {
    soundOn.current = user?.settings.sound ?? true;
  }, [user?.settings.sound]);

  const toast = useCallback((text: string, type: 'ok' | 'err' = 'ok') => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, text, type }]);
    haptic(type === 'ok' ? 'success' : 'error');
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 2800);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await api.getMe();
      const settings = { ...DEFAULTS, ...me.settings };
      setUser({ ...me, settings });
      setLang(settings.language);
      setTheme(settings.theme);
      localStorage.setItem('lang', settings.language);
      localStorage.setItem('theme', settings.theme);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initTelegram();
    void reload();
  }, [reload]);

  const setBalance = useCallback((balance: number) => {
    setUser((u) => (u ? { ...u, balance } : u));
  }, []);

  const patchUser = useCallback((patch: Partial<User>) => {
    setUser((u) => (u ? { ...u, ...patch } : u));
  }, []);

  const t = useCallback(
    (key: TKey, vars?: Record<string, string | number>) => {
      let s = dictionaries[lang][key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
      return s;
    },
    [lang],
  );

  const updateSettings = useCallback(
    async (patch: Partial<UserSettings>) => {
      // Darhol qo'llaymiz (optimistic), keyin backendga saqlaymiz
      if (patch.language) {
        setLang(patch.language);
        localStorage.setItem('lang', patch.language);
      }
      if (patch.theme) {
        setTheme(patch.theme);
        localStorage.setItem('theme', patch.theme);
      }
      setUser((u) => (u ? { ...u, settings: { ...u.settings, ...patch } } : u));
      try {
        await api.updateSettings(patch);
      } catch (e) {
        toast(`${dictionaries[patch.language ?? lang]['settings.saveError']}: ${getErrorMessage(e)}`, 'err');
      }
    },
    [lang, toast],
  );

  const sfx = useCallback((kind: 'click' | 'win' | 'lose' | 'tick') => beep(kind, soundOn.current), []);

  const value = useMemo<Ctx>(
    () => ({ user, loading, error, lang, theme, toasts, t, reload, setBalance, patchUser, updateSettings, toast, sfx }),
    [user, loading, error, lang, theme, toasts, t, reload, setBalance, patchUser, updateSettings, toast, sfx],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
