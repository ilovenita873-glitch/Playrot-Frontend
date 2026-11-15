import axios, { AxiosError } from 'axios';
import { getInitData } from './telegram';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/** initData `Authorization: tma <initData>` ko'rinishida yuboriladi. */
http.interceptors.request.use((config) => {
  const initData = getInitData();
  if (initData) config.headers.set('Authorization', `tma ${initData}`);
  return config;
});

/* ───────────────────────── Tiplar (backend javoblari) ───────────────────────── */

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string; details?: unknown };
}

export interface EnergyState {
  current: number;
  max: number;
  secondsToNext: number;
}

export interface User {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  balance: number;
  energy: number;
  maxEnergy: number;
  lastEnergyUpdate: string;
  language: 'uz' | 'ru' | 'en';
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  soundVolume: number;
  streamerMode: boolean;
  hideStats: boolean;
  lowEffects: boolean;
  baseLevel: number;
  lastFarmCollect: string;
  createdAt: string;
}

export interface ProfileResponse {
  user: User;
  energy: EnergyState;
  serverTime: string;
}

export type UserSettings = Pick<
  User,
  'language' | 'theme' | 'soundEnabled' | 'soundVolume' | 'streamerMode' | 'hideStats' | 'lowEffects'
>;

export interface Item {
  id: string;
  name: string;
  type: 'PET' | 'ITEM';
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  value: number;
  imageUrl: string | null;
}

export interface CaseItemInfo {
  itemId: string;
  name: string;
  type: Item['type'];
  rarity: Item['rarity'];
  value: number;
  imageUrl: string | null;
  chance: number; // %
}

export interface CaseBox {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  rtp: number | null;
  items: CaseItemInfo[];
}

export interface DropResult {
  itemId: string;
  name: string;
  type: Item['type'];
  rarity: Item['rarity'];
  value: number;
  imageUrl: string | null;
}

export interface OpenCaseResult {
  drops: DropResult[];
  totalCost: number;
  totalValue: number;
  balance: number;
}

export interface UpgradeResult {
  gameId: string;
  won: boolean;
  stake: number;
  multiplier: number;
  chance: number; // %
  roll: number;
  payout: number;
  balance: number;
}

export interface RocketStart {
  gameId: string;
  bet: number;
  startedAt: string;
  serverTime: string;
  growthPerMs: number;
  balance: number;
}

export interface RocketCashout {
  won: boolean;
  multiplier?: number;
  crashPoint: number;
  payout: number;
  balance: number;
}

export interface MinesState {
  gameId: string;
  bet: number;
  minesCount: number;
  gridSize: number;
  revealed: number[];
  currentMultiplier: number;
  nextMultiplier: number | null;
  potentialPayout: number;
  status: 'ACTIVE' | 'WON' | 'LOST';
  minePositions?: number[];
  payout?: number;
}

export interface MinesStart {
  state: MinesState;
  balance: number;
}

export interface MinesReveal {
  hit: boolean;
  tile: number;
  state: MinesState;
  balance: number;
}

export interface MinesCashout {
  state: MinesState;
  balance: number;
}

export interface FarmCollectResult {
  collected: number;
  balance: number;
  energy: EnergyState;
  incomePerHour: number;
}

export interface FarmTopRow {
  rank: number;
  username: string;
  score: number | null;
  baseLevel: number | null;
  isMe: boolean;
}

export interface FarmTopResult {
  weekStart: string;
  weekEnd: string;
  top: FarmTopRow[];
  me: { rank: number | null; score: number };
}

export interface InventoryRow {
  itemId: string;
  quantity: number;
  acquiredAt: string;
  sellPrice: number;
  item: Item;
}

export interface ShopItem {
  shopItemId: string;
  price: number;
  stock: number | null;
  item: Item;
}

export interface ShopBuyResult {
  item: Item;
  quantity: number;
  totalPrice: number;
  balance: number;
}

export interface Quest {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  metric: 'OPEN_CASES' | 'PLAY_GAMES' | 'COLLECT_FARM' | 'DAILY_LOGIN' | 'TELEGRAM_CHANNEL';
  target: number;
  reward: number;
  isDaily: boolean;
  link: string | null;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  meta: unknown;
  createdAt: string;
}

/* ───────────────────────── Yordamchilar ───────────────────────── */

