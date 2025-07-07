import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TrendingUp, Share2, RotateCcw, Star, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useFavorites } from '@/hooks/useFavorites';
import Layout from '@/components/Layout';
import BottleSelector from '@/components/BottleSelector';
import BottleComparisonTable from '@/components/BottleComparisonTable';
import NutritionalGuide from '@/components/NutritionalGuide';
import { BottleWaterData, getUniqueBottles } from '@/data/bottleComparisonData';
import { WaterData } from '@/data/bottleWaterData';

const ComparatifBouteilles = () => {
  const [selectedBottles, setSelectedBottles] = useState<BottleWaterData[]>([]);
  const [showTapWater, setShowTapWater] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

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

  // Conversion function pour les favorites
  const convertBottleWaterDataToWaterData = (bottle: BottleWaterData): WaterData => {
    return {
      id: bottle.id.toString(),
      name: bottle.nom_bouteille,
      type: bottle.type_eau,
      source: bottle.source || 'Non spécifiée',
      price: bottle.prix_litre,
      co2: bottle.empreinte_carbone || 0,
      composition: {
        nitrates: bottle.nitrates,
        sodium: bottle.sodium,
        calcium: bottle.calcium,
        magnesium: bottle.magnesium,
        residusSec: bottle.residu_sec
      },
      producer: bottle.marque,
      packaging: bottle.materiau_emballage,
      volumeAnnuel: bottle.volume_production_annuel || 0
    };
  };

  const handleToggleFavorite = (bottle: BottleWaterData) => {
    const bottleId = bottle.id.toString();
    if (isFavorite(bottleId)) {
      removeFromFavorites(bottleId);
    } else {
      const waterData = convertBottleWaterDataToWaterData(bottle);
      addToFavorites(waterData);
    }
  };

  const isBottleFavorite = (bottleId: number) => {
    return isFavorite(bottleId.toString());
  };

  // Conversion des favoris pour l'affichage
  const favoritesAsBottleWaterData: BottleWaterData[] = favorites.map(favorite => ({
    id: parseInt(favorite.id),
    marque: favorite.producer,
    nom_bouteille: favorite.name,
    type_eau: favorite.type,
    source: favorite.source,
    format: '1L', // valeur par défaut
    materiau_emballage: favorite.packaging,
    prix_litre: favorite.price,
    nitrates: favorite.composition.nitrates,
    sodium: favorite.composition.sodium,
    calcium: favorite.composition.calcium,
    magnesium: favorite.composition.magnesium,
    residu_sec: favorite.composition.residusSec,
    empreinte_carbone: favorite.co2,
    volume_production_annuel: favorite.volumeAnnuel,
    disponibilite_geographique: 'France', // valeur par défaut
    certifications: [], // valeur par défaut
    ph: 7, // valeur par défaut
    tds: favorite.composition.residusSec,
    fluorures: 0, // valeur par défaut
    sulfates: 0, // valeur par défaut
    bicarbonates: 0 // valeur par défaut
  }));

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

            {/* Onglets améliorés */}
            <Tabs defaultValue="comparison" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 h-14 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200">
                <TabsTrigger 
                  value="comparison" 
                  className="flex items-center space-x-2 text-base font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                >
                  <Scale className="w-5 h-5" />
                  <span>Comparaison</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="favorites" 
                  className="flex items-center space-x-2 text-base font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                >
                  <Star className="w-5 h-5" />
                  <span>Favoris ({favorites.length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comparison">
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
                  onToggleFavorite={handleToggleFavorite}
                  onRemoveFavorite={(bottleId) => removeFromFavorites(bottleId.toString())}
                  isFavorite={isBottleFavorite}
                />
              </TabsContent>

              <TabsContent value="favorites">
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg text-gray-500 mb-2">Aucune bouteille en favori pour le moment.</p>
                    <p className="text-sm text-gray-400">
                      Ajoutez des bouteilles en favoris depuis l'onglet Comparaison.
                    </p>
                  </div>
                ) : (
                  <BottleComparisonTable
                    selectedBottles={favoritesAsBottleWaterData}
                    showTapWater={false}
                    onToggleFavorite={handleToggleFavorite}
                    onRemoveFavorite={(bottleId) => removeFromFavorites(bottleId.toString())}
                    isFavorite={isBottleFavorite}
                    showFavoriteControls={true}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ComparatifBouteilles;
