
import React from 'react';
import { RotateCcw, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

interface ComparisonControlsProps {
  showTapWater: boolean;
  setShowTapWater: (show: boolean) => void;
  selectedBottlesCount: number;
  onReset: () => void;
}

const ComparisonControls: React.FC<ComparisonControlsProps> = ({
  showTapWater,
  setShowTapWater,
  selectedBottlesCount,
  onReset
}) => {
  const handleShare = async () => {
    const url = window.location.href;
    
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Lien copié !",
        description: "Le lien de comparaison a été copié dans le presse-papiers."
      });
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien. Copiez l'URL manuellement.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
      <div className="flex items-center space-x-2">
        <Switch
          id="tap-water"
          checked={showTapWater}
          onCheckedChange={setShowTapWater}
        />
        <label htmlFor="tap-water" className="text-sm font-medium">
          Comparer avec l'eau du robinet
        </label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={selectedBottlesCount === 0 && !showTapWater}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Réinitialiser
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          disabled={selectedBottlesCount === 0}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Partager
        </Button>
      </div>
    </div>
  );
};

export default ComparisonControls;
