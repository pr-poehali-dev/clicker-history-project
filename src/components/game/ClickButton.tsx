
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ClickButtonProps {
  onClick: () => void;
}

const ClickButton = ({ onClick }: ClickButtonProps) => {
  return (
    <Button 
      size="lg" 
      variant="default" 
      className="w-full py-8 mb-4 text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg transition-transform hover:scale-105 active:scale-95"
      onClick={onClick}
    >
      <Icon name="MousePointer" className="mr-2 h-6 w-6" />
      Собрать ресурсы!
    </Button>
  );
};

export default ClickButton;
