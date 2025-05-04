
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Icon from '@/components/ui/icon';
import ResourcesCard from '@/components/ResourcesCard';
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
        <Button 
          size="lg" 
          variant="default" 
          className="w-full py-8 mb-4 text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg transition-transform hover:scale-105 active:scale-95"
          onClick={handleClick}
        >
          <Icon name="MousePointer" className="mr-2 h-6 w-6" />
          Собрать ресурсы!
        </Button>
        
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
          
          {/* Улучшения */}
          <TabsContent value="upgrades" className="space-y-4">
            {gameState.upgrades
              .filter(upgrade => upgrade.unlocked)
              .map(upgrade => (
                <Card key={upgrade.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex justify-between items-center">
                      <div className="flex items-center">
                        <Icon name={upgrade.icon} className="mr-2 text-indigo-600" />
                        <span>{upgrade.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          Ур. {upgrade.level}
                        </Badge>
                        <Badge variant={gameState.coins >= upgrade.cost ? "default" : "outline"} className="px-2 py-1">
                          <Icon name="Coins" className="mr-1 h-4 w-4 text-yellow-500" /> {upgrade.cost.toLocaleString()}
                        </Badge>
                      </div>
                    </CardTitle>
                    <CardDescription>{upgrade.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress 
                      value={(gameState.coins / upgrade.cost) * 100} 
                      max={100} 
                      className="h-2 mb-2" 
                    />
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>
                        {upgrade.id === 'clickPower' && '+1 монета за клик'}
                        {upgrade.id === 'autoClicker' && '+1 монета в секунду'}
                        {upgrade.id === 'clickMultiplier' && '+20% к силе клика'}
                        {upgrade.id === 'asteroidMiner' && '+5 монет в секунду'}
                        {upgrade.id === 'spaceStation' && '+25 монет в секунду'}
                        {upgrade.id === 'planetaryBase' && '+100 монет в секунду'}
                      </span>
                      <span>{Math.min(100, Math.floor((gameState.coins / upgrade.cost) * 100))}%</span>
                    </div>
                    <Button 
                      variant={gameState.coins >= upgrade.cost ? "default" : "outline"} 
                      className="w-full" 
                      onClick={() => buyUpgrade(upgrade.id)}
                      disabled={gameState.coins < upgrade.cost}
                    >
                      Купить улучшение
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
            {gameState.upgrades.filter(upgrade => upgrade.unlocked).length === 0 && (
              <Alert className="bg-indigo-50">
                <Icon name="Info" className="h-4 w-4" />
                <AlertTitle>Нет доступных улучшений</AlertTitle>
                <AlertDescription>
                  Начните кликать, чтобы заработать монеты и разблокировать улучшения.
                </AlertDescription>
              </Alert>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 border-2 border-dashed border-indigo-300"
                    onClick={prestige}
                    disabled={gameState.totalCoins < 1000000}
                  >
                    <Icon name="Sparkles" className="mr-2 text-yellow-500" />
                    Престиж (требуется 1,000,000 монет)
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Сбросьте прогресс, но получите бонус к производству</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TabsContent>
          
          {/* Достижения */}
          <TabsContent value="achievements" className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {gameState.achievements.map(achievement => (
                <Card 
                  key={achievement.id} 
                  className={`shadow-md ${achievement.unlocked ? 'bg-gradient-to-r from-indigo-50 to-purple-50' : 'opacity-80'}`}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-4 ${achievement.unlocked ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Icon name={achievement.icon} className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${achievement.unlocked ? 'text-indigo-800' : 'text-gray-500'}`}>
                          {achievement.name}
                        </h3>
                        <p className="text-sm text-gray-500">{achievement.description}</p>
                      </div>
                      {achievement.unlocked && (
                        <Badge className="ml-2 bg-green-100 text-green-700 hover:bg-green-100">
                          +{achievement.reward}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Статистика */}
          <TabsContent value="stats">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Ваша статистика</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Всего монет заработано:</span>
                  <span className="font-medium">{Math.floor(gameState.totalCoins).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Куплено улучшений:</span>
                  <span className="font-medium">
                    {gameState.upgrades.reduce((acc, upgrade) => acc + upgrade.level, 0)}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Разблокировано достижений:</span>
                  <span className="font-medium">
                    {gameState.achievements.filter(a => a.unlocked).length} / {gameState.achievements.length}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Уровень престижа:</span>
                  <span className="font-medium">{gameState.prestigeLevel}</span>
                </div>
                
                <Button 
                  variant="destructive" 
                  className="w-full mt-6" 
                  onClick={resetGame}
                >
                  <Icon name="Trash2" className="mr-2" />
                  Сбросить прогресс
                </Button>
              </CardContent>
            </Card>
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
