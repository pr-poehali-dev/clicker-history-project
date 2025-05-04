
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  cost: number;
  level: number;
  effect: number;
  unlockCoins: number;
  unlocked: boolean;
  maxLevel?: number;
  icon: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (state: GameState) => boolean;
  reward: number;
  icon: string;
  unlocked: boolean;
}

export interface GameState {
  coins: number;
  totalCoins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  lastPlayed: number;
  offlineProgress: boolean;
  achievements: Achievement[];
  upgrades: Upgrade[];
  prestigeLevel: number;
  prestigeMultiplier: number;
  dailyRewardClaimed: boolean;
  dailyRewardLast: number;
}

export const SAVE_KEY = 'cosmic-clicker-save';
export const SAVE_INTERVAL = 10000; // 10 seconds

export const initialUpgrades: Upgrade[] = [
  {
    id: 'clickPower',
    name: 'Сила клика',
    description: 'Увеличивает количество монет за клик',
    baseCost: 10,
    cost: 10,
    level: 0,
    effect: 1,
    unlockCoins: 0,
    unlocked: true,
    icon: 'MousePointer',
  },
  {
    id: 'autoClicker',
    name: 'Автосборщик',
    description: 'Автоматически приносит монеты каждую секунду',
    baseCost: 50,
    cost: 50,
    level: 0,
    effect: 1,
    unlockCoins: 30,
    unlocked: false,
    icon: 'Timer',
  },
  {
    id: 'clickMultiplier',
    name: 'Умножитель клика',
    description: 'Умножает монеты от клика',
    baseCost: 250,
    cost: 250,
    level: 0,
    effect: 0.2,
    unlockCoins: 150,
    unlocked: false,
    icon: 'Plus',
  },
  {
    id: 'asteroidMiner',
    name: 'Астероидный шахтёр',
    description: 'Добывает ресурсы из астероидов',
    baseCost: 1000,
    cost: 1000,
    level: 0,
    effect: 5,
    unlockCoins: 500,
    unlocked: false,
    icon: 'Pickaxe',
  },
  {
    id: 'spaceStation',
    name: 'Космическая станция',
    description: 'Генерирует стабильный поток монет',
    baseCost: 5000,
    cost: 5000,
    level: 0,
    effect: 25,
    unlockCoins: 2500,
    unlocked: false,
    icon: 'Rocket',
  },
  {
    id: 'planetaryBase',
    name: 'Планетарная база',
    description: 'Создает колонию для добычи ресурсов',
    baseCost: 25000,
    cost: 25000,
    level: 0,
    effect: 100,
    unlockCoins: 10000,
    unlocked: false,
    icon: 'Globe',
  },
];

export const initialAchievements: Achievement[] = [
  {
    id: 'firstClick',
    name: 'Первый контакт',
    description: 'Сделайте ваш первый клик',
    condition: (state) => state.totalCoins >= 1,
    reward: 5,
    icon: 'Hand',
    unlocked: false,
  },
  {
    id: 'richBeginner',
    name: 'Зарождающийся капитал',
    description: 'Накопите 100 монет',
    condition: (state) => state.totalCoins >= 100,
    reward: 20,
    icon: 'Wallet',
    unlocked: false,
  },
  {
    id: 'spaceEntrepreneur',
    name: 'Космический предприниматель',
    description: 'Накопите 1000 монет',
    condition: (state) => state.totalCoins >= 1000,
    reward: 100,
    icon: 'TrendingUp',
    unlocked: false,
  },
  {
    id: 'clickMaster',
    name: 'Мастер кликов',
    description: 'Улучшите силу клика до 10 уровня',
    condition: (state) => state.upgrades.find(u => u.id === 'clickPower')?.level === 10,
    reward: 50,
    icon: 'MousePointer',
    unlocked: false,
  },
  {
    id: 'autoIncome',
    name: 'Пассивный доход',
    description: 'Получайте 100 монет в секунду',
    condition: (state) => state.coinsPerSecond >= 100,
    reward: 200,
    icon: 'Clock',
    unlocked: false,
  },
  {
    id: 'spaceIndustry',
    name: 'Космическая индустрия',
    description: 'Накопите 100,000 монет',
    condition: (state) => state.totalCoins >= 100000,
    reward: 1000,
    icon: 'BarChart',
    unlocked: false,
  },
];

export const defaultState: GameState = {
  coins: 0,
  totalCoins: 0,
  coinsPerClick: 1,
  coinsPerSecond: 0,
  lastPlayed: Date.now(),
  offlineProgress: true,
  achievements: initialAchievements,
  upgrades: initialUpgrades,
  prestigeLevel: 0,
  prestigeMultiplier: 1,
  dailyRewardClaimed: false,
  dailyRewardLast: 0,
};
