
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Upgrade {
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

interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (state: GameState) => boolean;
  reward: number;
  icon: string;
  unlocked: boolean;
}

interface GameState {
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

const SAVE_KEY = 'cosmic-clicker-save';
const SAVE_INTERVAL = 10000; // 10 seconds

const initialUpgrades: Upgrade[] = [
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

const initialAchievements: Achievement[] = [
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

const defaultState: GameState = {
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

const Index = () => {
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
  }, []);

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
  }, [gameState.coins, gameState.totalCoins, gameState.upgrades]);

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
  }, [gameState.totalCoins]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-100 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-indigo-800">Космический Кликер</h1>
        <p className="text-center text-indigo-600 mb-6">Исследуйте галактику, собирайте ресурсы!</p>
        
        {/* Ресурсы */}
        <Card className="mb-4 shadow-lg border-2 border-indigo-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span>Ваши ресурсы</span>
              <Badge variant="outline" className="text-lg px-4 py-1 bg-indigo-100">
                <Icon name="Coins" className="mr-2 text-yellow-500" /> {Math.floor(gameState.coins).toLocaleString()} монет
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="text-sm text-gray-500 flex justify-between">
                <span>Монет за клик:</span>
                <span className="font-semibold text-indigo-600">{gameState.coinsPerClick.toLocaleString()}</span>
              </div>
              <div className="text-sm text-gray-500 flex justify-between">
                <span>Автоматический доход:</span>
                <span className="font-semibold text-indigo-600">{gameState.coinsPerSecond.toLocaleString()} монет/сек</span>
              </div>
              <div className="text-sm text-gray-500 flex justify-between">
                <span>Всего собрано:</span>
                <span className="font-semibold text-indigo-600">{Math.floor(gameState.totalCoins).toLocaleString()} монет</span>
              </div>
              
              {!gameState.dailyRewardClaimed && (
                <Button 
                  variant="outline" 
                  className="mt-2 border-dashed border-yellow-500 hover:bg-yellow-100"
                  onClick={claimDailyReward}
                >
                  <Icon name="Gift" className="mr-2 text-yellow-500" />
                  Забрать ежедневную награду
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
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
                  onClick={() => {
                    if (confirm('Вы уверены? Весь прогресс будет потерян!')) {
                      localStorage.removeItem(SAVE_KEY);
                      setGameState(defaultState);
                      toast({
                        title: "Игра сброшена",
                        description: "Все данные были удалены",
                        duration: 3000,
                      });
                    }
                  }}
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
