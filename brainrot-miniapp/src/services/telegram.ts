export const tg = (): TelegramWebApp | undefined => window.Telegram?.WebApp;

/** Backend ga yuboriladigan xom initData satri */
export function getInitData(): string {
  return tg()?.initData || import.meta.env.VITE_DEV_INIT_DATA || '';
}

export function isInsideTelegram(): boolean {
  return Boolean(tg()?.initData);
}

export function initTelegram(): void {
  const app = tg();
  if (!app) return;
  app.ready();
  app.expand();
  app.disableVerticalSwipes?.();
}

export function applyTelegramColors(theme: 'dark' | 'light'): void {
  const app = tg();
  if (!app) return;
  const color = theme === 'dark' ? '#140E2B' : '#F7F4FF';
  app.setHeaderColor?.(color);
  app.setBackgroundColor?.(color);
}

export function haptic(kind: 'light' | 'success' | 'error' = 'light'): void {
  const h = tg()?.HapticFeedback;
  if (!h) return;
  if (kind === 'light') h.impactOccurred('light');
  else h.notificationOccurred(kind);
}
