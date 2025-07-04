
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TrendingUp, Share2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import BottleSelector from '@/components/BottleSelector';
import BottleComparisonTable from '@/components/BottleComparisonTable';
import NutritionalGuide from '@/components/NutritionalGuide';
import { BottleWaterData, getUniqueBottles } from '@/data/bottleComparisonData';

const ComparatifBouteilles = () => {
  const [selectedBottles, setSelectedBottles] = useState<BottleWaterData[]>([]);
  const [showTapWater, setShowTapWater] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Charger les bouteilles depuis l'URL au démarrage
  useEffect(() => {
    const bottleIds = searchParams.get('bottles');
    const tapWater = searchParams.get('tapwater') === 'true';
    
    if (bottleIds) {
      const ids = bottleIds.split(',').map(id => parseInt(id.trim()));
      const uniqueBottles = getUniqueBottles();
      const loadedBottles = uniqueBottles.filter(bottle => ids.includes(bottle.id));
      setSelectedBottles(loadedBottles);
    }
    
    setShowTapWater(tapWater);
  }, [searchParams]);

  // Mettre à jour l'URL quand la sélection change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedBottles.length > 0) {
      params.set('bottles', selectedBottles.map(b => b.id).join(','));
    }
    
    if (showTapWater) {
      params.set('tapwater', 'true');
    }
    
    setSearchParams(params);
  }, [selectedBottles, showTapWater, setSearchParams]);

  const handleBottleAdd = (bottle: BottleWaterData) => {
    if (selectedBottles.length >= 3) {
      toast({
        title: "Limite atteinte",
        description: "Vous ne pouvez comparer que 3 bouteilles maximum.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedBottles(prev => [...prev, bottle]);
  };

  const handleBottleRemove = (bottleId: number) => {
    setSelectedBottles(prev => prev.filter(b => b.id !== bottleId));
  };

  const handleReset = () => {
    setSelectedBottles([]);
    setShowTapWater(false);
    setSearchParams({});
  };

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
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <section className="py-12 px-4">
          <div className="container mx-auto">
            {/* En-tête */}
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-2">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                <span>Comparatif des eaux en bouteille</span>
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-4">
                Comparez jusqu'à 3 eaux en bouteille selon leurs caractéristiques : prix, composition minérale, 
                impact environnemental et plus encore.
              </p>
            </div>

            {/* Encart pédagogique */}
            <NutritionalGuide />

            {/* Contrôles */}
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
                  onClick={handleReset}
                  disabled={selectedBottles.length === 0 && !showTapWater}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  disabled={selectedBottles.length === 0}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </Button>
              </div>
            </div>

            {/* Sélecteur de bouteilles */}
            <BottleSelector
              selectedBottles={selectedBottles}
              onBottleAdd={handleBottleAdd}
              onBottleRemove={handleBottleRemove}
            />

            {/* Tableau de comparaison */}
            <BottleComparisonTable
              selectedBottles={selectedBottles}
              showTapWater={showTapWater}
            />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ComparatifBouteilles;
