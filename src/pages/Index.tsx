
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ResourcesCard from '@/components/ResourcesCard';
import ClickButton from '@/components/game/ClickButton';
import UpgradesTab from '@/components/game/UpgradesTab';
import AchievementsTab from '@/components/game/AchievementsTab';
import StatsTab from '@/components/game/StatsTab';
import { useGameState } from '@/hooks/useGameState';

const Index = () => {
  const {
    gameState,
    activeTab,
    isNewAchievement,
    setActiveTab,
    handleClick,
    buyUpgrade,
    claimDailyReward,
    prestige,
    resetGame
  } = useGameState();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-100 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-indigo-800">Космический Кликер</h1>
        <p className="text-center text-indigo-600 mb-6">Исследуйте галактику, собирайте ресурсы!</p>
        
        {/* Ресурсы */}
        <ResourcesCard 
          gameState={gameState} 
          onClaimDailyReward={claimDailyReward} 
        />
        
        {/* Кнопка клика */}
        <ClickButton onClick={handleClick} />
        
        {/* Табы */}
        <Tabs defaultValue="upgrades" value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="upgrades" className="relative">
              Улучшения
              {gameState.upgrades.some(u => u.unlocked && gameState.coins >= u.cost) && (
                <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0 bg-red-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="achievements" className="relative">
              Достижения
              {isNewAchievement && (
                <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0 bg-red-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="stats">
              Статистика
            </TabsTrigger>
          </TabsList>
          
          {/* Содержимое вкладок */}
          <TabsContent value="upgrades">
            <UpgradesTab 
              gameState={gameState} 
              buyUpgrade={buyUpgrade} 
              prestige={prestige} 
            />
          </TabsContent>
          
          <TabsContent value="achievements">
            <AchievementsTab achievements={gameState.achievements} />
          </TabsContent>
          
          <TabsContent value="stats">
            <StatsTab gameState={gameState} onReset={resetGame} />
          </TabsContent>
        </Tabs>
        
        <Separator className="my-6" />
        
        <footer className="text-center text-gray-500 text-sm">
          <p>Нажимайте на кнопку, чтобы добывать монеты. Используйте монеты для покупки улучшений.</p>
          <p className="mt-2">Ваш космический программист Юра 🚀</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
