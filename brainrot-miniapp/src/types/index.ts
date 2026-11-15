export type Lang = 'uz' | 'ru' | 'en';
export type Theme = 'dark' | 'light';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

/** Backend har doim { success, data } yoki { success:false, error:{message} } qaytaradi */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: { message?: string; code?: string };
}

export interface UserSettings {
  sound: boolean;
  streamerMode: boolean;
  hideStats: boolean;
  language: Lang;
  theme: Theme;
}

export interface UserStats {
  casesOpened: number;
  totalWon: number;
  gamesPlayed: number;
}

export interface User {
  id: string;
  telegramId?: number;
  username: string;
  firstName?: string;
  avatarUrl?: string;
  level: number;
  balance: number;
  energy: number;
  maxEnergy: number;
  settings: UserSettings;
  stats?: UserStats;
}

export interface Item {
  id: string;
  name: string;
  emoji: string;
  image?: string;
  rarity: Rarity;
  value: number;
  chance?: number;
}

export interface CaseBox {
  id: string;
  name: string;
  emoji: string;
  image?: string;
  price: number;
  items?: Item[];
}

export interface LiveDrop {
  id: string;
  username: string;
  item: Item;
  caseName?: string;
}

export interface OpenCaseResult {
  item: Item;
  balance: number;
}

export interface BetResult {
  win: boolean;
  payout: number;
  balance: number;
}

export interface UpgradeResult extends BetResult {
  chance: number;
}

export interface CrashResult extends BetResult {
  crashPoint: number;
}

export interface MinesStart {
  gameId: string;
  balance: number;
}
export interface MinesReveal {
  safe: boolean;
  multiplier: number;
  mines?: number[];
  balance?: number;
}
export interface MinesCashout {
  payout: number;
  balance: number;
  mines?: number[];
}

export interface TowerStart {
  gameId: string;
  balance: number;
}
export interface TowerStep {
  safe: boolean;
  level: number;
  multiplier: number;
  bombColumn?: number;
  balance?: number;
}
export interface TowerCashout {
  payout: number;
  balance: number;
}

export interface BattleResult extends BetResult {
  yourRoll: number;
  opponent: { username: string; roll: number };
}

export interface FarmState {
  energy: number;
  maxEnergy: number;
  pendingCoins: number;
  coinsPerHour: number;
  baseLevel: number;
}
export interface FarmCollectResult {
  collected: number;
  balance: number;
  energy: number;
}

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  description?: string;
  price: number;
  owned?: boolean;
}

export interface Quest {
  id: string;
  title: string;
  reward: number;
  progress: number;
  target: number;
  claimed: boolean;
}

export type PageKey = 'home' | 'games' | 'farm' | 'shop' | 'quests' | 'profile';
export type GameKey = 'upgrade' | 'crash' | 'mines' | 'tower' | 'battle';
