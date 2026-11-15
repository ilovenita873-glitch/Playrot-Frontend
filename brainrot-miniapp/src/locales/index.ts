import type { Dict, TKey } from './en';
import en from './en';
import uz from './uz';
import ru from './ru';
import type { Lang } from '../types';

export const dictionaries: Record<Lang, Dict> = { uz, ru, en };
export const LANGS: { code: Lang; label: string }[] = [
  { code: 'uz', label: "O'zbekcha" },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
];
export type { TKey };
