
import { GameState, Upgrade } from '@/types/game';

export interface UseUpgradesResult {
  unlockAvailableUpgrades: (state: GameState) => GameState;
  buyUpgrade: (state: GameState, upgradeId: string) => GameState | null;
}

export const useUpgrades = (): UseUpgradesResult => {
  /**
   * Разблокировка доступных улучшений
   */
  const unlockAvailableUpgrades = (state: GameState): GameState => {
    if (state.totalCoins <= 0) return state;
    
    const updatedUpgrades = state.upgrades.map(upgrade => {
      if (!upgrade.unlocked && state.totalCoins >= upgrade.unlockCoins) {
        return { ...upgrade, unlocked: true };
      }
      return upgrade;
    });
    
    // Проверяем, есть ли изменения
    if (JSON.stringify(updatedUpgrades) !== JSON.stringify(state.upgrades)) {
      return {
        ...state,
        upgrades: updatedUpgrades
      };
    }
    
    return state;
  };
  
  /**
   * Покупка улучшения
   */
  const buyUpgrade = (state: GameState, upgradeId: string): GameState | null => {
    const upgradeIndex = state.upgrades.findIndex(u => u.id === upgradeId);
    
    // Проверяем, можно ли купить улучшение
    if (upgradeIndex === -1 || state.coins < state.upgrades[upgradeIndex].cost) {
      return null;
    }
    
    const updatedUpgrades = [...state.upgrades];
    const upgrade = { ...updatedUpgrades[upgradeIndex] };
    
    // Снимаем стоимость улучшения
    const updatedCoins = state.coins - upgrade.cost;
    
    // Повышаем уровень и пересчитываем стоимость
    upgrade.level += 1;
    upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.level));
    updatedUpgrades[upgradeIndex] = upgrade;
    
    // Обновляем эффекты улучшения
    const updatedEffects = calculateUpgradeEffects(state, upgrade);
    
    return {
      ...state,
      coins: updatedCoins,
      upgrades: updatedUpgrades,
      coinsPerClick: updatedEffects.newCoinsPerClick,
      coinsPerSecond: updatedEffects.newCoinsPerSecond
    };
  };
  
  /**
   * Вычисление эффектов от улучшения
   */
  const calculateUpgradeEffects = (
    state: GameState,
    upgrade: Upgrade
  ): {
    newCoinsPerClick: number;
    newCoinsPerSecond: number;
  } => {
    let newCoinsPerClick = state.coinsPerClick;
    let newCoinsPerSecond = state.coinsPerSecond;
    
    switch (upgrade.id) {
      case 'clickPower':
        newCoinsPerClick += 1 * state.prestigeMultiplier;
        break;
      case 'autoClicker':
        newCoinsPerSecond += 1 * state.prestigeMultiplier;
        break;
      case 'clickMultiplier':
        // Увеличиваем на 20% от базового значения
        newCoinsPerClick = Math.floor(newCoinsPerClick * (1 + upgrade.effect));
        break;
      case 'asteroidMiner':
        newCoinsPerSecond += 5 * state.prestigeMultiplier;
        break;
      case 'spaceStation':
        newCoinsPerSecond += 25 * state.prestigeMultiplier;
        break;
      case 'planetaryBase':
        newCoinsPerSecond += 100 * state.prestigeMultiplier;
        break;
    }
    
    return { newCoinsPerClick, newCoinsPerSecond };
  };
  
  return {
    unlockAvailableUpgrades,
    buyUpgrade
  };
};
