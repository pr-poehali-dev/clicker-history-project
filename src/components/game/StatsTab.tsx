
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { GameState } from '@/types/game';

interface StatsTabProps {
  gameState: GameState;
  onReset: () => void;
}

const StatsTab = ({ gameState, onReset }: StatsTabProps) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Ваша статистика</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StatRow 
          label="Всего монет заработано:" 
          value={Math.floor(gameState.totalCoins).toLocaleString()} 
        />
        <StatRow 
          label="Куплено улучшений:" 
          value={gameState.upgrades.reduce((acc, upgrade) => acc + upgrade.level, 0).toString()} 
        />
        <StatRow 
          label="Разблокировано достижений:" 
          value={`${gameState.achievements.filter(a => a.unlocked).length} / ${gameState.achievements.length}`} 
        />
        <StatRow 
          label="Уровень престижа:" 
          value={gameState.prestigeLevel.toString()} 
        />
        
        <Button 
          variant="destructive" 
          className="w-full mt-6" 
          onClick={onReset}
        >
          <Icon name="Trash2" className="mr-2" />
          Сбросить прогресс
        </Button>
      </CardContent>
    </Card>
  );
};

interface StatRowProps {
  label: string;
  value: string;
}

const StatRow = ({ label, value }: StatRowProps) => {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
};

export default StatsTab;
