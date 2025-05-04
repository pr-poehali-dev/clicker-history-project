
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { GameState } from '@/types/game';

export interface UseAchievementsResult {
  isNewAchievement: boolean;
  checkAchievements: (state: GameState) => { 
    updatedState: GameState; 
    achievementUnlocked: boolean;
  };
}

export const useAchievements = () => {
  const [isNewAchievement, setIsNewAchievement] = useState(false);
  const { toast } = useToast();
  
  /**
   * Проверка достижений на разблокировку
   */
  const checkAchievements = (state: GameState) => {
    let achievementUnlocked = false;
    
    const updatedAchievements = state.achievements.map(achievement => {
      if (!achievement.unlocked && achievement.condition(state)) {
        achievementUnlocked = true;
        
        setTimeout(() => {
          toast({
            title: `🏆 Достижение разблокировано!`,
            description: `${achievement.name}: +${achievement.reward} монет`,
            duration: 5000,
          });
        }, 300);
        
        return { ...achievement, unlocked: true };
      }
      return achievement;
    });
    
    if (achievementUnlocked) {
      setIsNewAchievement(true);
      setTimeout(() => setIsNewAchievement(false), 2000);
      
      // Подсчитываем награду за все разблокированные достижения
      const rewardTotal = state.achievements.reduce((total, achievement, index) => {
        if (!achievement.unlocked && updatedAchievements[index].unlocked) {
          return total + achievement.reward;
        }
        return total;
      }, 0);
      
      // Обновляем состояние с наградами и разблокированными достижениями
      const updatedState = {
        ...state,
        coins: state.coins + rewardTotal,
        totalCoins: state.totalCoins + rewardTotal,
        achievements: updatedAchievements
      };
      
      return { updatedState, achievementUnlocked };
    }
    
    return { updatedState: state, achievementUnlocked: false };
  };
  
  return {
    isNewAchievement,
    checkAchievements
  };
};
