
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { SAVE_INTERVAL, defaultState } from '@/types/game';
import { gameStorage } from '@/services/gameStorage';
import { useAchievements } from '@/hooks/useAchievements';
import { useUpgrades } from '@/hooks/useUpgrades';

export const useGameState = () => {
  // Состояние
  const [gameState, setGameState] = useState(defaultState);
  const [activeTab, setActiveTab] = useState('upgrades');
  const [lastSave, setLastSave] = useState(Date.now());
  
  // Хуки и сервисы
  const { toast } = useToast();
  const { isNewAchievement, checkAchievements } = useAchievements();
  const { unlockAvailableUpgrades, buyUpgrade } = useUpgrades();
  
  // Загрузка игры
  useEffect(() => {
    const savedState = gameStorage.loadGame();
    
    if (savedState) {
      // Рассчитываем офлайн-прогресс
      const { updatedState, offlineCoins } = gameStorage.calculateOfflineProgress(savedState);
      
      setGameState(updatedState);
      
      // Показываем уведомление о полученных офлайн-монетах
      if (offlineCoins > 0) {
        setTimeout(() => {
          toast({
            title: "Добро пожаловать обратно!",
            description: `Вы получили ${offlineCoins.toLocaleString()} монет за время отсутствия.`,
            duration: 5000,
          });
        }, 1000);
      }
    }
  }, [toast]);
  
  // Проверка достижений при изменении состояния
  useEffect(() => {
    const { updatedState } = checkAchievements(gameState);
    
    if (updatedState !== gameState) {
      setGameState(updatedState);
    }
  }, [gameState.coins, gameState.totalCoins, gameState.upgrades]);
  
  // Разблокировка апгрейдов при накоплении монет
  useEffect(() => {
    const updatedState = unlockAvailableUpgrades(gameState);
    
    if (updatedState !== gameState) {
      setGameState(updatedState);
    }
  }, [gameState.totalCoins]);
  
  // Автоматическое получение монет
  useEffect(() => {
    if (gameState.coinsPerSecond <= 0) return;
    
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        coins: prev.coins + prev.coinsPerSecond,
        totalCoins: prev.totalCoins + prev.coinsPerSecond,
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gameState.coinsPerSecond]);
  
  // Автосохранение
  useEffect(() => {
    const now = Date.now();
    
    // Сохраняем каждые SAVE_INTERVAL мс
    if (now - lastSave > SAVE_INTERVAL) {
      gameStorage.saveGame(gameState);
      setLastSave(now);
    }
    
    // Сохраняем при закрытии вкладки
    const handleBeforeUnload = () => {
      gameStorage.saveGame(gameState);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [gameState, lastSave]);
  
  // Ежедневная награда
  useEffect(() => {
    const checkDailyReward = () => {
      const now = new Date();
      const lastReward = new Date(gameState.dailyRewardLast);
      
      // Проверяем, наступил ли новый день
      if (
        now.getDate() !== lastReward.getDate() ||
        now.getMonth() !== lastReward.getMonth() ||
        now.getFullYear() !== lastReward.getFullYear()
      ) {
        setGameState(prev => ({ ...prev, dailyRewardClaimed: false }));
      }
    };
    
    checkDailyReward();
  }, [gameState.dailyRewardLast]);
  
  // Клик по кнопке
  const handleClick = () => {
    setGameState(prev => ({
      ...prev,
      coins: prev.coins + prev.coinsPerClick,
      totalCoins: prev.totalCoins + prev.coinsPerClick,
    }));
  };
  
  // Покупка улучшения
  const handleBuyUpgrade = (upgradeId: string) => {
    const updatedState = buyUpgrade(gameState, upgradeId);
    if (updatedState) {
      setGameState(updatedState);
    }
  };
  
  // Получение ежедневной награды
  const claimDailyReward = () => {
    const baseReward = 100 * Math.pow(2, gameState.prestigeLevel);
    
    setGameState(prev => ({
      ...prev,
      coins: prev.coins + baseReward,
      totalCoins: prev.totalCoins + baseReward,
      dailyRewardClaimed: true,
      dailyRewardLast: Date.now(),
    }));
    
    toast({
      title: "Ежедневная награда!",
      description: `Вы получили ${baseReward} монет. Возвращайтесь завтра!`,
      duration: 5000,
    });
  };
  
  // Сброс игры для престижа (заглушка для будущей функциональности)
  const prestige = () => {
    toast({
      title: "Скоро будет доступно!",
      description: "Система престижа появится в следующем обновлении.",
      duration: 3000,
    });
  };
  
  // Сброс прогресса
  const resetGame = () => {
    if (confirm('Вы уверены? Весь прогресс будет потерян!')) {
      gameStorage.clearGame();
      setGameState(defaultState);
      toast({
        title: "Игра сброшена",
        description: "Все данные были удалены",
        duration: 3000,
      });
    }
  };
  
  return {
    gameState,
    activeTab,
    isNewAchievement,
    setActiveTab,
    handleClick,
    buyUpgrade: handleBuyUpgrade,
    claimDailyReward,
    prestige,
    resetGame
  };
};
