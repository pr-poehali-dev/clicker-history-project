
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [coins, setCoins] = useState<number>(0);
  const [coinsPerClick, setCoinsPerClick] = useState<number>(1);
  const [autoClickerCount, setAutoClickerCount] = useState<number>(0);
  const [upgradeCost, setUpgradeCost] = useState<number>(10);
  const [autoClickerCost, setAutoClickerCost] = useState<number>(50);
  
  // Автокликер работает каждую секунду
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoClickerCount > 0) {
        setCoins(prev => prev + autoClickerCount);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [autoClickerCount]);
  
  const handleClick = () => {
    setCoins(coins + coinsPerClick);
  };
  
  const buyUpgrade = () => {
    if (coins >= upgradeCost) {
      setCoins(coins - upgradeCost);
      setCoinsPerClick(coinsPerClick + 1);
      setUpgradeCost(Math.floor(upgradeCost * 1.5));
    }
  };
  
  const buyAutoClicker = () => {
    if (coins >= autoClickerCost) {
      setCoins(coins - autoClickerCost);
      setAutoClickerCount(autoClickerCount + 1);
      setAutoClickerCost(Math.floor(autoClickerCost * 1.7));
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-100 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6 text-indigo-800">Космический Кликер</h1>
        
        <Card className="mb-6 shadow-lg border-2 border-indigo-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span>Ваши ресурсы</span>
              <Badge variant="outline" className="text-lg px-4 py-1 bg-indigo-100">
                <Icon name="Coins" className="mr-2 text-yellow-500" /> {coins.toLocaleString()} монет
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="text-sm text-gray-500 flex justify-between">
                <span>Монет за клик:</span>
                <span className="font-semibold text-indigo-600">{coinsPerClick}</span>
              </div>
              <div className="text-sm text-gray-500 flex justify-between">
                <span>Автоматический доход:</span>
                <span className="font-semibold text-indigo-600">{autoClickerCount} монет/сек</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Button 
          size="lg" 
          variant="default" 
          className="w-full py-8 mb-6 text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg transition-transform hover:scale-105"
          onClick={handleClick}
        >
          <Icon name="Click" fallback="MousePointer" className="mr-2 h-6 w-6" />
          Кликнуть!
        </Button>
        
        <div className="grid grid-cols-1 gap-4">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between">
                <span>Улучшить силу клика</span>
                <Badge variant={coins >= upgradeCost ? "default" : "outline"} className="px-2 py-1">
                  <Icon name="Coins" className="mr-1 h-4 w-4 text-yellow-500" /> {upgradeCost}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={(coins / upgradeCost) * 100} max={100} className="h-2 mb-2" />
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>+1 монета за клик</span>
                <span>{Math.floor((coins / upgradeCost) * 100)}%</span>
              </div>
              <Button 
                variant={coins >= upgradeCost ? "default" : "outline"} 
                className="w-full" 
                onClick={buyUpgrade}
                disabled={coins < upgradeCost}
              >
                Купить улучшение
              </Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between">
                <span>Купить автосборщик</span>
                <Badge variant={coins >= autoClickerCost ? "default" : "outline"} className="px-2 py-1">
                  <Icon name="Coins" className="mr-1 h-4 w-4 text-yellow-500" /> {autoClickerCost}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={(coins / autoClickerCost) * 100} max={100} className="h-2 mb-2" />
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>+1 монета в секунду</span>
                <span>{Math.floor((coins / autoClickerCost) * 100)}%</span>
              </div>
              <Button 
                variant={coins >= autoClickerCost ? "default" : "outline"} 
                className="w-full" 
                onClick={buyAutoClicker}
                disabled={coins < autoClickerCost}
              >
                Купить автосборщик
              </Button>
            </CardContent>
          </Card>
        </div>
        
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
