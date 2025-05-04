
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Achievement } from '@/types/game';

interface AchievementsTabProps {
  achievements: Achievement[];
}

const AchievementsTab = ({ achievements }: AchievementsTabProps) => {
  return (
    <div className="grid grid-cols-1 gap-3">
      {achievements.map(achievement => (
        <AchievementCard 
          key={achievement.id} 
          achievement={achievement} 
        />
      ))}
    </div>
  );
};

interface AchievementCardProps {
  achievement: Achievement;
}

const AchievementCard = ({ achievement }: AchievementCardProps) => {
  return (
    <Card 
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
  );
};

export default AchievementsTab;