export function getErrorMessage(err: unknown): string {
  const e = err as AxiosError<ApiEnvelope<unknown>>;
  if (e.response?.data?.error?.message) return e.response.data.error.message;
  if (e.code === 'ERR_NETWORK') return "Server bilan aloqa yo'q / No connection";
  if (e.response?.status === 401) return 'Unauthorized';
  if (e.response?.status === 429) return 'Too many requests';
  return e.message || 'Error';
}

export function getErrorCode(err: unknown): string | undefined {
  return (err as AxiosError<ApiEnvelope<unknown>>).response?.data?.error?.code;
}

async function get<T>(url: string): Promise<T> {
  const res = await http.get<ApiEnvelope<T>>(url);
  return res.data.data;
}
async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await http.post<ApiEnvelope<T>>(url, body ?? {});
  return res.data.data;
}
async function patch<T>(url: string, body?: unknown): Promise<T> {
  const res = await http.patch<ApiEnvelope<T>>(url, body ?? {});
  return res.data.data;
}

/** Rocket koeffitsiyenti (mijoz tomonda ko'rsatish uchun): m(t) = exp(growthPerMs * t) */
export const rocketMultiplierAt = (growthPerMs: number, elapsedMs: number): number =>
  Math.floor(Math.exp(growthPerMs * Math.max(0, elapsedMs)) * 100) / 100;

/* ───────────────────────── Endpointlar ───────────────────────── */

export const api = {
  // user
  getProfile: () => get<ProfileResponse>('/user/profile'),
  /** Eski kod bilan mos: user + energy + serverTime bitta obyektda */
  getMe: async () => {
    const d = await get<ProfileResponse>('/user/profile');
    return { ...d.user, energyState: d.energy, serverTime: d.serverTime };
  },
  updateSettings: (body: Partial<UserSettings>) => patch<{ user: User }>('/user/settings', body),
  getHistory: (limit = 30, cursor?: string) =>
    get<{ items: Transaction[]; nextCursor: string | null }>(
      `/user/history?limit=${limit}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
    ),

  // cases
  getCases: async () => (await get<{ cases: CaseBox[] }>('/cases')).cases,
  openCase: (caseId: string, count = 1) => post<OpenCaseResult>('/cases/open', { caseId, count }),

  // upgrade
  upgrade: (amount: number, multiplier: number) =>
    post<UpgradeResult>('/games/upgrade', { multiplier, amount }),
  upgradeItem: (itemId: string, multiplier: number) =>
    post<UpgradeResult>('/games/upgrade', { multiplier, itemId }),

  // rocket (crash)
  rocketStart: (bet: number) => post<RocketStart>('/games/rocket', { action: 'start', bet }),
  rocketCashout: (gameId: string) => post<RocketCashout>('/games/rocket', { action: 'cashout', gameId }),

  // mines
  minesStart: (bet: number, minesCount: number) =>
    post<MinesStart>('/games/mines', { action: 'start', bet, minesCount }),
  minesReveal: (gameId: string, tile: number) =>
    post<MinesReveal>('/games/mines', { action: 'reveal', gameId, tile }),
  minesCashout: (gameId: string) => post<MinesCashout>('/games/mines', { action: 'cashout', gameId }),

  // farm
  collectFarm: () => post<FarmCollectResult>('/farm/collect'),
  getFarmTop: (limit = 50) => get<FarmTopResult>(`/farm/top?limit=${limit}`),

  // inventory
  getInventory: async () => (await get<{ items: InventoryRow[] }>('/inventory')).items,
  sellItem: (itemId: string, quantity = 1) =>
    post<{ sold: number; amount: number; balance: number }>('/inventory/sell', { itemId, quantity }),

  // shop
  getShop: async () => (await get<{ items: ShopItem[] }>('/shop')).items,
  buyShopItem: (shopItemId: string, quantity = 1) =>
    post<ShopBuyResult>('/shop/buy', { shopItemId, quantity }),

  // quests
  getQuests: async () => (await get<{ quests: Quest[] }>('/quests')).quests,
  claimQuest: (questId: string) =>
    post<{ questId: string; reward: number; balance: number }>('/quests/complete', { questId }),

  // promocode
  activatePromo: (code: string) =>
    post<{ code: string; reward: number; balance: number }>('/promocode/activate', { code }),
};