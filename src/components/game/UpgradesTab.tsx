
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Icon from '@/components/ui/icon';
import { GameState, Upgrade } from '@/types/game';

interface UpgradesTabProps {
  gameState: GameState;
  buyUpgrade: (upgradeId: string) => void;
  prestige: () => void;
}

const UpgradesTab = ({ gameState, buyUpgrade, prestige }: UpgradesTabProps) => {
  return (
    <div className="space-y-4">
      {gameState.upgrades
        .filter(upgrade => upgrade.unlocked)
        .map(upgrade => (
          <UpgradeCard 
            key={upgrade.id}
            upgrade={upgrade}
            coins={gameState.coins}
            onBuy={() => buyUpgrade(upgrade.id)}
          />
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
    </div>
  );
};

interface UpgradeCardProps {
  upgrade: Upgrade;
  coins: number;
  onBuy: () => void;
}

const UpgradeCard = ({ upgrade, coins, onBuy }: UpgradeCardProps) => {
  const getEffectDescription = (upgradeId: string) => {
    switch(upgradeId) {
      case 'clickPower': return '+1 монета за клик';
      case 'autoClicker': return '+1 монета в секунду'; 
      case 'clickMultiplier': return '+20% к силе клика';
      case 'asteroidMiner': return '+5 монет в секунду';
      case 'spaceStation': return '+25 монет в секунду';
      case 'planetaryBase': return '+100 монет в секунду';
      default: return '';
    }
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
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
            <Badge variant={coins >= upgrade.cost ? "default" : "outline"} className="px-2 py-1">
              <Icon name="Coins" className="mr-1 h-4 w-4 text-yellow-500" /> {upgrade.cost.toLocaleString()}
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>{upgrade.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Progress 
          value={(coins / upgrade.cost) * 100} 
          max={100} 
          className="h-2 mb-2" 
        />
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>{getEffectDescription(upgrade.id)}</span>
          <span>{Math.min(100, Math.floor((coins / upgrade.cost) * 100))}%</span>
        </div>
        <Button 
          variant={coins >= upgrade.cost ? "default" : "outline"} 
          className="w-full" 
          onClick={onBuy}
          disabled={coins < upgrade.cost}
        >
          Купить улучшение
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpgradesTab;
