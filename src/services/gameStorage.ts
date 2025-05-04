
import { GameState, SAVE_KEY, defaultState } from '@/types/game';

/**
 * Сервис для работы с хранилищем игровых данных
 */
export const gameStorage = {
  /**
   * Загрузка состояния игры из localStorage
   */
  loadGame: (): GameState | null => {
    const savedState = localStorage.getItem(SAVE_KEY);
    if (!savedState) return null;
    
    try {
      return JSON.parse(savedState) as GameState;
    } catch (e) {
      console.error('Ошибка при загрузке сохранения:', e);
      return null;
    }
  },
  
  /**
   * Сохранение состояния игры в localStorage
   */
  saveGame: (state: GameState): void => {
    const saveState = {
      ...state,
      lastPlayed: Date.now(),
    };
    
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveState));
  },
  
  /**
   * Удаление сохранения игры
   */
  clearGame: (): void => {
    localStorage.removeItem(SAVE_KEY);
  },
  
  /**
   * Расчет офлайн-прогресса
   */
  calculateOfflineProgress: (state: GameState): { 
    updatedState: GameState; 
    offlineCoins: number;
  } => {
    const now = Date.now();
    const offlineTime = (now - state.lastPlayed) / 1000; // в секундах
    
    // Нет офлайн-прогресса или он отключен
    if (offlineTime <= 60 || !state.offlineProgress) {
      return { 
        updatedState: { ...state, lastPlayed: now }, 
        offlineCoins: 0 
      };
    }
    
    // Ограничиваем 24 часами максимум
    const maxOfflineTime = Math.min(offlineTime, 24 * 60 * 60);
    const offlineCoins = Math.floor(state.coinsPerSecond * maxOfflineTime);
    
    if (offlineCoins <= 0) {
      return { 
        updatedState: { ...state, lastPlayed: now }, 
        offlineCoins: 0 
      };
    }
    
    // Добавляем монеты
    const updatedState = {
      ...state,
      coins: state.coins + offlineCoins,
      totalCoins: state.totalCoins + offlineCoins,
      lastPlayed: now
    };
    
    return { updatedState, offlineCoins };
  }
};
