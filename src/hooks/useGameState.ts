
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  GameState, 
  SAVE_KEY, 
  SAVE_INTERVAL, 
  defaultState 
} from '@/types/game';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(defaultState);
  const [activeTab, setActiveTab] = useState('upgrades');
  const [lastSave, setLastSave] = useState(Date.now());
  const [isNewAchievement, setIsNewAchievement] = useState(false);
  
  const { toast } = useToast();

  // Загрузка игры
  useEffect(() => {
    const savedState = localStorage.getItem(SAVE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState) as GameState;
        // Проверяем офлайн прогресс
        const now = Date.now();
        const offlineTime = (now - parsedState.lastPlayed) / 1000; // в секундах
        
        if (offlineTime > 60 && parsedState.offlineProgress) {
          const offlineCoins = Math.floor(parsedState.coinsPerSecond * Math.min(offlineTime, 24 * 60 * 60)); // максимум 24 часа
          
          if (offlineCoins > 0) {
            parsedState.coins += offlineCoins;
            parsedState.totalCoins += offlineCoins;
            
            setTimeout(() => {
              toast({
                title: "Добро пожаловать обратно!",
                description: `Вы получили ${offlineCoins.toLocaleString()} монет за время отсутствия.`,
                duration: 5000,
              });
            }, 1000);
          }
        }
        
        parsedState.lastPlayed = now;
        setGameState(parsedState);
      } catch (e) {
        console.error('Ошибка при загрузке сохранения:', e);
        setGameState(defaultState);
      }
    }
  }, [toast]);

  // Проверка достижений
  useEffect(() => {
    const checkAchievements = () => {
      let newAchievement = false;
      
      const updatedAchievements = gameState.achievements.map(achievement => {
        if (!achievement.unlocked && achievement.condition(gameState)) {
          newAchievement = true;
          
          setTimeout(() => {
            toast({
              title: `🏆 Достижение разблокировано!`,
              description: `${achievement.name}: +${achievement.reward} монет`,
              duration: 5000,
            });
          }, 300);
          
          // Добавляем награду
          setGameState(prev => ({
            ...prev,
            coins: prev.coins + achievement.reward,
            totalCoins: prev.totalCoins + achievement.reward,
          }));
          
          return { ...achievement, unlocked: true };
        }
        return achievement;
      });
      
      if (newAchievement) {
        setIsNewAchievement(true);
        setTimeout(() => setIsNewAchievement(false), 2000);
        
        setGameState(prev => ({
          ...prev,
          achievements: updatedAchievements,
        }));
      }
    };
    
    checkAchievements();
  }, [gameState.coins, gameState.totalCoins, gameState.upgrades, toast]);

  // Разблокировка апгрейдов
  useEffect(() => {
    if (gameState.totalCoins > 0) {
      const updatedUpgrades = gameState.upgrades.map(upgrade => {
        if (!upgrade.unlocked && gameState.totalCoins >= upgrade.unlockCoins) {
          return { ...upgrade, unlocked: true };
        }
        return upgrade;
      });
      
      if (JSON.stringify(updatedUpgrades) !== JSON.stringify(gameState.upgrades)) {
        setGameState(prev => ({
          ...prev,
          upgrades: updatedUpgrades,
        }));
      }
    }
  }, [gameState.totalCoins, gameState.upgrades]);

  // Автоматическое получение монет
  useEffect(() => {
    if (gameState.coinsPerSecond > 0) {
      const interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          coins: prev.coins + prev.coinsPerSecond,
          totalCoins: prev.totalCoins + prev.coinsPerSecond,
        }));
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [gameState.coinsPerSecond]);

  // Автосохранение
  useEffect(() => {
    const now = Date.now();
    
    // Сохраняем каждые SAVE_INTERVAL мс или при закрытии вкладки
    if (now - lastSave > SAVE_INTERVAL) {
      saveGame();
      setLastSave(now);
    }
    
    const handleBeforeUnload = () => {
      saveGame();
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
      
      // Проверяем, наступил ли новый день (разные даты)
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

  // Сохранение игры
  const saveGame = () => {
    const saveState = {
      ...gameState,
      lastPlayed: Date.now(),
    };
    
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveState));
  };

  // Клик по кнопке
  const handleClick = () => {
    const clickValue = gameState.coinsPerClick;
    
    setGameState(prev => ({
      ...prev,
      coins: prev.coins + clickValue,
      totalCoins: prev.totalCoins + clickValue,
    }));
  };

  // Покупка улучшения
  const buyUpgrade = (upgradeId: string) => {
    const upgradeIndex = gameState.upgrades.findIndex(u => u.id === upgradeId);
    
    if (upgradeIndex === -1 || gameState.coins < gameState.upgrades[upgradeIndex].cost) return;
    
    const updatedUpgrades = [...gameState.upgrades];
    const upgrade = { ...updatedUpgrades[upgradeIndex] };
    
    // Снимаем монеты
    setGameState(prev => ({
      ...prev,
      coins: prev.coins - upgrade.cost,
    }));
    
    // Повышаем уровень и пересчитываем стоимость (экспоненциальный рост)
    upgrade.level += 1;
    upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.level));
    updatedUpgrades[upgradeIndex] = upgrade;
    
    // Обновляем эффекты
    let newCoinsPerClick = gameState.coinsPerClick;
    let newCoinsPerSecond = gameState.coinsPerSecond;
    
    switch (upgradeId) {
      case 'clickPower':
        newCoinsPerClick += 1 * gameState.prestigeMultiplier;
        break;
      case 'autoClicker':
        newCoinsPerSecond += 1 * gameState.prestigeMultiplier;
        break;
      case 'clickMultiplier':
        // Увеличиваем на 20% от базового значения
        newCoinsPerClick = Math.floor(newCoinsPerClick * (1 + upgrade.effect));
        break;
      case 'asteroidMiner':
        newCoinsPerSecond += 5 * gameState.prestigeMultiplier;
        break;
      case 'spaceStation':
        newCoinsPerSecond += 25 * gameState.prestigeMultiplier;
        break;
      case 'planetaryBase':
        newCoinsPerSecond += 100 * gameState.prestigeMultiplier;
        break;
    }
    
    setGameState(prev => ({
      ...prev,
      upgrades: updatedUpgrades,
      coinsPerClick: newCoinsPerClick,
      coinsPerSecond: newCoinsPerSecond,
    }));
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

  // Сброс игры для престижа (будет реализован в следующем обновлении)
  const prestige = () => {
    // Простая заглушка для будущей функциональности
    toast({
      title: "Скоро будет доступно!",
      description: "Система престижа появится в следующем обновлении.",
      duration: 3000,
    });
  };

  // Сброс прогресса
  const resetGame = () => {
    if (confirm('Вы уверены? Весь прогресс будет потерян!')) {
      localStorage.removeItem(SAVE_KEY);
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
    buyUpgrade,
    claimDailyReward,
    prestige,
    resetGame
  };
};
