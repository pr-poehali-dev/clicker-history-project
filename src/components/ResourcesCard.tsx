
import { GameState } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ResourcesCardProps {
  gameState: GameState;
  onClaimDailyReward: () => void;
}

const ResourcesCard = ({ gameState, onClaimDailyReward }: ResourcesCardProps) => {
  return (
    <Card className="mb-4 shadow-lg border-2 border-indigo-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>Ваши ресурсы</span>
          <Badge variant="outline" className="text-lg px-4 py-1 bg-indigo-100">
            <Icon name="Coins" className="mr-2 text-yellow-500" /> 
            {Math.floor(gameState.coins).toLocaleString()} монет
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="text-sm text-gray-500 flex justify-between">
            <span>Монет за клик:</span>
            <span className="font-semibold text-indigo-600">
              {gameState.coinsPerClick.toLocaleString()}
            </span>
          </div>
          <div className="text-sm text-gray-500 flex justify-between">
            <span>Автоматический доход:</span>
            <span className="font-semibold text-indigo-600">
              {gameState.coinsPerSecond.toLocaleString()} монет/сек
            </span>
          </div>
          <div className="text-sm text-gray-500 flex justify-between">
            <span>Всего собрано:</span>
            <span className="font-semibold text-indigo-600">
              {Math.floor(gameState.totalCoins).toLocaleString()} монет
            </span>
          </div>
          
          {!gameState.dailyRewardClaimed && (
            <Button 
              variant="outline" 
              className="mt-2 border-dashed border-yellow-500 hover:bg-yellow-100"
              onClick={onClaimDailyReward}
            >
              <Icon name="Gift" className="mr-2 text-yellow-500" />
              Забрать ежедневную награду
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourcesCard;
